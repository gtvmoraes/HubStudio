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

// Ranking real por engajamento (views+likes+comments+shares) via métricas coletadas
// das redes conectadas, respeitando os filtros de período/rede do dashboard.
// Sem sessão ou se a chamada falhar, devolve vazio — nunca dado fabricado.
export const getTopPosts = async (period = '30d', network = 'all', companyId = null) => {
  const token = localStorage.getItem('hs-token')
  if (!token) return []
  try {
    let url = `/analytics/top-posts?limit=5&period=${period}&network=${network}`
    if (companyId) url += `&companyId=${companyId}`
    const res = await authFetch(url)
    if (!res.ok) return []
    const data = await res.json()
    if (!Array.isArray(data)) return []
    return data.map(p => ({
      id: p.id,
      title: p.title,
      date: p.date,
      views: fmtCompact(p.views),
      likes: fmtCompact(p.likes),
    }))
  } catch {
    return []
  }
}

// Atualiza as métricas de todos os posts publicados da conta de uma vez
// (o backend busca em lote por rede, em vez de 1 chamada por post).
export const refreshAllMetrics = async (companyId = null) => {
  const url = companyId ? `/posts/metrics/refresh?companyId=${companyId}` : '/posts/metrics/refresh'
  const res = await authFetch(url, { method: 'POST' })
  if (!res.ok) throw new Error('Falha ao atualizar métricas')
}

// Deriva de getAllPosts() (real). Lista vazia é resultado REAL (conta sem
// posts ainda) — não é mascarada com dado fabricado.
export const getRecentPosts = async (companyId = null) => {
  const token = localStorage.getItem('hs-token')
  if (!token) return []
  try {
    const posts = await getAllPosts(companyId)
    if (!Array.isArray(posts) || posts.length === 0) return []
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
    return []
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

export const getCalendarMarkers = async (companyId = null) => {
  const posts = await getAllPosts(companyId)
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

// MOCK — aguardando backend.
// O Composer já usa IA real (POST /ai/generate-caption e /ai/suggest-hashtags);
// falta o equivalente para o card de sugestões do dashboard.
// Os textos são fixos, mas as AÇÕES são reais: cada item abre o compositor já
// com a ferramenta de IA correspondente (`ai`), que chama /ai/* no backend.
export const getAiSuggestions = () => Promise.resolve([
  { id: 1, ai: 'caption',  icon: LuMessageSquare, label: 'Ideia de post', text: 'Sem ideia do que postar? Descreva o tema e a IA escreve pra você.', action: 'Gerar' },
  { id: 2, ai: 'caption',  icon: LuChartBar,      label: 'Engajamento',   text: 'Gere uma legenda envolvente, no formato ideal de cada rede.',      action: 'Gerar' },
  { id: 3, ai: 'hashtags', icon: LuHash,          label: 'Hashtags',      text: 'Descubra as hashtags certas pro seu conteúdo.',                    action: 'Sugerir' },
])


export const getUpcomingPosts = async (companyId = null) => {
  const posts = await getAllPosts(companyId)
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

export const getAllPosts = async (companyId) => {
  const token = localStorage.getItem('hs-token')
  if (!token) return []
  try {
    const url = companyId ? `/posts/schedule/all-posts?companyId=${companyId}` : '/posts/schedule/all-posts'
    const res = await authFetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// Busca o post real na lista da API. Antes procurava numa lista mockada, então
// abrir /posts/:id/editar de um post de verdade não carregava nada.
export const getPostById = async (id, companyId = null) => {
  const posts = await getAllPosts(companyId)
  return posts.find(p => String(p.id) === String(id)) || null
}

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
// MOCK — aguardando backend.
// - getContentTypeInsight: números de uplift por formato são fixos/fabricados.
// - getBestTimeSlots: heurística local (dia útil vs fim de semana), não usa
//   histórico real; o dashboard já tem /analytics/best-times de verdade.
// Geração de legenda e hashtags já são reais (POST /ai/* direto no Composer).
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
