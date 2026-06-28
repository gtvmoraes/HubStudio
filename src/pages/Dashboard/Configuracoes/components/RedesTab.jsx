import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LuShieldCheck, LuCircleCheck, LuCircleAlert, LuWifiOff,
  LuCheck, LuLock, LuRefreshCw, LuLoader, LuUnplug,
} from 'react-icons/lu'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import Button from '../../../../components/Button/Button'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { authFetch, API_BASE } from '../../../../services/api'
import { useTheme } from '../../../../contexts/ThemeContext'

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
  const [accounts, setAccounts] = useState([])   // dados da API
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(null)   // platform id em progresso
  const [disconnecting, setDisconnecting] = useState(null) // account id em progresso
  const [error, setError] = useState('')

  const fetchAccounts = useCallback(async () => {
    setLoading(true)
    setError('')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)
    try {
      const res = await authFetch('/social/accounts', { signal: controller.signal })
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
  }, [])

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
    }
  })

  const handleConnect = async (platform) => {
    const meta = ALL_PLATFORMS.find(p => p.id === platform)
    if (!meta) return
    setConnecting(platform)
    setError('')
    try {
      const res = await authFetch(meta.connectPath)
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
      const res = await authFetch(`/social/accounts/${accountId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      setAccounts(prev => prev.filter(a => a.id !== accountId))
    } catch (e) {
      setError(`Erro ao desconectar: ${e.message}`)
    } finally {
      setDisconnecting(null)
    }
  }

  const isAuthenticated = Boolean(localStorage.getItem('hs-token'))

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Redes sociais</h2>
        <p>Vincule suas contas para agendar e analisar tudo num só lugar.</p>
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
        {networks.map(({ id, name, icon: Icon, status, handle, avatarUrl, accountId, connectPath }, i) => {
          const cfg = STATUS_CONFIG[status]
          const StatusIcon = cfg.icon
          const color = networkColor(id, theme)
          const isBusy = connecting === id || disconnecting === accountId
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
              </div>

              <div className="set-net-card__actions">
                {status === 'connected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => handleDisconnect(accountId, name)}
                    disabled={isBusy || !isAuthenticated}
                  >
                    <LuUnplug size={13} /> Desconectar
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleConnect(id)}
                    disabled={isBusy || !isAuthenticated}
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
