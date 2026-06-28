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
  getContentTypeInsight, generateCaption, suggestHashtags, getBestTimeSlots,
  getSocialAccounts,
} from '../../../services/posts'
import { API_BASE } from '../../../services/api'
import { showToast } from '../../../components/Toast'
import { useAuth } from '../../../contexts/AuthContext'
import { useTheme } from '../../../contexts/ThemeContext'
import PhonePreview from './components/PhonePreview'
import MediaUploader from './components/MediaUploader'
import DateTimePicker from './components/DateTimePicker'
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

// Estrutura padrão pra conteúdo de uma rede
const emptyNetworkContent = () => ({ title: '', content: '', media: [] })

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
    contentByNetwork: {},  // { instagram: { title, content, media }, ... }
    scheduledFor: initialDate,
  })

  // Rede atualmente sendo editada (sincronizada com o preview)
  const [activeNetwork, setActiveNetwork] = useState(null)

  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [aiBusy, setAiBusy] = useState(null)   // 'caption' | 'hashtags' | null
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
            media: [],
          }
        })
        setForm({
          networks: post.networks || [],
          typesByNetwork,
          contentByNetwork,
          scheduledFor: post.scheduledFor ? post.scheduledFor.slice(0, 16) : '',
        })
        if (post.networks?.[0]) setActiveNetwork(post.networks[0])
      }
    })
  }, [id])

  // Toggle de rede: ao adicionar, inicia tipo + content vazio. Ao remover, limpa tudo.
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
      const meta = NETWORK_META[networkId]
      const defaultType = meta?.types[0]?.id
      const newNetworks = [...f.networks, networkId]
      // Define rede ativa se for a primeira
      if (newNetworks.length === 1) setActiveNetwork(networkId)
      return {
        ...f,
        networks: newNetworks,
        typesByNetwork: { ...f.typesByNetwork, [networkId]: defaultType },
        contentByNetwork: { ...f.contentByNetwork, [networkId]: emptyNetworkContent() },
      }
    })
  }

  const setTypeForNetwork = (networkId, typeId) => {
    setForm(f => ({
      ...f,
      typesByNetwork: { ...f.typesByNetwork, [networkId]: typeId },
    }))
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
            media: source.media,
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
        hasContent: c.content.trim().length > 0,
        hasTitle: !needsT || c.title.trim().length > 0,
        needsTitle: needsT,
      }
    })
  }, [form.networks, form.contentByNetwork, form.typesByNetwork])

  const canSubmit = hasNetworks && validationByNetwork.every(v => v.hasContent && v.hasTitle)
  const hasAnyContent = validationByNetwork.some(v => v.hasContent)

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

    if (status === 'scheduled' && token && form.scheduledFor) {
      // Todas as redes de vídeo selecionadas — independente de qual aba tem o arquivo
      const videoNetworks = form.networks.filter(n => n === 'tiktok' || n === 'youtube')

      // Busca o arquivo de vídeo em qualquer aba (não só na aba da rede em questão)
      let videoFile = null
      let videoTitle = ''
      for (const n of form.networks) {
        const item = (form.contentByNetwork[n]?.media || []).find(m => m.type === 'video' && m.file)
        if (item) {
          videoFile = item.file
          const c = form.contentByNetwork[n]
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

          const isoDate = new Date(form.scheduledFor).toISOString().replace('Z', '')
          const fd = new FormData()
          fd.append('video', videoFile)
          fd.append('title', videoTitle)
          fd.append('scheduledAt', isoDate)
          matchingIds.forEach(id => fd.append('socialAccountIds', id))

          setFeedback('Enviando vídeo…')
          await xhrUpload('/posts/schedule/video', fd, pct => {
            setUploadProgress(pct)
            setFeedback(pct < 100 ? `Enviando vídeo… ${pct}%` : 'Registrando agendamento…')
          })

          showToast({
            type: 'success',
            title: 'Post agendado com sucesso',
            message: `Agendado para ${new Date(form.scheduledFor).toLocaleString('pt-BR')}`,
          })
          setTimeout(() => navigate('/dashboard/posts'), 700)
          setLoading(false)
          return
        } catch (err) {
          setFeedback(`Erro ao agendar: ${err.message}`)
          setLoading(false)
          return
        }
      }
    }

    if (status === 'scheduled' && token && !form.scheduledFor) {
      const hasVideoNetwork = form.networks.some(n => (n === 'tiktok' || n === 'youtube') &&
        (form.contentByNetwork[n]?.media || []).some(m => m.type === 'video' && m.file))
      if (hasVideoNetwork) {
        setFeedback('Defina a data e hora antes de agendar.')
        setLoading(false)
        return
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
  const activeHasMedia = (activeContent?.media?.length || 0) > 0
  const activeHasTitle = (activeContent?.title?.trim().length || 0) > 0
  const canGenCaption = activeHasMedia || activeHasTitle   // legenda: mídia OU título
  const canHashtags = activeHasMedia                       // hashtags: precisa de mídia

  // IA — gera uma legenda ideal pro post
  const handleGenerateCaption = async () => {
    if (!activeNetwork || aiBusy) return
    setAiBusy('caption')
    setFeedback('')
    try {
      const caption = await generateCaption({
        networkId: activeNetwork,
        title: activeContent?.title || '',
      })
      updateNetworkField(activeNetwork, 'content', caption.slice(0, activeMeta?.maxChars || 5000))
      setFeedback('Legenda gerada pela IA!')
    } finally {
      setAiBusy(null)
      setTimeout(() => setFeedback(''), 1800)
    }
  }

  // IA — anexa hashtags sugeridas ao final da legenda
  const handleSuggestHashtags = async () => {
    if (!activeNetwork || aiBusy) return
    setAiBusy('hashtags')
    setFeedback('')
    try {
      const tags = await suggestHashtags({
        networkId: activeNetwork,
        content: activeContent?.content || '',
        title: activeContent?.title || '',
      })
      const existing = (activeContent?.content || '').trimEnd()
      const block = (existing ? existing + '\n\n' : '') + tags.join(' ')
      updateNetworkField(activeNetwork, 'content', block.slice(0, activeMeta?.maxChars || 5000))
      setFeedback('Hashtags adicionadas!')
    } finally {
      setAiBusy(null)
      setTimeout(() => setFeedback(''), 1800)
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
                return (
                  <button
                    key={id}
                    type="button"
                    className={`composer__network-pill${selected ? ' composer__network-pill--active' : ''}`}
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
                      disabled={!canGenCaption || aiBusy !== null}
                      title={canGenCaption
                        ? 'Gerar uma legenda ideal com IA a partir do seu conteúdo'
                        : 'Adicione uma mídia ou um título primeiro'}
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
                        ? 'Sugerir as melhores hashtags pro seu conteúdo'
                        : 'Adicione uma mídia primeiro'}
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

                {/* Mídia por rede */}
                <div className="composer__field">
                  <label>
                    <LuImage size={14} /> Mídia pro {activeMeta?.label}
                  </label>
                  <MediaUploader
                    media={activeContent.media}
                    onChange={(media) => updateNetworkField(activeNetwork, 'media', media)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASSO 4 — Agendamento (global) */}
          {hasNetworks && (
            <div className="composer__step">
              <div className="composer__step-head">
                <span className="composer__step-num">4</span>
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
          disabled={loading || !canSubmit || !form.scheduledFor}
        >
          <LuCalendarClock size={15} /> Agendar
        </button>
      </div>
    </div>
  )
}
