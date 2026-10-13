import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

async function authModule() {
  const result = await build({ entryPoints: ['src/services/auth.js'], bundle: true, write: false, format: 'esm', define: { 'import.meta.env.VITE_API_URL': '"https://api.example.test"' } })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}

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
