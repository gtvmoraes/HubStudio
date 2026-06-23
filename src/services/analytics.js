// Modificadores para simular variação dos dados conforme os filtros.
// Quando o backend for plugado, esses params serão enviados como query string.
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

export const getStats = (period = '30d', network = 'all') => {
  const base = { views: 127800, followers: 8642, likes: 23700, newFollowers: 1286 }
  const changes = { views: '+16.6%', followers: '+12.4%', likes: '+21.3%', newFollowers: '+16.7%' }
  return Promise.resolve({
    views:        { value: fmtK(applyMult(base.views, period, network)),        raw: applyMult(base.views, period, network),        change: changes.views,        trend: 'up' },
    followers:    { value: applyMult(base.followers, period, network).toLocaleString('pt-BR'),    raw: applyMult(base.followers, period, network),    change: changes.followers,    trend: 'up' },
    likes:        { value: fmtK(applyMult(base.likes, period, network)),        raw: applyMult(base.likes, period, network),        change: changes.likes,        trend: 'up' },
    newFollowers: { value: applyMult(base.newFollowers, period, network).toLocaleString('pt-BR'), raw: applyMult(base.newFollowers, period, network), change: changes.newFollowers, trend: 'up' },
  })
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

export const getEngagementData = (granularity = 'daily', network = 'all') => {
  const dataset =
    granularity === 'weekly'  ? ENGAGEMENT_WEEKLY  :
    granularity === 'monthly' ? ENGAGEMENT_MONTHLY :
                                ENGAGEMENT_DAILY
  const mult = NETWORK_MULT[network] ?? 1
  return Promise.resolve(dataset.map(d => ({
    ...d,
    views:    Math.round(d.views    * mult),
    likes:    Math.round(d.likes    * mult),
    comments: Math.round(d.comments * mult),
  })))
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

export const getContentReach = (network = 'all') =>
  Promise.resolve(CONTENT_REACH[network] ?? CONTENT_REACH.all)

export const getAudience = () => Promise.resolve({
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
})

export const getActivityFeed = () => Promise.resolve([
  { id: 1, type: 'publish',   text: 'Post "5 dicas para aumentar seu engajamento" foi publicado', time: 'há 2h' },
  { id: 2, type: 'milestone', text: 'Você ultrapassou 8.500 seguidores no Instagram',             time: 'há 5h' },
  { id: 3, type: 'comment',   text: '23 novos comentários no seu último Reel',                     time: 'há 8h' },
  { id: 4, type: 'connect',   text: 'Conta do YouTube reconectada com sucesso',                   time: 'ontem' },
  { id: 5, type: 'schedule',  text: 'Post "Como criar conteúdo que conecta" foi agendado',        time: 'ontem' },
])

export const getAiInsights = () => Promise.resolve([
  { id: 1, type: 'positive', highlight: '2.4x',              text: 'mais alcance nos Reels do que nos outros formatos' },
  { id: 2, type: 'positive', highlight: '+24%',              text: 'de crescimento no TikTok este mês' },
  { id: 3, type: 'negative', highlight: '−18%',              text: 'de engajamento nas postagens de terça-feira' },
  { id: 4, type: 'tip',      highlight: 'Sex · 18h–21h',     text: 'é o melhor horário para postar' },
])
