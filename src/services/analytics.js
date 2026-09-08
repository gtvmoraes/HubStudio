import { authFetch } from './api'

const hasToken = () => !!localStorage.getItem('hs-token')

// Anexa companyId na query só quando presente — equipe selecionada no
// ContextSwitcher (ver TeamContext). Ausente = contexto pessoal (default do backend).
const withCompany = (url, companyId) => {
  if (!companyId) return url
  return `${url}${url.includes('?') ? '&' : '?'}companyId=${companyId}`
}

// Todos os endpoints abaixo são reais. NÃO existe fallback mockado: sem sessão
// ou se a request falhar, devolvemos vazio (null / []) e a UI mostra o estado
// vazio correspondente. Fabricar número aqui fazia o dashboard exibir dados
// falsos no primeiro load (antes da API responder) e trocá-los ao recarregar.
const getJson = async (url, companyId, { emptyValue = null } = {}) => {
  if (!hasToken()) return emptyValue
  try {
    const res = await authFetch(withCompany(url, companyId))
    if (!res.ok || res.status === 204) return emptyValue
    return await res.json()
  } catch {
    return emptyValue
  }
}

const getArray = async (url, companyId) => {
  const data = await getJson(url, companyId, { emptyValue: [] })
  return Array.isArray(data) ? data : []
}

// KPIs reais (views/likes/comments/shares agregados das métricas coletadas por rede).
// "Seguidores" não existe em lugar nenhum: nenhuma rede tem coleta de contagem de
// seguidores implementada, então esse KPI foi removido em vez de ser fabricado.
export const getStats = (period = '30d', network = 'all', companyId = null) =>
  getJson(`/analytics/stats?period=${period}&network=${network}`, companyId)

// Seguidores/inscritos somados das 3 redes com contagem rastreada hoje
// (Instagram, TikTok, YouTube via AudienceFollowersService) — network=all soma
// as conectadas, uma rede específica devolve só aquela (breakdown vira 1 item,
// o card esconde a lista já que não há o que detalhar). 204 = nenhuma das 3
// conectada, ou rede filtrada sem contagem (Facebook/LinkedIn/X) → null, e o
// card mostra o estado vazio com CTA de conectar.
export const getAudienceTotal = (period = '30d', network = 'all', companyId = null) =>
  getJson(`/analytics/followers?period=${period}&network=${network}`, companyId)

// Série de engajamento ao longo do tempo (o backend devolve os buckets do
// período, zerados quando não há dado).
export const getEngagementData = (granularity = 'daily', network = 'all', companyId = null) =>
  getArray(`/analytics/engagement?granularity=${granularity}&network=${network}`, companyId)

// Engajamento real (likes+comentários+compartilhamentos) por rede conectada —
// substitui a contagem de seguidores fabricada, que nenhuma rede expõe hoje.
export const getNetworkComparison = (period = '30d', companyId = null) =>
  getArray(`/analytics/network-comparison?period=${period}`, companyId)

// Alcance real por tipo de conteúdo (só Instagram tem contentType rastreado hoje),
// respeitando o período selecionado. Vazio = conta ainda sem alcance coletado.
export const getContentReach = (period = '30d', network = 'all', companyId = null) =>
  getArray(`/analytics/content-reach?network=${network}&period=${period}`, companyId)

// Ranking real de melhores horários pra postar, com base no engajamento médio
// das postagens já publicadas dentro do período. Vazio = sem posts com métrica.
export const getBestTimes = (period = '30d', network = 'all', companyId = null) =>
  getArray(`/analytics/best-times?network=${network}&period=${period}`, companyId)

// Nota geral da conta (0-100): frequência de posts, crescimento de alcance,
// taxa de engajamento e diversidade de redes usadas — tudo derivado de métrica
// real já coletada. 204 = nenhuma conta social conectada ainda.
export const getAccountScore = async (companyId = null) => {
  const data = await getJson('/analytics/account-score', companyId)
  return data && typeof data.score === 'number' ? data : null
}

// Demografia real de seguidores do Instagram (idade/gênero/localização).
// 204 = sem conta Instagram conectada ou sem dado suficiente ainda.
export const getAudience = async (companyId = null) => {
  const data = await getJson('/analytics/audience', companyId)
  return data?.gender ? data : null
}

// Insights da IA para o período selecionado. Vazio = sem posts no período pra
// gerar fato nenhum (a barra de insights some em vez de inventar crescimento).
export const getAiInsights = (period = '30d', companyId = null) =>
  getArray(`/analytics/ai-insights?period=${period}`, companyId)

// MOCK — aguardando backend.
// Único dado fabricado que restou neste arquivo. Quando existir o endpoint,
// trocar por: getArray('/analytics/activity-feed', companyId)
export const getActivityFeed = () => Promise.resolve([
  { id: 1, type: 'publish',   text: 'Post "5 dicas para aumentar seu engajamento" foi publicado', time: 'há 2h' },
  { id: 2, type: 'milestone', text: 'Você ultrapassou 8.500 seguidores no Instagram',             time: 'há 5h' },
  { id: 3, type: 'comment',   text: '23 novos comentários no seu último Reel',                     time: 'há 8h' },
  { id: 4, type: 'connect',   text: 'Conta do YouTube reconectada com sucesso',                   time: 'ontem' },
  { id: 5, type: 'schedule',  text: 'Post "Como criar conteúdo que conecta" foi agendado',        time: 'ontem' },
])
