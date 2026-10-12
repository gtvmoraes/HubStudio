import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { authReturnPath, authSwitchPath } from '../src/utils/authRedirect.js'

async function serviceModule(entry) {
  const result = await build({ entryPoints: [entry], bundle: true, write: false, format: 'esm',
    define: { 'import.meta.env.VITE_API_URL': '"https://api.example.test"' } })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}

test('retains invitation through login and signup and rejects external redirects', () => {
  const search = '?returnTo=%2Finvite%2Fabc-123'
  assert.equal(authReturnPath(search), '/invite/abc-123')
  assert.equal(authSwitchPath('/cadastro', search), '/cadastro?returnTo=%2Finvite%2Fabc-123')
  for (const path of ['https://evil.test', '//evil.test', '/invite/abc/extra', '/dashboard']) {
    assert.equal(authReturnPath(`?returnTo=${encodeURIComponent(path)}`), '/dashboard')
  }
})

test('recovery sends real requests and propagates API failures', async () => {
  const { forgotPassword, resetPassword } = await serviceModule('src/services/auth.js')
  const original = globalThis.fetch
  const calls = []
  try {
    globalThis.fetch = async (url, options) => {
      calls.push({ url, ...options }); return { ok: true, status: 204 }
    }
    await forgotPassword(' user@example.test ')
    await forgotPassword('user@example.test')
    await resetPassword('token', 'new-password')
    assert.equal(calls[0].url, 'https://api.example.test/auth/forgot-password')
    assert.deepEqual(JSON.parse(calls[0].body), { email: 'user@example.test' })
    assert.equal(calls[1].url, calls[0].url)
    assert.deepEqual(JSON.parse(calls[2].body), { token: 'token', newPassword: 'new-password' })
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Token expirado' }) })
    await assert.rejects(resetPassword('expired', 'new-password'), /Token expirado/)
    globalThis.fetch = async () => { throw new Error('Sem conexão') }
    await assert.rejects(forgotPassword('user@example.test'), /Sem conexão/)
  } finally { globalThis.fetch = original }
})

test('invite preview is public, acceptance is authenticated and invalid invites surface errors', async () => {
  const { previewInviteApi, acceptInviteApi } = await serviceModule('src/services/team.js')
  const originalFetch = globalThis.fetch
  const originalStorage = globalThis.localStorage
  const calls = []
  try {
    globalThis.localStorage = { getItem: () => 'session-token' }
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url, ...options }); return { ok: true, json: async () => ({ id: 'team' }) }
    }
    await previewInviteApi('abc-123')
    await acceptInviteApi('abc-123')
    assert.equal(calls[0].url, 'https://api.example.test/teams/invites/abc-123')
    assert.equal(calls[0].headers, undefined)
    assert.equal(calls[1].method, 'POST')
    assert.equal(calls[1].headers.Authorization, 'Bearer session-token')
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Convite expirado' }) })
    await assert.rejects(previewInviteApi('expired'), /Convite expirado/)
    await assert.rejects(acceptInviteApi('expired'), /Convite expirado/)
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})
