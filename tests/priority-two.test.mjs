import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

async function serviceModule(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm', define: { 'import.meta.env.VITE_API_URL': '"https://api.example.test"' } })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}

test('two-factor login does not create a local session before code verification', async () => {
  const auth = await serviceModule('src/services/auth.js')
  const originalFetch = globalThis.fetch, originalStorage = globalThis.localStorage
  const stored = new Map()
  try {
    globalThis.localStorage = { setItem: (key, value) => stored.set(key, value) }
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ requiresTwoFactor: true, challengeId: 'challenge' }) })
    assert.equal((await auth.loginService('ana@example.test', 'password')).requiresTwoFactor, true)
    assert.equal(stored.has('hs-token'), false)
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Código incorreto' }) })
    await assert.rejects(auth.verifyLogin('challenge', '000000'), /Código incorreto/)
    assert.equal(stored.has('hs-token'), false)
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.example.test/auth/login/verify')
      assert.deepEqual(JSON.parse(options.body), { challengeId: 'challenge', code: '123456' })
      return { ok: true, json: async () => ({ token: 'verified-session' }) }
    }
    await auth.verifyLogin('challenge', '123456')
    assert.equal(stored.get('hs-token'), 'verified-session')
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})

test('account settings use authenticated persistence and propagate failures', async () => {
  const settings = await serviceModule('src/services/settings.js')
  const originalFetch = globalThis.fetch, originalStorage = globalThis.localStorage
  const calls = []
  try {
    globalThis.localStorage = { getItem: () => 'session' }
    globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return { ok: true, status: 204 } }
    await settings.updateProfile({ name: 'Ana', email: 'ana@example.test', timezone: 'America/Sao_Paulo' })
    await settings.changePassword('old-password', 'new-password')
    await settings.revokeSession('session-id')
    await settings.deleteAccount('current-password', 'EXCLUIR')
    assert.equal(calls[0].body.get('name'), 'Ana')
    assert.equal(calls[0].headers['Content-Type'], undefined)
    assert.deepEqual(JSON.parse(calls[1].body), { currentPassword: 'old-password', newPassword: 'new-password' })
    assert.equal(calls[2].method, 'DELETE')
    assert.deepEqual(JSON.parse(calls[3].body), { currentPassword: 'current-password', confirmation: 'EXCLUIR' })
    assert.ok(calls.every(c => c.headers.Authorization === 'Bearer session'))
    globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ message: 'Senha atual incorreta' }) })
    await assert.rejects(settings.changePassword('wrong-password', 'new-password'), /Senha atual incorreta/)
    await assert.rejects(settings.deleteAccount('wrong-password', 'EXCLUIR'), /Senha atual incorreta/)
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})

test('retry retains individual publication results and errors are surfaced', async () => {
  const posts = await serviceModule('src/services/posts.js')
  const originalFetch = globalThis.fetch, originalStorage = globalThis.localStorage
  try {
    globalThis.localStorage = { getItem: () => 'session' }
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.example.test/posts/post-id/retry')
      assert.equal(options.method, 'POST')
      return { ok: true, json: async () => ({ id: 'post-id', status: 'processing', platforms: [
        { platform: 'facebook', status: 'published' }, { platform: 'tiktok', status: 'processing' },
      ] }) }
    }
    const result = await posts.retryPost('post-id')
    assert.equal(result.status, 'processing')
    assert.equal(result.platforms[0].status, 'published')
    assert.equal(result.platforms[1].status, 'processing')
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Sem permissão' }) })
    await assert.rejects(posts.retryPost('post-id'), /Sem permissão/)
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})
