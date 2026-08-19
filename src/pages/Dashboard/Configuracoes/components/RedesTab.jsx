import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LuShieldCheck, LuCircleCheck, LuCircleAlert, LuWifiOff,
  LuCheck, LuLock, LuRefreshCw, LuLoader, LuUnplug, LuKey,
  LuClockAlert, LuCircleX,
} from 'react-icons/lu'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import Button from '../../../../components/Button/Button'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { authFetch } from '../../../../services/api'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useTeam } from '../../../../contexts/TeamContext'
import { PERMISSION_MATRIX } from '../../../../services/team'

const ALL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram',   icon: FaInstagram, connectPath: '/social/instagram/connect' },
  { id: 'tiktok',    name: 'TikTok',      icon: FaTiktok,    connectPath: '/social/tiktok/connect'    },
  { id: 'youtube',   name: 'YouTube',     icon: FaYoutube,   connectPath: '/social/youtube/connect'   },
  { id: 'facebook',  name: 'Facebook',    icon: FaFacebook,  connectPath: '/social/facebook/connect'  },
  { id: 'linkedin',  name: 'LinkedIn',    icon: FaLinkedin,  connectPath: '/social/linkedin/connect'  },
]

const STATUS_CONFIG = {
  connected:    { label: 'Conectado',    color: 'success', icon: LuCircleCheck  },
  expired:      { label: 'Expirado',     color: 'warning', icon: LuCircleAlert  },
  disconnected: { label: 'Desconectado', color: 'error',   icon: LuWifiOff      },
}

const PERMISSIONS = [
  { label: 'Publicação de conteúdo', desc: 'Criar, agendar e excluir publicações nos perfis vinculados.', done: true  },
  { label: 'Leitura de métricas',    desc: 'Acessar alcance, engajamento e crescimento de seguidores.',   done: true  },
  { label: 'Gestão de comentários',  desc: 'Responder e moderar comentários direto pela plataforma.',     done: false },
]

export default function RedesTab() {
  const { theme } = useTheme()
  const { activeContext } = useTeam()
  const companyId = activeContext.personal ? null : activeContext.id
  const canManage = activeContext.personal || Boolean(PERMISSION_MATRIX[activeContext.role]?.accountSettings)
  const [accounts, setAccounts] = useState([])   // dados da API
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)     // platform id em progresso
  const [disconnecting, setDisconnecting] = useState(null) // account id em progresso
  const [refreshing, setRefreshing] = useState(null)     // account id sendo renovado
  const [refreshAll, setRefreshAll] = useState(false)
  const [error, setError] = useState('')

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError('')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)
    try {
      const url = companyId ? `/social/accounts?companyId=${companyId}` : '/social/accounts'
      const res = await authFetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setAccounts(await res.json())
    } catch (e) {
      if (e.name === 'AbortError') {
        setError('Tempo limite excedido. Verifique sua conexão e tente novamente.')
      } else {
        setError('Não foi possível carregar as contas. Verifique sua sessão.')
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    const token = localStorage.getItem('hs-token')
    if (token) {
      fetchAccounts()
    } else {
      setLoading(false)
    }

    // Recarrega ao voltar para a aba (OAuth abre na mesma aba e retorna)
    const onFocus = () => {
      const t = localStorage.getItem('hs-token')
      if (t) fetchAccounts()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [fetchAccounts])

  // Mescla os dados da API com a lista fixa de plataformas
  const networks = ALL_PLATFORMS.map(p => {
    const connected = accounts.find(a => a.platform === p.id)
    return {
      ...p,
      accountId: connected?.id ?? null,
      handle: connected?.username ?? '—',
      avatarUrl: connected?.avatarUrl ?? null,
      status: connected?.status ?? 'disconnected',
      tokenExpiresAt: connected?.tokenExpiresAt ?? null,
      companyName: connected?.companyName ?? null,
      personal: connected?.personal ?? null,
    }
  })

  const handleConnect = async (platform) => {
    const meta = ALL_PLATFORMS.find(p => p.id === platform)
    if (!meta) return
    setConnecting(platform)
    setError('')
    try {
      const connectUrl = companyId ? `${meta.connectPath}?companyId=${companyId}` : meta.connectPath
      const res = await authFetch(connectUrl)
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const data = await res.json()
      const url = data.authorizationUrl || data.authorization_url
      if (!url) throw new Error('URL de autorização não retornada pelo servidor')
      // Redireciona na mesma aba; ao voltar, o listener focus recarrega as contas
      window.location.href = url
    } catch (e) {
      setError(`Erro ao iniciar conexão com ${platform}: ${e.message}`)
      setConnecting(null)
    }
  }

  const handleDisconnect = async (accountId, platformName) => {
    if (!window.confirm(`Desconectar a conta ${platformName}? Os posts agendados para essa conta serão cancelados.`)) return
    setDisconnecting(accountId)
    setError('')
    try {
      const deleteUrl = companyId ? `/social/accounts/${accountId}?companyId=${companyId}` : `/social/accounts/${accountId}`
      const res = await authFetch(deleteUrl, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setAccounts(prev => prev.filter(a => a.id !== accountId))
    } catch (e) {
      setError(`Erro ao desconectar: ${e.message}`)
    } finally {
      setDisconnecting(null)
    }
  }

  const handleRefreshToken = async (accountId) => {
    setRefreshing(accountId)
    setError('')
    try {
      const refreshUrl = companyId ? `/social/accounts/${accountId}/refresh?companyId=${companyId}` : `/social/accounts/${accountId}/refresh`
      const res = await authFetch(refreshUrl, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.message || `Erro ${res.status}`)
      }
      const updated = await res.json()
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, ...updated } : a))
    } catch (e) {
      setError(`Erro ao renovar token: ${e.message}`)
    } finally {
      setRefreshing(null)
    }
  }

  const handleRefreshAll = async () => {
    setRefreshAll(true)
    setError('')
    const connected = accounts.filter(a => a.status === 'connected' || a.status === 'expired')
    for (const acc of connected) {
      try {
        const rUrl = companyId ? `/social/accounts/${acc.id}/refresh?companyId=${companyId}` : `/social/accounts/${acc.id}/refresh`
        const res = await authFetch(rUrl, { method: 'POST' })
        if (res.ok) {
          const updated = await res.json()
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, ...updated } : a))
        }
      } catch { /* continua para as demais */ }
    }
    setRefreshAll(false)
  }

  const isAuthenticated = Boolean(localStorage.getItem('hs-token'))

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Redes sociais</h2>
        <p>
          Vincule suas contas para agendar e analisar tudo num só lugar. Você está configurando as
          redes de <strong>{activeContext.personal ? 'Pessoal' : activeContext.name}</strong>
          {!activeContext.personal ? ' — troque de contexto no menu lateral para gerenciar outra equipe.' : '.'}
        </p>
        {!canManage && (
          <div className="set-net-error">
            Seu cargo em {activeContext.name} ({activeContext.role}) não tem permissão para gerenciar redes sociais — fale com um admin/gerente.
          </div>
        )}
        {isAuthenticated && (
          <button
            type="button"
            className="set-refresh-btn"
            onClick={fetchAccounts}
            disabled={loading}
            title="Atualizar lista de contas"
          >
            <LuRefreshCw size={14} className={loading ? 'spin' : ''} />
            Atualizar
          </button>
        )}
      </div>

      {error && (
        <div className="set-net-error">{error}</div>
      )}

      {!isAuthenticated && (
        <div className="set-net-error">Faça login para gerenciar suas redes sociais.</div>
      )}

      <div className="set-net-grid">
        {networks.map(({ id, name, icon: Icon, status, handle, avatarUrl, accountId, companyName, personal }, i) => {
          const cfg = STATUS_CONFIG[status]
          const StatusIcon = cfg.icon
          const color = networkColor(id, theme)
          const isBusy = connecting === id || (accountId !== null && disconnecting === accountId)
          return (
            <motion.div
              key={id}
              className="set-net-card"
              style={{ '--net-color': color }}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
            >
              <div className="set-net-card__top">
                <div className="set-net-card__icon" style={{ background: `${color}18`, color }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt={name} className="set-net-card__avatar" />
                    : <Icon size={22} />
                  }
                </div>
                <span className={`set-net-card__status set-net-card__status--${cfg.color}`}>
                  {isBusy
                    ? <LuLoader size={12} className="spin" />
                    : <StatusIcon size={12} />
                  }
                  {isBusy ? 'Aguarde…' : cfg.label}
                </span>
              </div>

              <div className="set-net-card__body">
                <h3>{name}</h3>
                <span className="set-net-card__handle">{handle}</span>
                {companyName && (
                  <span className="set-net-card__context">
                    {personal ? 'Pessoal' : companyName}
                  </span>
                )}
              </div>

              <div className="set-net-card__actions">
                {status === 'connected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleDisconnect(accountId, name)}
                    disabled={isBusy || !isAuthenticated || !canManage}
                    title={!canManage ? 'Você não tem permissão para gerenciar redes desta equipe' : undefined}
                  >
                    <LuUnplug size={13} /> Desconectar
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleConnect(id)}
                    disabled={isBusy || !isAuthenticated || !canManage}
                    title={!canManage ? 'Você não tem permissão para gerenciar redes desta equipe' : undefined}
                  >
                    {status === 'expired' ? 'Reconectar' : 'Conectar'}
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}

        {loading && (
          <motion.div
            className="set-net-card set-net-card--loading"
            variants={fadeUp} initial="hidden" animate="visible"
          >
            <LuLoader size={24} className="spin" />
          </motion.div>
        )}
      </div>

      {/* ── Painel de tokens ── */}
      {accounts.length > 0 && (
        <div className="set-tokens">
          <div className="set-tokens__head">
            <div className="set-tokens__title">
              <LuKey size={16} />
              <strong>Status dos tokens</strong>
              <span className="set-tokens__subtitle">Renovação automática a cada 15 min — use o botão para forçar agora</span>
            </div>
            <button
              type="button"
              className="set-tokens__refresh-all"
              onClick={handleRefreshAll}
              disabled={refreshAll || !canManage}
              title={!canManage ? 'Você não tem permissão para gerenciar redes desta equipe' : undefined}
            >
              {refreshAll
                ? <LuLoader size={13} className="spin" />
                : <LuRefreshCw size={13} />}
              Renovar todos
            </button>
          </div>

          <div className="set-tokens__table">
            <div className="set-tokens__row set-tokens__row--header">
              <span>Plataforma</span>
              <span>Token expira em</span>
              <span>Refresh token</span>
              <span>Última renovação</span>
              <span>Status</span>
              <span></span>
            </div>

            {accounts.map(acc => {
              const Icon = { instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube, facebook: FaFacebook, linkedin: FaLinkedin }[acc.platform]
              const color = networkColor(acc.platform, theme)
              const now = new Date()
              const expiresAt = acc.tokenExpiresAt ? new Date(acc.tokenExpiresAt) : null
              const msLeft = expiresAt ? expiresAt - now : null
              const daysLeft = msLeft !== null ? Math.ceil(msLeft / 86400000) : null
              const hoursLeft = msLeft !== null ? Math.ceil(msLeft / 3600000) : null

              let tokenHealth = 'ok'
              let expiryLabel = '—'
              if (expiresAt === null) {
                tokenHealth = 'unknown'
                expiryLabel = 'Sem expiração'
              } else if (msLeft < 0) {
                tokenHealth = 'expired'
                expiryLabel = 'Expirado'
              } else if (daysLeft <= 1) {
                tokenHealth = 'critical'
                expiryLabel = hoursLeft <= 1 ? '< 1h' : `${hoursLeft}h`
              } else if (daysLeft <= 7) {
                tokenHealth = 'warning'
                expiryLabel = `${daysLeft} dias`
              } else {
                expiryLabel = `${daysLeft} dias`
              }

              const refreshExpires = acc.refreshTokenExpiresAt ? new Date(acc.refreshTokenExpiresAt) : null
              const refreshDays = refreshExpires ? Math.ceil((refreshExpires - now) / 86400000) : null
              const refreshLabel = acc.hasRefreshToken
                ? (refreshDays !== null ? (refreshDays > 0 ? `${refreshDays}d` : 'Expirado') : 'Disponível')
                : 'Indisponível'

              const updatedAt = acc.updatedAt ? new Date(acc.updatedAt) : null
              const updatedLabel = updatedAt
                ? updatedAt.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                : '—'

              const isRefreshing = refreshing === acc.id

              return (
                <div key={acc.id} className={`set-tokens__row set-tokens__row--${tokenHealth}`}>
                  <span className="set-tokens__platform">
                    {Icon && <Icon size={14} style={{ color }} />}
                    {acc.username || acc.platform}
                  </span>
                  <span className={`set-tokens__expiry set-tokens__expiry--${tokenHealth}`}>
                    {tokenHealth === 'expired' && <LuCircleX size={13} />}
                    {tokenHealth === 'critical' && <LuClockAlert size={13} />}
                    {tokenHealth === 'warning' && <LuCircleAlert size={13} />}
                    {(tokenHealth === 'ok' || tokenHealth === 'unknown') && <LuCircleCheck size={13} />}
                    {expiryLabel}
                  </span>
                  <span className={`set-tokens__refresh-status ${!acc.hasRefreshToken ? 'set-tokens__refresh-status--none' : ''}`}>
                    {refreshLabel}
                  </span>
                  <span className="set-tokens__updated">{updatedLabel}</span>
                  <span className={`set-tokens__badge set-tokens__badge--${tokenHealth}`}>
                    {tokenHealth === 'expired' ? 'Expirado'
                      : tokenHealth === 'critical' ? 'Crítico'
                      : tokenHealth === 'warning' ? 'Atenção'
                      : tokenHealth === 'unknown' ? 'Sem data'
                      : 'OK'}
                  </span>
                  <span>
                    <button
                      type="button"
                      className="set-tokens__btn"
                      onClick={() => handleRefreshToken(acc.id)}
                      disabled={isRefreshing || refreshAll || !canManage}
                      title={!canManage ? 'Você não tem permissão para gerenciar redes desta equipe' : 'Forçar renovação do token agora'}
                    >
                      {isRefreshing
                        ? <LuLoader size={12} className="spin" />
                        : <LuRefreshCw size={12} />}
                      Renovar
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="set-net-bottom">
        <div className="set-card set-perms">
          <div className="set-perms__head">
            <div className="set-perms__icon"><LuShieldCheck size={20} /></div>
            <div>
              <strong>Permissões concedidas</strong>
              <p>Solicitamos apenas os acessos essenciais para a plataforma funcionar.</p>
            </div>
          </div>
          <ul className="set-perms__list">
            {PERMISSIONS.map(({ label, desc, done }) => (
              <li key={label}>
                <div>
                  <strong>{label}</strong>
                  <p>{desc}</p>
                </div>
                <span className={`set-perms__check ${done ? 'is-done' : 'is-lock'}`}>
                  {done ? <LuCheck size={15} /> : <LuLock size={13} />}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="set-card set-security">
          <div className="set-security__icon"><LuShieldCheck size={22} /></div>
          <strong>Seus dados estão seguros</strong>
          <p>
            Todos os tokens de acesso são criptografados em trânsito e em repouso.
            O HubStudio nunca armazena suas senhas de redes sociais e nunca publica
            nada sem a sua autorização.
          </p>
        </div>
      </div>
    </div>
  )
}
