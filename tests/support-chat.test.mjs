import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'

async function serviceModule() {
  const result = await build({ entryPoints: ['src/services/supportChat.js'], bundle: true, write: false, format: 'esm', define: { 'import.meta.env.VITE_API_URL': '"https://api.example.test"' } })
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`)
}

test('chat uses authenticated context and sends no fabricated roles or user identity', async () => {
  const chat = await serviceModule()
  const originalFetch = globalThis.fetch, originalStorage = globalThis.localStorage
  const calls = []
  try {
    globalThis.localStorage = { getItem: () => 'session' }
    globalThis.fetch = async (url, options) => { calls.push({ url, ...options }); return { ok: true, status: 200, json: async () => ({ answer: 'Resposta real' }) } }
    const response = await chat.sendChatMessage('Como está meu perfil?', 'request-id', 'team-id')
    assert.equal(response.answer, 'Resposta real')
    assert.equal(calls[0].url, 'https://api.example.test/ai/chat?companyId=team-id')
    assert.equal(calls[0].headers.Authorization, 'Bearer session')
    assert.deepEqual(JSON.parse(calls[0].body), { message: 'Como está meu perfil?', requestId: 'request-id' })
    await chat.getChatHistory(null)
    assert.equal(calls[1].url, 'https://api.example.test/ai/chat')
    await chat.clearChatHistory('team-id')
    assert.equal(calls[2].method, 'DELETE')
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})

test('chat exposes failures instead of returning a simulated response', async () => {
  const chat = await serviceModule()
  const originalFetch = globalThis.fetch, originalStorage = globalThis.localStorage
  try {
    globalThis.localStorage = { getItem: () => 'session' }
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Aguarde a resposta anterior' }) })
    await assert.rejects(chat.sendChatMessage('Pergunta', 'id', null), /Aguarde a resposta anterior/)
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ message: 'Chave da API Groq não configurada.' }) })
    await assert.rejects(chat.sendChatMessage('Pergunta', 'id', null), /assistente ainda não está disponível/)
    globalThis.fetch = async () => { throw new Error('Sem conexão') }
    await assert.rejects(chat.getChatHistory(null), /Sem conexão/)
  } finally { globalThis.fetch = originalFetch; globalThis.localStorage = originalStorage }
})
