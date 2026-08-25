import { authFetch } from './api'

const hasToken = () => !!localStorage.getItem('hs-token')

// Anexa companyId na query só quando presente — equipe selecionada no
// ContextSwitcher (ver TeamContext). Ausente = contexto pessoal (default do backend).
const withCompany = (url, companyId) => {
  if (!companyId) return url
  return `${url}${url.includes('?') ? '&' : '?'}companyId=${companyId}`
}

// Modificadores só usados no fallback mock (sem sessão ou falha na API real).
const PERIOD_MULT = {
  '24h': 0.036,
  '7d':  0.25,
  '30d': 1,
  'all': 6.8,
}

const NETWORK_MULT = {
  all:       1,
  instagram: 0.65,
  tiktok:    0.20,
  youtube:   0.10,
  facebook:  0.30,
  linkedin:  0.08,
  twitter:   0.05,
}

const applyMult = (n, period, network) => {
  const m = (PERIOD_MULT[period] ?? 1) * (NETWORK_MULT[network] ?? 1)
  return Math.round(n * m)
}

const fmtK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`

const mockStats = (period, network) => {
  const base = { views: 127800, likes: 23700, comments: 8900, shares: 1400 }
  const changes = { views: '+16.6%', likes: '+21.3%', comments: '+9.4%', shares: '+11.2%' }
  const build = (key) => ({
    value: fmtK(applyMult(base[key], period, network)),
    raw: applyMult(base[key], period, network),
    change: changes[key],
    trend: 'up',
  })
  return { views: build('views'), likes: build('likes'), comments: build('comments'), shares: build('shares') }
}

// KPIs reais (views/likes/comments/shares agregados das métricas coletadas por rede).
// "Seguidores" não existe em lugar nenhum: nenhuma rede tem coleta de contagem de
// seguidores implementada, então esse KPI foi removido em vez de ser fabricado.
export const getStats = async (period = '30d', network = 'all', companyId = null) => {
  if (!hasToken()) return mockStats(period, network)
  try {
    const res = await authFetch(withCompany(`/analytics/stats?period=${period}&network=${network}`, companyId))
    if (!res.ok) return mockStats(period, network)
    return await res.json()
  } catch {
    return mockStats(period, network)
  }
}

const ENGAGEMENT_DAILY = [
  { date: '03/05', views: 28000, likes: 1200, comments: 450 },
  { date: '06/05', views: 31000, likes: 1380, comments: 490 },
  { date: '09/05', views: 27500, likes: 1100, comments: 410 },
  { date: '12/05', views: 34000, likes: 1600, comments: 560 },
  { date: '15/05', views: 38000, likes: 1850, comments: 620 },
  { date: '18/05', views: 33000, likes: 1450, comments: 530 },
  { date: '21/05', views: 41000, likes: 2100, comments: 710 },
  { date: '24/05', views: 36000, likes: 1700, comments: 580 },
  { date: '27/05', views: 44000, likes: 2300, comments: 790 },
  { date: '30/05', views: 39000, likes: 1950, comments: 650 },
  { date: '02/06', views: 46000, likes: 2500, comments: 840 },
]

const ENGAGEMENT_WEEKLY = [
  { date: 'Sem 1', views: 168000, likes: 7800,  comments: 2700 },
  { date: 'Sem 2', views: 195000, likes: 9200,  comments: 3200 },
  { date: 'Sem 3', views: 220000, likes: 10800, comments: 3850 },
  { date: 'Sem 4', views: 248000, likes: 12400, comments: 4300 },
]

const ENGAGEMENT_MONTHLY = [
  { date: 'Jan', views: 720000, likes: 32000, comments: 11500 },
  { date: 'Fev', views: 810000, likes: 36500, comments: 12800 },
  { date: 'Mar', views: 740000, likes: 33200, comments: 11900 },
  { date: 'Abr', views: 890000, likes: 41000, comments: 14200 },
  { date: 'Mai', views: 980000, likes: 47500, comments: 16800 },
]

const mockEngagement = (granularity, network) => {
  const dataset =
    granularity === 'weekly'  ? ENGAGEMENT_WEEKLY  :
    granularity === 'monthly' ? ENGAGEMENT_MONTHLY :
                                ENGAGEMENT_DAILY
  const mult = NETWORK_MULT[network] ?? 1
  return dataset.map(d => ({
    ...d,
    views:    Math.round(d.views    * mult),
    likes:    Math.round(d.likes    * mult),
    comments: Math.round(d.comments * mult),
  }))
}

export const getEngagementData = async (granularity = 'daily', network = 'all', companyId = null) => {
  if (!hasToken()) return mockEngagement(granularity, network)
  try {
    const res = await authFetch(withCompany(`/analytics/engagement?granularity=${granularity}&network=${network}`, companyId))
    if (!res.ok) return mockEngagement(granularity, network)
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : mockEngagement(granularity, network)
  } catch {
    return mockEngagement(granularity, network)
  }
}

const NETWORK_COMPARISON_MOCK = [
  { id: 'instagram', name: 'Instagram',   engagement: 8600, change: '+12.4%', trend: 'up'   },
  { id: 'tiktok',    name: 'TikTok',      engagement: 4200, change: '+24.8%', trend: 'up'   },
  { id: 'youtube',   name: 'YouTube',     engagement: 1800, change: '+6.1%',  trend: 'up'   },
  { id: 'facebook',  name: 'Facebook',    engagement: 3100, change: '+8.3%',  trend: 'up'   },
  { id: 'linkedin',  name: 'LinkedIn',    engagement: 1200, change: '+15.6%', trend: 'up'   },
  { id: 'twitter',   name: 'X (Twitter)', engagement: 912,  change: '-2.3%',  trend: 'down' },
]

// Engajamento real (likes+comentários+compartilhamentos) por rede conectada —
// substitui a contagem de seguidores fabricada, que nenhuma rede expõe hoje.
export const getNetworkComparison = async (period = '30d', companyId = null) => {
  if (!hasToken()) return NETWORK_COMPARISON_MOCK
  try {
    const res = await authFetch(withCompany(`/analytics/network-comparison?period=${period}`, companyId))
    if (!res.ok) return NETWORK_COMPARISON_MOCK
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : NETWORK_COMPARISON_MOCK
  } catch {
    return NETWORK_COMPARISON_MOCK
  }
}

export const getSocialBreakdown = () => Promise.resolve([
  { name: 'Instagram',   value: 65, color: '#4F35E8' },
  { name: 'TikTok',      value: 20, color: '#7C5FE8' },
  { name: 'YouTube',     value: 10, color: '#A78BFA' },
  { name: 'X (Twitter)', value: 5,  color: '#C4B5FD' },
])

const CONTENT_REACH = {
  all: [
    { type: 'Reels',     value: 62, color: 'rgba(79,53,232,1.00)' },
    { type: 'Carrossel', value: 22, color: 'rgba(79,53,232,0.88)' },
    { type: 'Shorts',    value: 16, color: 'rgba(79,53,232,0.76)' },
    { type: 'Imagem',    value: 10, color: 'rgba(79,53,232,0.65)' },
    { type: 'Stories',   value: 8,  color: 'rgba(79,53,232,0.54)' },
    { type: 'Lives',     value: 5,  color: 'rgba(79,53,232,0.44)' },
    { type: 'Artigo',    value: 3,  color: 'rgba(79,53,232,0.35)' },
    { type: 'Thread',    value: 2,  color: 'rgba(79,53,232,0.28)' },
  ],
  instagram: [
    { type: 'Reels',        value: 68, color: '#4F35E8' },
    { type: 'Stories',      value: 18, color: '#7C5CFC' },
    { type: 'Carrossel',    value: 10, color: '#A78BFA' },
    { type: 'Imagem',       value: 4,  color: '#C4B5FD' },
  ],
  tiktok: [
    { type: 'Vídeo curto',  value: 75, color: '#4F35E8' },
    { type: 'Lives',        value: 18, color: '#7C5CFC' },
    { type: 'Dueto',        value: 7,  color: '#A78BFA' },
  ],
  youtube: [
    { type: 'Shorts',       value: 55, color: '#4F35E8' },
    { type: 'Vídeo longo',  value: 32, color: '#7C5CFC' },
    { type: 'Lives',        value: 13, color: '#A78BFA' },
  ],
  facebook: [
    { type: 'Reels',        value: 40, color: '#4F35E8' },
    { type: 'Vídeo',        value: 28, color: '#7C5CFC' },
    { type: 'Stories',      value: 18, color: '#A78BFA' },
    { type: 'Carrossel',    value: 9,  color: '#C4B5FD' },
    { type: 'Lives',        value: 5,  color: '#DDD6FE' },
  ],
  linkedin: [
    { type: 'Artigo',       value: 45, color: '#4F35E8' },
    { type: 'Post',         value: 30, color: '#7C5CFC' },
    { type: 'Vídeo',        value: 18, color: '#A78BFA' },
    { type: 'Documento',    value: 7,  color: '#C4B5FD' },
  ],
  twitter: [
    { type: 'Thread',       value: 48, color: '#4F35E8' },
    { type: 'Tweet',        value: 35, color: '#7C5CFC' },
    { type: 'Enquete',      value: 17, color: '#A78BFA' },
  ],
}

// Alcance real por tipo de conteúdo (só Instagram tem contentType rastreado
// hoje) — backend retorna vazio pra outras redes, e a gente cai pro mock.
export const getContentReach = async (network = 'all', companyId = null) => {
  const mock = CONTENT_REACH[network] ?? CONTENT_REACH.all
  if (!hasToken()) return mock
  try {
    const res = await authFetch(withCompany(`/analytics/content-reach?network=${network}`, companyId))
    if (!res.ok) return mock
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : mock
  } catch {
    return mock
  }
}

const BEST_TIMES_MOCK = [
  { day: 'Sexta-feira',  short: 'Sex', hour: '18h–21h', engagement: 100, top: true  },
  { day: 'Quinta-feira', short: 'Qui', hour: '18h–21h', engagement: 92,  top: false },
  { day: 'Quarta-feira', short: 'Qua', hour: '21h–00h', engagement: 88,  top: false },
  { day: 'Terça-feira',  short: 'Ter', hour: '18h–21h', engagement: 85,  top: false },
]

// Ranking real de melhores horários pra postar, com base no engajamento médio
// das postagens já publicadas (mesmo cálculo por trás do insight de IA de
// "melhor horário"). Sem posts suficientes com métrica coletada, cai pro mock.
export const getBestTimes = async (network = 'all', companyId = null) => {
  if (!hasToken()) return BEST_TIMES_MOCK
  try {
    const res = await authFetch(withCompany(`/analytics/best-times?network=${network}`, companyId))
    if (!res.ok) return BEST_TIMES_MOCK
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : BEST_TIMES_MOCK
  } catch {
    return BEST_TIMES_MOCK
  }
}

const AUDIENCE_MOCK = {
  ageGroups: [
    { range: '13–17', value: 14 },
    { range: '18–24', value: 42 },
    { range: '25–34', value: 28 },
    { range: '35–44', value: 10 },
    { range: '45+',   value: 6  },
  ],
  gender: { female: 64, male: 36 },
  topLocations: [
    { city: 'São Paulo',      value: 32 },
    { city: 'Rio de Janeiro', value: 18 },
    { city: 'Belo Horizonte', value: 9  },
  ],
}

// Demografia real de seguidores do Instagram (idade/gênero/localização).
// 204 = sem conta Instagram conectada ou sem dado suficiente ainda — cai pro mock.
export const getAudience = async (companyId = null) => {
  if (!hasToken()) return AUDIENCE_MOCK
  try {
    const res = await authFetch(withCompany('/analytics/audience', companyId))
    if (!res.ok || res.status === 204) return AUDIENCE_MOCK
    const data = await res.json()
    return data?.gender ? data : AUDIENCE_MOCK
  } catch {
    return AUDIENCE_MOCK
  }
}

export const getActivityFeed = () => Promise.resolve([
  { id: 1, type: 'publish',   text: 'Post "5 dicas para aumentar seu engajamento" foi publicado', time: 'há 2h' },
  { id: 2, type: 'milestone', text: 'Você ultrapassou 8.500 seguidores no Instagram',             time: 'há 5h' },
  { id: 3, type: 'comment',   text: '23 novos comentários no seu último Reel',                     time: 'há 8h' },
  { id: 4, type: 'connect',   text: 'Conta do YouTube reconectada com sucesso',                   time: 'ontem' },
  { id: 5, type: 'schedule',  text: 'Post "Como criar conteúdo que conecta" foi agendado',        time: 'ontem' },
])

const AI_INSIGHTS_MOCK = [
  { id: 1, type: 'positive', highlight: '2.4x',              text: 'mais alcance nos Reels do que nos outros formatos' },
  { id: 2, type: 'positive', highlight: '+24%',              text: 'de crescimento no TikTok este mês' },
  { id: 3, type: 'negative', highlight: '−18%',              text: 'de engajamento nas postagens de terça-feira' },
  { id: 4, type: 'tip',      highlight: 'Sex · 18h–21h',     text: 'é o melhor horário para postar' },
]

// Insights da IA para o período selecionado no dashboard.
export const getAiInsights = async (period = '30d', companyId = null) => {
  if (!hasToken()) return AI_INSIGHTS_MOCK
  try {
    const res = await authFetch(withCompany(`/analytics/ai-insights?period=${period}`, companyId))
    if (!res.ok) return AI_INSIGHTS_MOCK
    const data = await res.json()
    return Array.isArray(data) && data.length > 0 ? data : AI_INSIGHTS_MOCK
  } catch {
    return AI_INSIGHTS_MOCK
  }
}
