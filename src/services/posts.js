import { LuMessageSquare, LuChartBar, LuHash } from 'react-icons/lu'
import { authFetch } from './api'

export const getSocialAccounts = async (companyId) => {
  const token = localStorage.getItem('hs-token')
  if (!token) return []
  try {
    const url = companyId ? `/social/accounts?companyId=${companyId}` : '/social/accounts'
    const res = await authFetch(url)
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

const fmtCompact = (n) => {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return `${num}`
}

const TOP_POSTS_MOCK = [
  { id: 1, title: '5 dicas para aumentar seu engajamento', date: '18 de maio de 2026', views: '12.4K', likes: '1.3K', comments: '2.6K' },
  { id: 2, title: 'Seus Reels alcançaram 2 do nada',       date: '15 de maio de 2026', views: '9.8K',  likes: '872',  comments: '1.9K' },
  { id: 3, title: 'Como criar conteúdo que conecta',       date: '12 de maio de 2026', views: '8.1K',  likes: '634',  comments: '1.3K' },
  { id: 4, title: 'Pensamentos que facilitam sua rotina',  date: '09 de maio de 2026', views: '7.2K',  likes: '512',  comments: '1.1K' },
  { id: 5, title: 'Checklist para posts de sucesso',       date: '05 de maio de 2026', views: '6.5K',  likes: '432',  comments: '980'  },
]

// Ranking real por engajamento (views+likes+comments+shares) via métricas coletadas
// das redes conectadas — cai pro mock só sem sessão ou se a chamada falhar.
export const getTopPosts = async () => {
  const token = localStorage.getItem('hs-token')
  if (!token) return TOP_POSTS_MOCK
  try {
    const res = await authFetch('/analytics/top-posts?limit=5')
    if (!res.ok) return TOP_POSTS_MOCK
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return TOP_POSTS_MOCK
    return data.map(p => ({
      id: p.id,
      title: p.title,
      date: p.date,
      views: fmtCompact(p.views),
      likes: fmtCompact(p.likes),
    }))
  } catch {
    return TOP_POSTS_MOCK
  }
}

// Atualiza as métricas de todos os posts publicados da conta de uma vez
// (o backend busca em lote por rede, em vez de 1 chamada por post).
export const refreshAllMetrics = async () => {
  const res = await authFetch('/posts/metrics/refresh', { method: 'POST' })
  if (!res.ok) throw new Error('Falha ao atualizar métricas')
}

const RECENT_POSTS_MOCK = [
  { id: 1, title: '5 dicas para aumentar...',            date: '22/05/2026', time: '10:30', status: 'published', network: 'instagram' },
  { id: 2, title: 'Story: Como planejar meus conteúdos', date: '21/05/2026', time: '16:00', status: 'published', network: 'instagram' },
  { id: 3, title: 'Bests: Como planejar meus conteúdos', date: '20/05/2026', time: '09:00', status: 'published', network: 'instagram' },
  { id: 4, title: 'Rascunho: ideias para a semana',      date: '—',          time: '—',     status: 'draft',     network: 'instagram' },
]

// Deriva de getAllPosts() (já real quando logado) em vez de manter uma lista à parte.
export const getRecentPosts = async () => {
  const token = localStorage.getItem('hs-token')
  if (!token) return RECENT_POSTS_MOCK
  try {
    const posts = await getAllPosts()
    if (!Array.isArray(posts) || posts.length === 0) return RECENT_POSTS_MOCK
    return posts
      .filter(p => p.publishedAt || p.createdAt)
      .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
      .slice(0, 5)
      .map(p => {
        const when = new Date(p.publishedAt || p.createdAt)
        const valid = !isNaN(when.getTime())
        return {
          id: p.id,
          title: p.title || (p.content ? p.content.slice(0, 60) : 'Sem título'),
          date: valid ? when.toLocaleDateString('pt-BR') : '—',
          time: valid ? when.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—',
          status: p.status,
          network: p.networks?.[0] || 'instagram',
        }
      })
  } catch {
    return RECENT_POSTS_MOCK
  }
}

const STATUS_TO_MARKER = {
  draft:           'draft',
  scheduled:       'scheduled',
  posting:         'scheduled',
  posted:          'published',
  partial_success: 'published',
  error:           'draft',
}
const MARKER_PRIORITY = { published: 3, scheduled: 2, draft: 1 }

export const getCalendarMarkers = async () => {
  const posts = await getAllPosts()
  const map = {}
  posts.forEach(post => {
    const dateStr = post.scheduledFor || post.publishedAt
    if (!dateStr) return
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    const marker = STATUS_TO_MARKER[post.status] || 'draft'
    const existing = map[key]
    if (!existing || (MARKER_PRIORITY[marker] || 0) > (MARKER_PRIORITY[existing] || 0)) {
      map[key] = marker
    }
  })
  return map
}

export const getAiSuggestions = () => Promise.resolve([
  { id: 1, icon: LuMessageSquare, label: 'Ideia de post', text: 'Faça um post sobre tendências do seu nicho este mês!', action: 'Gerar' },
  { id: 2, icon: LuChartBar,      label: 'Engajamento',   text: 'Clique para gerar legendas envolventes.',              action: 'Gerar' },
  { id: 3, icon: LuHash,          label: 'Hashtags',      text: '#marketingdigital #branding #redessociais',           action: 'Copiar' },
])

export const schedulePost = (data) => Promise.resolve({ id: Date.now(), ...data, status: 'scheduled' })

export const getUpcomingPosts = async () => {
  const posts = await getAllPosts()
  const now = new Date()
  const scheduled = posts
    .filter(p => p.status === 'scheduled' && p.scheduledFor)
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
    .slice(0, 5)
  if (!scheduled.length) return []
  return scheduled.map(p => {
    const d = new Date(p.scheduledFor)
    const diffDays = Math.ceil((d - now) / 86400000)
    const countdown = diffDays <= 0 ? 'Hoje'
      : diffDays === 1 ? 'Amanhã'
      : `em ${diffDays} dias`
    return {
      id: p.id,
      title: p.title || p.content?.slice(0, 50) || '(sem título)',
      network: p.networks?.[0] ?? 'instagram',
      date: d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      countdown,
    }
  })
}

/**
 * Posts mock — estrutura completa preparada pro workflow de equipe.
 * Em modo solo, o `author` é sempre o usuário atual e ele aprova auto.
 * Quando a página de Equipes existir, a aprovação real entra via `status: 'pending'`.
 */
const ALL_POSTS = [
  {
    id: 'p1',
    title: '5 dicas para aumentar seu engajamento',
    content: 'Quer turbinar seu engajamento? Aqui vão 5 dicas práticas que aplicamos no nosso perfil este mês.\n\n1) Poste consistentemente\n2) Use carrosséis\n3) Hooks fortes nos primeiros 3 segundos\n4) Responda todos os comentários\n5) Faça lives mensais',
    networks: ['instagram', 'tiktok'],
    type: 'carousel',
    status: 'published',
    author: { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com' },
    approver: { id: 'u1', name: 'Breno Dantas' },
    scheduledFor: '2026-05-18T14:00:00',
    publishedAt: '2026-05-18T14:00:00',
    submittedAt: null,
    approvedAt: '2026-05-18T13:55:00',
    rejectedAt: null,
    comments: [],
    metrics: { views: 12400, likes: 1300, comments: 2600, shares: 184 },
    media: [{ type: 'image', url: null }],
  },
  {
    id: 'p2',
    title: 'Seus Reels alcançaram 2x do nada',
    content: 'A gente nem tinha planejado, mas esses Reels viralizaram. Vou abrir a estratégia que funcionou.',
    networks: ['instagram'],
    type: 'reel',
    status: 'published',
    author: { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com' },
    approver: { id: 'u1', name: 'Breno Dantas' },
    scheduledFor: '2026-05-15T20:00:00',
    publishedAt: '2026-05-15T20:00:00',
    submittedAt: null,
    approvedAt: '2026-05-15T19:58:00',
    rejectedAt: null,
    comments: [],
    metrics: { views: 9800, likes: 872, comments: 1900, shares: 92 },
    media: [{ type: 'video', url: null }],
  },
  {
    id: 'p3',
    title: 'Como criar conteúdo que conecta',
    content: 'Conteúdo bom não é só bonito — é o que faz a pessoa se sentir vista. Hoje vou te mostrar como.',
    networks: ['instagram', 'youtube'],
    type: 'post',
    status: 'scheduled',
    author: { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com' },
    approver: { id: 'u1', name: 'Breno Dantas' },
    scheduledFor: '2026-05-30T19:00:00',
    publishedAt: null,
    submittedAt: null,
    approvedAt: '2026-05-26T10:00:00',
    rejectedAt: null,
    comments: [],
    metrics: null,
    media: [{ type: 'image', url: null }],
  },
  {
    id: 'p4',
    title: 'Pensamentos que facilitam sua rotina',
    content: 'Lista das 3 frases que mais uso pra desbloquear quando travo.',
    networks: ['instagram', 'tiktok'],
    type: 'reel',
    status: 'scheduled',
    author: { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com' },
    approver: { id: 'u1', name: 'Breno Dantas' },
    scheduledFor: '2026-06-02T09:00:00',
    publishedAt: null,
    submittedAt: null,
    approvedAt: '2026-05-25T16:30:00',
    rejectedAt: null,
    comments: [],
    metrics: null,
    media: [{ type: 'video', url: null }],
  },
  {
    id: 'p5',
    title: 'Rascunho: ideias para a semana',
    content: 'Ideias que tô brainstormando — preciso filtrar antes de virar post.\n\n- Tutorial de edição\n- Bastidores do meu setup\n- Tier list de apps',
    networks: ['instagram'],
    type: 'post',
    status: 'draft',
    author: { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com' },
    approver: null,
    scheduledFor: null,
    publishedAt: null,
    submittedAt: null,
    approvedAt: null,
    rejectedAt: null,
    comments: [],
    metrics: null,
    media: [],
  },
  {
    id: 'p6',
    title: 'Checklist para posts de sucesso',
    content: 'O checklist mental que rodo antes de publicar qualquer coisa.',
    networks: ['instagram', 'linkedin'],
    type: 'carousel',
    status: 'pending',
    author: { id: 'u2', name: 'Maria Silva', email: 'maria@empresa.com' },
    approver: null,
    scheduledFor: '2026-06-05T11:00:00',
    publishedAt: null,
    submittedAt: '2026-05-27T18:20:00',
    approvedAt: null,
    rejectedAt: null,
    comments: [],
    metrics: null,
    media: [{ type: 'image', url: null }],
  },
  {
    id: 'p7',
    title: 'Promo: Curso de marketing',
    content: 'Lançamento do curso na Black Friday — desconto de 60%.',
    networks: ['instagram', 'facebook'],
    type: 'post',
    status: 'failed',
    author: { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com' },
    approver: { id: 'u1', name: 'Breno Dantas' },
    scheduledFor: '2026-05-24T08:00:00',
    publishedAt: null,
    submittedAt: null,
    approvedAt: '2026-05-23T22:00:00',
    rejectedAt: null,
    failureReason: 'Token do Instagram expirou. Reconecte a conta.',
    comments: [],
    metrics: null,
    media: [{ type: 'image', url: null }],
  },
]

export const getAllPosts = async () => {
  const token = localStorage.getItem('hs-token')
  if (!token) return ALL_POSTS
  try {
    const res = await authFetch('/posts/schedule/all-posts')
    if (!res.ok) return ALL_POSTS
    return await res.json()
  } catch {
    return ALL_POSTS
  }
}

export const getPostById = (id) =>
  Promise.resolve(ALL_POSTS.find(p => p.id === id) || null)

export const STATUS_META = {
  draft:     { label: 'Rascunho',              color: '#6B7280' },
  pending:   { label: 'Aguardando aprovação',  color: '#F59E0B' },
  scheduled: { label: 'Agendado',              color: '#4F35E8' },
  published: { label: 'Publicado',             color: '#10B981' },
  failed:    { label: 'Falhou',                color: '#EF4444' },
  rejected:  { label: 'Rejeitado',             color: '#EF4444' },
}

/**
 * Metadados das redes sociais para o composer.
 * Cada rede tem seus próprios tipos de conteúdo (formatos), limite de caracteres
 * e campos extras necessários (ex: YouTube exige título).
 */
export const NETWORK_META = {
  instagram: {
    label: 'Instagram',
    color: '#E1306C',
    types: [
      { id: 'feed',     label: 'Post',      orientation: 'square'   },
      { id: 'reel',     label: 'Reel',      orientation: 'vertical' },
      { id: 'story',    label: 'Story',     orientation: 'vertical' },
      { id: 'carousel', label: 'Carrossel', orientation: 'square'   },
    ],
    maxChars: 2200,
    needsTitle: false,
  },
  tiktok: {
    label: 'TikTok',
    color: '#010101',
    darkColor: '#F5F5F7',   // preto não aparece no modo escuro
    types: [
      { id: 'video', label: 'Vídeo', orientation: 'vertical' },
      { id: 'photo', label: 'Foto',  orientation: 'vertical' },
    ],
    maxChars: 2200,
    needsTitle: false,
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    types: [
      { id: 'video',  label: 'Vídeo',  orientation: 'horizontal' },
      { id: 'shorts', label: 'Shorts', orientation: 'vertical'   },
    ],
    maxChars: 5000,
    needsTitle: true,  // YouTube sempre exige título
    needsThumbnail: true,
  },
  facebook: {
    label: 'Facebook',
    color: '#1877F2',
    types: [
      { id: 'post', label: 'Post', orientation: 'square'   },
      { id: 'reel', label: 'Reel', orientation: 'vertical' },
    ],
    maxChars: 5000,
    needsTitle: false,
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    types: [
      { id: 'post',    label: 'Post',   orientation: 'square'     },
      { id: 'article', label: 'Artigo', orientation: 'horizontal', needsTitle: true },
    ],
    maxChars: 3000,
    needsTitle: false,
  },
  twitter: {
    label: 'X (Twitter)',
    color: '#000000',
    darkColor: '#F5F5F7',   // preto não aparece no modo escuro
    types: [
      { id: 'tweet',  label: 'Tweet',  orientation: 'square' },
      { id: 'thread', label: 'Thread', orientation: 'square' },
    ],
    maxChars: 280,
    needsTitle: false,
  },
}

/**
 * Formatos de imagem aceitos por plataforma/tipo.
 * null  = o tipo só aceita vídeo (sem upload de imagem)
 * array = lista de MIME types permitidos
 * key ausente = sem restrição de formato
 */
export const PLATFORM_IMAGE_TYPES = {
  tiktok: {
    photo: ['image/jpeg', 'image/webp'],
    video: null,
  },
  instagram: {
    feed:     ['image/jpeg', 'image/png'],
    carousel: ['image/jpeg', 'image/png'],
    story:    ['image/jpeg', 'image/png'],
    reel:     null,
  },
  youtube: {
    video:  null,
    shorts: null,
  },
  facebook: {
    post: ['image/jpeg', 'image/png', 'image/gif'],
    reel: null,
  },
  linkedin: {
    post:    ['image/jpeg', 'image/png', 'image/gif'],
    article: ['image/jpeg', 'image/png', 'image/gif'],
  },
  twitter: {
    tweet:  ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    thread: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
}

// Helper — cor da rede ajustada ao tema (preto vira claro no modo escuro)
export const networkColor = (id, theme) => {
  const meta = NETWORK_META[id]
  if (!meta) return 'currentColor'
  return theme === 'dark' && meta.darkColor ? meta.darkColor : meta.color
}

// ════════════════════════════════════════════════════════════════
// IA do Composer — mocks determinísticos. Quando o backend existir,
// trocar só o corpo destas funções (contratos de retorno não mudam).
// ════════════════════════════════════════════════════════════════
const pad2 = (n) => String(n).padStart(2, '0')

/**
 * Card 2 — insight de qual formato mais engaja em cada rede.
 * `type` aponta o id do formato recomendado (casa com NETWORK_META[id].types).
 */
const CONTENT_TYPE_INSIGHTS = {
  instagram: { type: 'reel',   label: 'Reels',   vs: 'posts no feed', uplift: 132 },
  tiktok:    { type: 'video',  label: 'Vídeos',  vs: 'fotos',         uplift: 95  },
  youtube:   { type: 'shorts', label: 'Shorts',  vs: 'vídeos longos', uplift: 78  },
  facebook:  { type: 'reel',   label: 'Reels',   vs: 'posts',         uplift: 64  },
  linkedin:  { type: 'post',   label: 'Posts',   vs: 'artigos',       uplift: 41  },
  twitter:   { type: 'thread', label: 'Threads', vs: 'tweets soltos', uplift: 58  },
}
export const getContentTypeInsight = (networkId) => CONTENT_TYPE_INSIGHTS[networkId] || null

/**
 * Card 3 — gera uma legenda "ideal" com base no título/rede do usuário.
 * Depende de mídia OU título (validado na UI). Emoji-free de propósito.
 */
export const generateCaption = ({ networkId, title = '' }) =>
  new Promise(resolve => {
    const meta = NETWORK_META[networkId]
    const topic = title.trim()
    const subject = topic || 'esse conteúdo que preparei pra você'
    const subjectLow = subject.toLowerCase()

    const hooks = [
      `Para tudo o que você está fazendo: ${subject} pode mudar o seu dia.`,
      `Ninguém te conta isso sobre ${subjectLow} — mas eu vou.`,
      `Salva esse post: ${subject} explicado de um jeito simples.`,
      `Eu queria ter visto isso antes de começar com ${subjectLow}.`,
    ]
    const bodies = [
      'Levei um tempo pra entender, então resumi tudo o que importa em poucos pontos pra você aplicar hoje mesmo.',
      'A ideia é simples, mas quase ninguém faz: consistência e atenção aos detalhes mudam o resultado.',
      'Testei na prática e o retorno apareceu rápido. Aqui vai o passo a passo direto ao ponto.',
    ]
    const ctas = {
      instagram: 'Comenta aqui embaixo o que você achou e marca alguém que precisa ver isso.',
      tiktok:    'Segue pra mais dicas como essa todos os dias.',
      youtube:   'Se curtir, deixa o like e se inscreve pra não perder os próximos.',
      facebook:  'Compartilha com quem vai gostar e deixa seu comentário.',
      linkedin:  'Qual a sua experiência com isso? Compartilha nos comentários.',
      twitter:   'Concorda? Responde aí o que você faria diferente.',
    }

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
    let caption = `${pick(hooks)}\n\n${pick(bodies)}\n\n${ctas[networkId] || pick(bodies)}`
    if (meta?.maxChars) caption = caption.slice(0, meta.maxChars)
    setTimeout(() => resolve(caption), 850)
  })

/**
 * Card 3 — sugere hashtags a partir do conteúdo/título + rede.
 * Depende de mídia (validado na UI).
 */
export const suggestHashtags = ({ networkId, content = '', title = '' }) =>
  new Promise(resolve => {
    const base = [
      '#conteudo', '#dicas', '#marketingdigital', '#criadordeconteudo',
      '#estrategia', '#engajamento', '#redessociais', '#crescimento',
    ]
    const byNetwork = {
      instagram: ['#instadica', '#reels', '#explorar', '#viral'],
      tiktok:    ['#tiktokbrasil', '#fyp', '#paravoce', '#viralizou'],
      youtube:   ['#youtubeshorts', '#youtubebrasil', '#inscrevase'],
      facebook:  ['#facebook', '#comunidade', '#compartilhe'],
      linkedin:  ['#carreira', '#negocios', '#produtividade', '#lideranca'],
      twitter:   ['#threads', '#assuntodomomento'],
    }
    // "Analisa" o texto do usuário: vira hashtag as palavras mais relevantes
    const words = `${title} ${content}`
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .match(/[a-z]{5,}/g) || []
    const fromText = [...new Set(words)].slice(0, 3).map(w => `#${w}`)

    const pool = [...fromText, ...(byNetwork[networkId] || []), ...base]
    const tags = [...new Set(pool)].slice(0, 12)
    setTimeout(() => resolve(tags), 850)
  })

/**
 * Card 4 — melhores horários para postar NA DATA escolhida.
 * Filtra horários que já passaram quando a data é hoje (não recomenda 14h
 * se já são 15h) e ordena por engajamento estimado. Síncrono de propósito
 * (o picker chama durante o render).
 */
const slotReason = (h) => {
  if (h < 9)  return 'começo do dia'
  if (h < 12) return 'manhã'
  if (h < 14) return 'hora do almoço'
  if (h < 18) return 'tarde'
  if (h < 21) return 'pico da noite'
  return 'fim da noite'
}
export const getBestTimeSlots = (dateObj, now = new Date()) => {
  const date = dateObj || now
  const weekend = date.getDay() === 0 || date.getDay() === 6

  const catalog = weekend
    ? [ { h: 10, m: 0, score: 88 }, { h: 12, m: 0, score: 80 }, { h: 16, m: 0, score: 85 }, { h: 20, m: 0, score: 93 }, { h: 21, m: 30, score: 87 } ]
    : [ { h: 8,  m: 0, score: 82 }, { h: 12, m: 30, score: 86 }, { h: 18, m: 0, score: 90 }, { h: 19, m: 0, score: 95 }, { h: 21, m: 0, score: 84 } ]

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  const nowMin = now.getHours() * 60 + now.getMinutes()

  return catalog
    .filter(s => !sameDay || s.h * 60 + s.m > nowMin + 15) // 15 min de folga
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => ({
      h: s.h, m: s.m, score: s.score,
      label: `${pad2(s.h)}:${pad2(s.m)}`,
      reason: slotReason(s.h),
    }))
}
