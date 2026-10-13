import { authFetch } from './api'

const chatPath = (companyId) => companyId ? `/ai/chat?companyId=${encodeURIComponent(companyId)}` : '/ai/chat'
const request = async (companyId, method, body, signal) => {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) controller.abort()
  const timeout = setTimeout(abort, 45000)
  try {
    const response = await authFetch(chatPath(companyId), {
      method, signal: controller.signal,
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      const message = error.message || error.error || 'Não foi possível acessar o assistente. Tente novamente.'
      throw new Error(/Groq|chave.*configurad/i.test(message) ? 'O assistente ainda não está disponível. Tente novamente mais tarde.' : message)
    }
    return response.status === 204 ? null : response.json()
  } catch (error) {
    if (error.name === 'AbortError' && !signal?.aborted) throw new Error('A resposta demorou demais. Aguarde um instante e tente novamente.')
    throw error
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export const getChatHistory = (companyId, signal) => request(companyId, 'GET', null, signal)
export const sendChatMessage = (message, requestId, companyId, signal) => request(companyId, 'POST', { message, requestId }, signal)
export const clearChatHistory = (companyId, signal) => request(companyId, 'DELETE', null, signal)
