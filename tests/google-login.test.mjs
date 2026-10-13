import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

async function authModule() {
  const result = await build({ entryPoints: ['src/services/auth.js'], bundle: true, write: false, format: 'esm', define: { 'import.meta.env.VITE_API_URL': '"https://api.example.test"' } })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}

async function identityModule(clientId = '') {
  const source = await readFile(new URL('../src/services/googleIdentity.js', import.meta.url), 'utf8')
  const configured = source.replace('import.meta.env.VITE_GOOGLE_CLIENT_ID', JSON.stringify(clientId))
  return import(`data:text/javascript;base64,${Buffer.from(configured).toString('base64')}`)
}

test('Google login uses the shared Client ID or falls back to the backend', async () => {
  const serverId = '123-shared.apps.googleusercontent.com'
  const configured = await identityModule(` ${serverId} `)
  assert.equal(configured.resolveGoogleClientId(serverId), serverId)
  const fallback = await identityModule()
  assert.equal(fallback.resolveGoogleClientId(serverId), serverId)
})

test('a different Google Client ID in the frontend cannot start a mismatched login', async () => {
  const configured = await identityModule('123-frontend.apps.googleusercontent.com')
  assert.throws(() => configured.resolveGoogleClientId('456-backend.apps.googleusercontent.com'), /indisponível/)
})

test('Google credentials and proofs go only to the backend without prematurely storing a session', async () => {
  const auth = await authModule()
  const originalFetch = globalThis.fetch, originalStorage = globalThis.localStorage
  const stored = new Map(), calls = []
  try {
    globalThis.localStorage = { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) }
    globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return { ok: true, json: async () => ({ requiresAccountLink: true, challengeId: 'challenge' }) } }
    await auth.googleLoginService('google-id-token', 'nonce-request')
    assert.equal(calls[0].url, 'https://api.example.test/auth/google')
    assert.deepEqual(JSON.parse(calls[0].body), { credential: 'google-id-token', challengeId: 'nonce-request' })
    assert.equal(stored.has('hs-token'), false)
    await auth.linkGoogleAccountService('challenge', 'local-password')
    assert.deepEqual(JSON.parse(calls[1].body), { challengeId: 'challenge', currentPassword: 'local-password' })
    await auth.verifyGoogleEmailService('challenge', '123456')
    assert.deepEqual(JSON.parse(calls[2].body), { challengeId: 'challenge', code: '123456' })
    assert.equal(stored.has('hs-token'), false)
    globalThis.fetch = async (url, options) => {
      assert.equal(options.headers.Authorization, 'Bearer server-session')
      return { ok: true, json: async () => ({ name: 'Ana' }) }
    }
    assert.equal((await auth.fetchMe('server-session')).name, 'Ana')
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})

test('unavailable Google login and invalid proofs surface backend errors', async () => {
  const auth = await authModule(), originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Login Google indisponível' }) })
    await assert.rejects(auth.beginGoogleSignIn(), /indisponível/)
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Senha da conta incorreta' }) })
    await assert.rejects(auth.linkGoogleAccountService('challenge', 'wrong'), /Senha da conta incorreta/)
  } finally { globalThis.fetch = originalFetch }
})
