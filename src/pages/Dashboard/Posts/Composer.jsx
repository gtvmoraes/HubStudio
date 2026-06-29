import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LuArrowLeft, LuSave, LuSend, LuCalendarClock, LuImage,
  LuSparkles, LuWandSparkles, LuHash, LuLoaderCircle,
} from 'react-icons/lu'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import {
  getPostById, NETWORK_META, networkColor,
  getContentTypeInsight, getBestTimeSlots,
  getSocialAccounts, PLATFORM_IMAGE_TYPES,
} from '../../../services/posts'
import { API_BASE } from '../../../services/api'
import { showToast } from '../../../components/Toast'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import PhonePreview from './components/PhonePreview'
import MediaUploader from './components/MediaUploader'
import DateTimePicker from './components/DateTimePicker'
import CaptionIdeaModal from './components/CaptionIdeaModal'
import './Composer.css'

const NETWORK_ICONS = {
  instagram: FaInstagram,
  tiktok:    FaTiktok,
  youtube:   FaYoutube,
  facebook:  FaFacebook,
  linkedin:  FaLinkedin,
  twitter:   FaXTwitter,
}

const NETWORK_IDS = ['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'twitter']

// Estrutura padrão pra conteúdo de uma rede (mídia é compartilhada em form.media)
const emptyNetworkContent = () => ({ title: '', content: '' })

// Verifica se a rede/tipo selecionado exige título
function typeNeedsTitle(networkId, typeId) {
  const meta = NETWORK_META[networkId]
  if (!meta) return false
  if (meta.needsTitle) return true
  const typeMeta = meta.types.find(t => t.id === typeId)
  return typeMeta?.needsTitle === true
}

export default function Composer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { theme } = useTheme()
  const isEditing = Boolean(id)

  const initialDate = searchParams.get('date') || ''

  const [form, setForm] = useState({
    networks: [],
    typesByNetwork: {},
    contentByNetwork: {},  // { instagram: { title, content }, ... }
    media: [],             // mídia única compartilhada entre todas as redes
    scheduledFor: initialDate,
  })

  // Rede atualmente sendo editada (sincronizada com o preview)
  const [activeNetwork, setActiveNetwork] = useState(null)

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [aiBusy, setAiBusy] = useState(null)          // 'caption' | 'hashtags' | null
  const [captionModalOpen, setCaptionModalOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Carrega o post quando estamos em modo edição
  useEffect(() => {
    if (!id) return
    getPostById(id).then(post => {
      if (post) {
        const typesByNetwork = {}
        const contentByNetwork = {}
        ;(post.networks || []).forEach(n => {
          const meta = NETWORK_META[n]
          if (!meta) return
          const matched = meta.types.find(t => t.id === post.type)
          typesByNetwork[n] = matched ? matched.id : meta.types[0].id
          contentByNetwork[n] = {
            title: post.title || '',
            content: post.content || '',
          }
        })
        setForm({
          networks: post.networks || [],
          typesByNetwork,
          contentByNetwork,
          media: [],
          scheduledFor: post.scheduledFor ? post.scheduledFor.slice(0, 16) : '',
        })
        if (post.networks?.[0]) setActiveNetwork(post.networks[0])
      }
    })
  }, [id])

  // Retorna a orientação do tipo selecionado de uma rede ('vertical' | 'horizontal' | 'square')
  const getTypeOrientation = (networkId, typeId) => {
    const meta = NETWORK_META[networkId]
    return meta?.types.find(t => t.id === typeId)?.orientation || 'square'
  }

  // Retorna true se o tipo aceita apenas vídeo (sem upload de imagem)
  const isVideoOnly = (networkId, typeId) =>
    PLATFORM_IMAGE_TYPES[networkId]?.[typeId] === null

  // Dado o conjunto atual de redes, retorna o tipo mais compatível para uma nova rede candidata.
  // Prioriza manter a orientação da sessão atual.
  const bestTypeForNetwork = (candidateId, networks, typesByNetwork) => {
    const meta = NETWORK_META[candidateId]
    if (!meta) return undefined

    // Orientações já em uso na sessão
    const sessionOrientations = new Set(
      networks.map(n => getTypeOrientation(n, typesByNetwork[n]))
    )
    // Verifica se a sessão é de imagem (algum tipo selecionado é image-only / não-vídeo)
    const sessionHasImageType = networks.some(n => !isVideoOnly(n, typesByNetwork[n]) && PLATFORM_IMAGE_TYPES[n]?.[typesByNetwork[n]] !== undefined)

    // Prefere tipo com orientação já usada na sessão (vertical > horizontal > square)
    for (const orientation of ['vertical', 'horizontal', 'square']) {
      if (sessionOrientations.has(orientation)) {
        const match = meta.types.find(t => t.orientation === orientation)
        if (match) return match.id
      }
    }
    return meta.types[0]?.id
  }

  // Retorna a razão de incompatibilidade ao tentar adicionar `candidateId`.
  // null = compatível.
  const getIncompatibilityReason = (candidateId, networks, typesByNetwork) => {
    const candidateMeta = NETWORK_META[candidateId]
    if (!candidateMeta) return null

    for (const existingId of networks) {
      const existingType = typesByNetwork[existingId]
      const existingOrientation = getTypeOrientation(existingId, existingType)
      const existingIsVideoOnly = isVideoOnly(existingId, existingType)

      // Se a sessão atual é de IMAGEM (tipo sem vídeo, como TikTok foto ou Instagram feed)
      // e o candidato só tem tipos de vídeo → incompatível
      if (!existingIsVideoOnly) {
        const platformTypes = PLATFORM_IMAGE_TYPES[existingId]
        const existingAcceptsImages = platformTypes && platformTypes[existingType] !== null
        if (existingAcceptsImages) {
          const candidateHasImageType = candidateMeta.types.some(
            t => PLATFORM_IMAGE_TYPES[candidateId]?.[t.id] !== null
          )
          if (!candidateHasImageType) {
            const existingLabel = NETWORK_META[existingId]?.label
            return `${existingLabel} (${existingType}) publica imagens, mas ${candidateMeta.label} só aceita vídeo`
          }
        }
      }

      // Conflito de orientação: vertical ↔ horizontal
      if (existingOrientation === 'vertical' || existingOrientation === 'horizontal') {
        const oppositeOrientation = existingOrientation === 'vertical' ? 'horizontal' : 'vertical'
        // O candidato tem ALGUM tipo compatível? (não bloqueia se ele tem alternativa)
        const candidateBestType = bestTypeForNetwork(candidateId, networks, typesByNetwork)
        const candidateBestOrientation = getTypeOrientation(candidateId, candidateBestType)
        if (candidateBestOrientation === oppositeOrientation) {
          // Sem alternativa compatível
          const allCandidateOrientations = candidateMeta.types.map(t => t.orientation)
          const hasCompatibleType = allCandidateOrientations.some(o => o !== oppositeOrientation)
          if (!hasCompatibleType) {
            const existingLabel = NETWORK_META[existingId]?.label
            return `${existingLabel} (${existingOrientation}) não é compatível com ${candidateMeta.label}`
          }
        }
      }
    }
    return null
  }

  // Toggle de rede: ao adicionar, escolhe o tipo mais compatível com a sessão atual.
  const toggleNetwork = (networkId) => {
    setForm(f => {
      const isSelected = f.networks.includes(networkId)
      if (isSelected) {
        const { [networkId]: _omitType, ...restTypes } = f.typesByNetwork
        const { [networkId]: _omitContent, ...restContent } = f.contentByNetwork
        return {
          ...f,
          networks: f.networks.filter(n => n !== networkId),
          typesByNetwork: restTypes,
          contentByNetwork: restContent,
        }
      }

      const reason = getIncompatibilityReason(networkId, f.networks, f.typesByNetwork)
      if (reason) {
        setFeedback(reason)
        setTimeout(() => setFeedback(''), 4000)
        return f
      }

      const chosenType = bestTypeForNetwork(networkId, f.networks, f.typesByNetwork)
      const defaultType = NETWORK_META[networkId]?.types[0]?.id
      if (chosenType && chosenType !== defaultType) {
        const label = NETWORK_META[networkId]?.label
        const typeLabel = NETWORK_META[networkId]?.types.find(t => t.id === chosenType)?.label
        setFeedback(`${label} adicionado como ${typeLabel} (compatível com a sessão atual)`)
        setTimeout(() => setFeedback(''), 3000)
      }

      const newNetworks = [...f.networks, networkId]
      if (newNetworks.length === 1) setActiveNetwork(networkId)
      return {
        ...f,
        networks: newNetworks,
        typesByNetwork: { ...f.typesByNetwork, [networkId]: chosenType },
        contentByNetwork: { ...f.contentByNetwork, [networkId]: emptyNetworkContent() },
      }
    })
  }

  const setTypeForNetwork = (networkId, typeId) => {
    setForm(f => {
      // Verifica se o novo tipo cria conflito de orientação com as outras redes
      const otherNetworks = f.networks.filter(n => n !== networkId)
      const newOrientation = getTypeOrientation(networkId, typeId)

      for (const otherId of otherNetworks) {
        const otherOrientation = getTypeOrientation(otherId, f.typesByNetwork[otherId])
        if (
          (newOrientation === 'vertical' && otherOrientation === 'horizontal') ||
          (newOrientation === 'horizontal' && otherOrientation === 'vertical')
        ) {
          const otherLabel = NETWORK_META[otherId]?.label
          const typeLabel = NETWORK_META[networkId]?.types.find(t => t.id === typeId)?.label
          setFeedback(`${typeLabel} (${newOrientation}) não é compatível com ${otherLabel} (${otherOrientation})`)
          setTimeout(() => setFeedback(''), 4000)
          return f
        }
      }
      return { ...f, typesByNetwork: { ...f.typesByNetwork, [networkId]: typeId } }
    })
  }

  // Atualiza um campo do conteúdo de uma rede específica
  const updateNetworkField = (networkId, key, value) => {
    setForm(f => ({
      ...f,
      contentByNetwork: {
        ...f.contentByNetwork,
        [networkId]: {
          ...(f.contentByNetwork[networkId] || emptyNetworkContent()),
          [key]: value,
        },
      },
    }))
  }

  // Copia o conteúdo da rede ativa pra todas as outras (atalho útil)
  const copyToAllNetworks = () => {
    if (!activeNetwork) return
    const source = form.contentByNetwork[activeNetwork]
    if (!source) return
    setForm(f => {
      const next = { ...f.contentByNetwork }
      f.networks.forEach(n => {
        if (n !== activeNetwork) {
          next[n] = {
            title: source.title,
            content: source.content.slice(0, NETWORK_META[n]?.maxChars || 5000),
          }
        }
      })
      return { ...f, contentByNetwork: next }
    })
    setFeedback('Conteúdo copiado pra todas as redes!')
    setTimeout(() => setFeedback(''), 1800)
  }

  // Validação: todas as redes precisam ter conteúdo e título (se exigido)
  const hasNetworks = form.networks.length > 0
  const validationByNetwork = useMemo(() => {
    return form.networks.map(n => {
      const c = form.contentByNetwork[n] || emptyNetworkContent()
      const t = form.typesByNetwork[n]
      const needsT = typeNeedsTitle(n, t)
      return {
        network: n,
        hasContent: (c.content?.trim().length || 0) > 0,
        hasTitle: !needsT || (c.title?.trim().length || 0) > 0,
        needsTitle: needsT,
      }
    })
  }, [form.networks, form.contentByNetwork, form.typesByNetwork])

  const canSubmit = hasNetworks && validationByNetwork.every(v => v.hasContent && v.hasTitle)

  // Interseção dos formatos de imagem aceitos por todas as redes selecionadas
  const allowedImageMimeTypes = useMemo(() => {
    const typeSets = []
    for (const networkId of form.networks) {
      const typeId = form.typesByNetwork[networkId]
      const allowed = PLATFORM_IMAGE_TYPES[networkId]?.[typeId]
      if (allowed === null) continue // tipo só aceita vídeo, ignora restrição de imagem
      if (Array.isArray(allowed)) typeSets.push(new Set(allowed))
    }
    if (typeSets.length === 0) return null
    const intersection = [...typeSets[0]].filter(t => typeSets.every(s => s.has(t)))
    return intersection.length > 0 ? intersection : null
  }, [form.networks, form.typesByNetwork])

  const handleMediaRejected = (rejectedFiles) => {
    const names = rejectedFiles.map(f => f.name).join(', ')
    const formatsAllowed = allowedImageMimeTypes
      ? allowedImageMimeTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')
      : 'qualquer formato'
    setFeedback(`Formato não suportado pelas redes selecionadas: ${names}. Aceitos: ${formatsAllowed}.`)
    setTimeout(() => setFeedback(''), 5000)
  }
  const hasAnyContent = validationByNetwork.some(v => v.hasContent)

  // Garante pelo menos 5 minutos de antecedência no agendamento
const xhrUpload = (endpoint, formData, onProgress) =>
    new Promise((resolve, reject) => {
      const token = localStorage.getItem('hs-token')
      const xhr = new XMLHttpRequest()
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      })
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)) } catch { resolve({}) }
        } else {
          try {
            const d = JSON.parse(xhr.responseText)
            reject(new Error(d.message || d.detail || `Erro HTTP ${xhr.status}`))
          } catch { reject(new Error(`Erro HTTP ${xhr.status}`)) }
        }
      })
      xhr.addEventListener('error', () => reject(new Error('Erro de rede ao enviar vídeo')))
      xhr.open('POST', `${API_BASE}${endpoint}`)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.send(formData)
    })

  const handleSave = async (status) => {
    setLoading(true)
    setFeedback('')
    setUploadProgress(0)

    const token = localStorage.getItem('hs-token')

    if (status === 'scheduled' && token) {
      // Quando não há data definida, publica imediatamente usando o horário atual
      const effectiveDate = form.scheduledFor || (() => {
        const now = new Date()
        const pad = n => String(n).padStart(2, '0')
        return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      })()

      const tiktokType = form.typesByNetwork['tiktok']
      const youtubeType = form.typesByNetwork['youtube']

      // Redes de vídeo: TikTok(video) + YouTube(video ou shorts)
      const videoNetworks = form.networks.filter(n => {
        if (n === 'tiktok') return tiktokType === 'video'
        if (n === 'youtube') return true
        return false
      })

      // TikTok foto (fluxo separado)
      const tiktokPhotoSelected = form.networks.includes('tiktok') && tiktokType === 'photo'

      const isoDate = effectiveDate.length === 16 ? effectiveDate + ':00' : effectiveDate

      // ── Fluxo de FOTOS (TikTok Photo) ──────────────────────────────
      if (tiktokPhotoSelected) {
        const imageItems = form.media.filter(m => m.type === 'image' && m.file)
        if (imageItems.length === 0) {
          setFeedback('Selecione ao menos uma imagem para publicar no TikTok.')
          setLoading(false)
          return
        }
        try {
          const accounts = await getSocialAccounts()
          const matchingIds = accounts
            .filter(a => (a.platform || '').toLowerCase() === 'tiktok')
            .map(a => a.id)

          if (matchingIds.length === 0) {
            setFeedback('Nenhuma conta TikTok conectada. Vá em Configurações > Redes.')
            setLoading(false)
            return
          }

          const tiktokContent = form.contentByNetwork['tiktok'] || {}
          const photoTitle = tiktokContent.title || tiktokContent.content?.slice(0, 60) || ''
          const fd = new FormData()
          imageItems.forEach(item => fd.append('photos', item.file))
          fd.append('title', photoTitle)
          fd.append('scheduledAt', isoDate)
          matchingIds.forEach(id => fd.append('socialAccountIds', id))

          setFeedback('Enviando fotos…')
          await xhrUpload('/posts/schedule/photo', fd, pct => {
            setUploadProgress(pct)
            setFeedback(pct < 100 ? `Enviando fotos… ${pct}%` : 'Registrando agendamento…')
          })

          const label = form.scheduledFor
            ? `Agendado para ${new Date(form.scheduledFor).toLocaleString('pt-BR')}`
            : 'Publicando agora…'
          showToast({ type: 'success', title: 'Post enviado com sucesso', message: label })

          // Se também há vídeo para YouTube, continua; senão, sai
          if (videoNetworks.length === 0) {
            setTimeout(() => navigate('/dashboard/posts'), 700)
            setLoading(false)
            return
          }
        } catch (err) {
          setFeedback(`Erro ao publicar fotos: ${err.message}`)
          setLoading(false)
          return
        }
      }

      // ── Fluxo de VÍDEO (TikTok Video + YouTube Video/Shorts) ───────
      const videoFile = form.media.find(m => m.type === 'video' && m.file)?.file
      let videoTitle = ''
      for (const n of videoNetworks) {
        const c = form.contentByNetwork[n]
        if (c?.title || c?.content) {
          videoTitle = c.title || c.content.slice(0, 60)
          break
        }
      }

      if (videoNetworks.length > 0 && videoFile) {
        try {
          const accounts = await getSocialAccounts()
          const matchingIds = accounts
            .filter(a => videoNetworks.includes((a.platform || '').toLowerCase()))
            .map(a => a.id)

          if (matchingIds.length === 0) {
            setFeedback('Nenhuma conta TikTok/YouTube conectada. Vá em Configurações > Redes.')
            setLoading(false)
            return
          }

          const youtubeIsShort = form.networks.includes('youtube') && youtubeType === 'shorts'
          const fd = new FormData()
          fd.append('video', videoFile)
          fd.append('title', videoTitle)
          fd.append('scheduledAt', isoDate)
          matchingIds.forEach(id => fd.append('socialAccountIds', id))
          if (youtubeIsShort) fd.append('youtubeIsShort', 'true')

          setFeedback('Enviando vídeo…')
          await xhrUpload('/posts/schedule/video', fd, pct => {
            setUploadProgress(pct)
            setFeedback(pct < 100 ? `Enviando vídeo… ${pct}%` : 'Registrando agendamento…')
          })

          const label = form.scheduledFor
            ? `Agendado para ${new Date(form.scheduledFor).toLocaleString('pt-BR')}`
            : 'Publicando agora…'
          showToast({ type: 'success', title: 'Post enviado com sucesso', message: label })
          setTimeout(() => navigate('/dashboard/posts'), 700)
          setLoading(false)
          return
        } catch (err) {
          setFeedback(`Erro ao publicar: ${err.message}`)
          setLoading(false)
          return
        }
      }
    }

    // Fallback mock (rascunho, aprovação, ou sem arquivo de vídeo)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    const msg = {
      draft:     'Rascunho salvo!',
      scheduled: 'Post agendado!',
      pending:   'Submetido pra aprovação!',
    }[status] || 'Salvo!'
    setFeedback(msg)
    if (status === 'scheduled') {
      showToast({
        type: 'success',
        title: 'Post agendado com sucesso',
        message: 'Seu conteudo foi agendado e sera publicado automaticamente.',
      })
    }
    setTimeout(() => navigate('/dashboard/posts'), 700)
  }

  // Dados do conteúdo ativo (pra renderizar o form)
  const activeContent = activeNetwork
    ? (form.contentByNetwork[activeNetwork] || emptyNetworkContent())
    : null
  const activeType = activeNetwork ? form.typesByNetwork[activeNetwork] : null
  const activeMeta = activeNetwork ? NETWORK_META[activeNetwork] : null
  const activeNeedsTitle = activeNetwork ? typeNeedsTitle(activeNetwork, activeType) : false

  // Pré-requisitos das ferramentas de IA do conteúdo
  const activeHasContent = (activeContent?.content?.trim().length || 0) > 0
  const activeHasTitle = (activeContent?.title?.trim().length || 0) > 0
  const canHashtags = activeHasContent || activeHasTitle   // hashtags: precisa de conteúdo ou título

  // IA — abre o modal de ideia; depois chama o endpoint Groq via backend
  const handleGenerateCaption = () => {
    if (!activeNetwork || aiBusy) return
    setCaptionModalOpen(true)
  }

  const handleCaptionGenerate = async (idea) => {
    setAiBusy('caption')
    const token = localStorage.getItem('hs-token')
    const res = await fetch(`${API_BASE}/ai/generate-caption`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        networkId: activeNetwork,
        idea,
        maxChars: activeMeta?.maxChars || 2200,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setAiBusy(null)
      throw new Error(err.message || `Erro ${res.status}`)
    }
    const data = await res.json()
    setAiBusy(null)
    return data
  }

  const handleCaptionSelect = (caption, cta) => {
    const content = cta ? `${caption}\n\n${cta}` : caption
    updateNetworkField(activeNetwork, 'content', content)
    setCaptionModalOpen(false)
    setFeedback('Legenda gerada pela IA!')
    setTimeout(() => setFeedback(''), 2000)
  }

  // IA — sugere hashtags via Groq e anexa ao final da legenda
  const handleSuggestHashtags = async () => {
    if (!activeNetwork || aiBusy) return
    setAiBusy('hashtags')
    setFeedback('')
    try {
      const token = localStorage.getItem('hs-token')
      const res = await fetch(`${API_BASE}/ai/suggest-hashtags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          networkId: activeNetwork,
          content: activeContent?.content || '',
          title: activeContent?.title || '',
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Erro ${res.status}`)
      }
      const { hashtags } = await res.json()
      const existing = (activeContent?.content || '').trimEnd()
      const block = (existing ? existing + '\n\n' : '') + hashtags.join(' ')
      updateNetworkField(activeNetwork, 'content', block.slice(0, activeMeta?.maxChars || 5000))
      setFeedback('Hashtags adicionadas!')
    } catch (err) {
      setFeedback(`Erro: ${err.message}`)
    } finally {
      setAiBusy(null)
      setTimeout(() => setFeedback(''), 2000)
    }
  }

  return (
    <div className="composer">
      <div className="composer__topbar">
        <button
          type="button"
          className="composer__back"
          onClick={() => navigate('/dashboard/posts')}
        >
          <LuArrowLeft size={16} /> Voltar
        </button>
        <h1>{isEditing ? 'Editar post' : 'Novo post'}</h1>
      </div>

      <div className="composer__layout">
        {/* Coluna esquerda — formulário */}
        <div className="composer__form">

          {/* PASSO 1 — Redes */}
          <div className="composer__step">
            <div className="composer__step-head">
              <span className="composer__step-num">1</span>
              <h3>Em quais redes você quer publicar?</h3>
            </div>
            <div className="composer__networks">
              {NETWORK_IDS.map(id => {
                const meta = NETWORK_META[id]
                const Icon = NETWORK_ICONS[id]
                const selected = form.networks.includes(id)
                const incompatReason = !selected
                  ? getIncompatibilityReason(id, form.networks, form.typesByNetwork)
                  : null
                const blocked = Boolean(incompatReason)
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={blocked}
                    title={blocked ? incompatReason : undefined}
                    className={`composer__network-pill${selected ? ' composer__network-pill--active' : ''}${blocked ? ' composer__network-pill--blocked' : ''}`}
                    style={selected ? { borderColor: networkColor(id, theme), color: networkColor(id, theme) } : {}}
                    onClick={() => toggleNetwork(id)}
                  >
                    <Icon size={18} />
                    {meta.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* PASSO 2 — Tipo por rede */}
          {hasNetworks && (
            <div className="composer__step">
              <div className="composer__step-head">
                <span className="composer__step-num">2</span>
                <h3>Que tipo de conteúdo em cada rede?</h3>
              </div>
              <div className="composer__type-groups">
                {form.networks.map(networkId => {
                  const meta = NETWORK_META[networkId]
                  const Icon = NETWORK_ICONS[networkId]
                  const selectedType = form.typesByNetwork[networkId]
                  const insight = getContentTypeInsight(networkId)
                  return (
                    <div key={networkId} className="composer__type-group">
                      <span className="composer__type-group-label">
                        <Icon size={14} style={{ color: networkColor(networkId, theme) }} />
                        {meta.label}
                      </span>
                      <div className="composer__type-pills">
                        {meta.types.map(t => {
                          const recommended = insight?.type === t.id
                          return (
                            <button
                              key={t.id}
                              type="button"
                              className={`composer__type-pill${selectedType === t.id ? ' composer__type-pill--active' : ''}${recommended ? ' composer__type-pill--rec' : ''}`}
                              style={selectedType === t.id ? { borderColor: networkColor(networkId, theme), color: networkColor(networkId, theme), background: `${networkColor(networkId, theme)}10` } : {}}
                              onClick={() => setTypeForNetwork(networkId, t.id)}
                              title={recommended ? 'Formato que mais engaja neste perfil' : undefined}
                            >
                              {recommended && <LuSparkles size={11} className="composer__type-rec-ic" />}
                              {t.label}
                              <span className="composer__type-pill-orient">
                                {t.orientation === 'vertical' && '9:16'}
                                {t.orientation === 'square' && '1:1'}
                                {t.orientation === 'horizontal' && '16:9'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                      {insight && (
                        <p className="composer__type-insight">
                          <LuSparkles size={13} />
                          <span>
                            <strong>{insight.label}</strong> renderam <strong>+{insight.uplift}%</strong> de
                            engajamento vs. {insight.vs} no último mês.
                          </span>
                        </p>
                      )}
                      {networkId === 'youtube' && selectedType === 'shorts' && (
                        <p className="composer__type-warning">
                          O YouTube classifica vídeos como Shorts <strong>automaticamente</strong> com base no arquivo enviado: duração máxima de <strong>60 segundos</strong> e proporção <strong>vertical (9:16)</strong>. O hashtag #Shorts é adicionado para ajudar na descoberta, mas não substitui esses requisitos.
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* PASSO 3 — Conteúdo (com tabs per-network) */}
          {hasNetworks && activeContent && (
            <div className="composer__step">
              <div className="composer__step-head">
                <span className="composer__step-num">3</span>
                <h3>Conteúdo da publicação</h3>
                {form.networks.length > 1 && (
                  <button
                    type="button"
                    className="composer__copy-all"
                    onClick={copyToAllNetworks}
                    title="Copia o conteúdo da rede atual pra todas as outras"
                  >
                    Aplicar a todas
                  </button>
                )}
              </div>

              {/* Tabs por rede (só com 2+) */}
              {form.networks.length > 1 && (
                <div className="composer__net-tabs">
                  {form.networks.map(n => {
                    const meta = NETWORK_META[n]
                    const Icon = NETWORK_ICONS[n]
                    const isActive = n === activeNetwork
                    return (
                      <button
                        key={n}
                        type="button"
                        className={`composer__net-tab${isActive ? ' composer__net-tab--active' : ''}`}
                        style={isActive ? { color: networkColor(n, theme), borderColor: networkColor(n, theme) } : {}}
                        onClick={() => setActiveNetwork(n)}
                      >
                        <Icon size={14} />
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Formulário da rede ativa */}
              <div className="composer__net-form" style={{ borderColor: form.networks.length > 1 ? networkColor(activeNetwork, theme) : undefined }}>
                {activeNeedsTitle && (
                  <div className="composer__field">
                    <label htmlFor="title">
                      Título <span className="composer__required">obrigatório no {activeMeta?.label}</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder={`Título pro ${activeMeta?.label}...`}
                      value={activeContent.title}
                      onChange={e => updateNetworkField(activeNetwork, 'title', e.target.value.slice(0, 100))}
                    />
                    <span className="composer__counter">{activeContent.title.length} / 100</span>
                  </div>
                )}

                <div className="composer__field">
                  <label htmlFor="content">
                    {activeNeedsTitle ? 'Descrição' : 'Legenda'} pro {activeMeta?.label}
                  </label>

                  {/* Ferramentas de IA — geram legenda e hashtags */}
                  <div className="composer__ai-tools">
                    <button
                      type="button"
                      className="composer__ai-btn"
                      onClick={handleGenerateCaption}
                      disabled={aiBusy !== null}
                      title="Gerar uma legenda com IA"
                    >
                      {aiBusy === 'caption'
                        ? <LuLoaderCircle size={14} className="composer__ai-spin" />
                        : <LuWandSparkles size={14} />}
                      Gerar legenda
                    </button>
                    <button
                      type="button"
                      className="composer__ai-btn"
                      onClick={handleSuggestHashtags}
                      disabled={!canHashtags || aiBusy !== null}
                      title={canHashtags
                        ? 'Sugerir hashtags com IA baseadas no seu conteúdo'
                        : 'Escreva a legenda ou título primeiro'}
                    >
                      {aiBusy === 'hashtags'
                        ? <LuLoaderCircle size={14} className="composer__ai-spin" />
                        : <LuHash size={14} />}
                      Hashtags
                    </button>
                  </div>

                  <textarea
                    id="content"
                    placeholder={`Escreva o conteúdo pro ${activeMeta?.label}...`}
                    value={activeContent.content}
                    onChange={e => updateNetworkField(
                      activeNetwork,
                      'content',
                      e.target.value.slice(0, activeMeta?.maxChars || 5000)
                    )}
                    rows={7}
                  />
                  <span className="composer__counter">
                    {activeContent.content.length} / {activeMeta?.maxChars}
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* PASSO 4 — Mídia compartilhada entre todas as redes */}
          {hasNetworks && (
            <div className="composer__step">
              <div className="composer__step-head">
                <span className="composer__step-num">4</span>
                <h3>
                  <LuImage size={16} /> Mídia da publicação
                </h3>
              </div>
              <p className="composer__hint">
                Imagens e vídeos enviados aqui serão usados em todas as redes selecionadas.
              </p>
              <MediaUploader
                media={form.media}
                onChange={(media) => setForm(f => ({ ...f, media }))}
                allowedImageMimeTypes={allowedImageMimeTypes}
                onRejected={allowedImageMimeTypes ? handleMediaRejected : null}
              />
            </div>
          )}

          {/* PASSO 5 — Agendamento (global) */}
          {hasNetworks && (
            <div className="composer__step">
              <div className="composer__step-head">
                <span className="composer__step-num">5</span>
                <h3>Quando publicar?</h3>
              </div>
              <div className="composer__field">
                <label>
                  <LuCalendarClock size={14} /> Data e hora
                </label>
                <DateTimePicker
                  value={form.scheduledFor}
                  onChange={(v) => setForm(f => ({ ...f, scheduledFor: v }))}
                  placeholder="Escolha quando publicar"
                  openUpward
                  getBestTimes={getBestTimeSlots}
                />
                <span className="composer__hint">
                  Deixe vazio pra salvar como rascunho sem agendar. Vale pra todas as redes.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Coluna direita — preview */}
        <aside className="composer__preview-wrap">
          <PhonePreview
            networks={form.networks}
            typesByNetwork={form.typesByNetwork}
            contentByNetwork={form.contentByNetwork}
            user={user}
            activeNetwork={activeNetwork}
            onActiveNetworkChange={setActiveNetwork}
          />
        </aside>
      </div>

      {captionModalOpen && activeNetwork && (
        <CaptionIdeaModal
          networkLabel={activeMeta?.label || activeNetwork}
          onGenerate={handleCaptionGenerate}
          onSelect={handleCaptionSelect}
          onClose={() => { setCaptionModalOpen(false); setAiBusy(null) }}
        />
      )}

      {/* Barra fixa de ações */}
      <div className="composer__actions">
        {feedback && <span className="composer__feedback">{feedback}</span>}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="composer__upload-bar">
            <div className="composer__upload-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <button
          type="button"
          className="composer__btn composer__btn--ghost"
          onClick={() => handleSave('draft')}
          disabled={loading || !hasAnyContent}
        >
          <LuSave size={15} /> Salvar rascunho
        </button>

        <button
          type="button"
          className="composer__btn composer__btn--outline"
          onClick={() => handleSave('pending')}
          disabled={loading || !canSubmit}
          title="Em modo equipe, envia para aprovação do gerente"
        >
          <LuSend size={15} /> Submeter pra aprovação
        </button>

        <button
          type="button"
          className="composer__btn composer__btn--primary"
          onClick={() => handleSave('scheduled')}
          disabled={loading || !canSubmit}
        >
          <LuCalendarClock size={15} /> {form.scheduledFor ? 'Agendar' : 'Publicar agora'}
        </button>
      </div>
    </div>
  )
}
