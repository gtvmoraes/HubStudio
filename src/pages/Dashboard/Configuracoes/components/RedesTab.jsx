import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LuShieldCheck, LuCircleCheck, LuCircleAlert, LuWifiOff, LuPlus, LuCheck, LuLock,
} from 'react-icons/lu'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Button from '../../../../components/Button/Button'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const INITIAL = [
  { id: 'instagram', name: 'Instagram',   icon: FaInstagram, status: 'connected',    handle: '@hubstudio' },
  { id: 'tiktok',    name: 'TikTok',      icon: FaTiktok,    status: 'expired',      handle: '@hubstudio' },
  { id: 'youtube',   name: 'YouTube',     icon: FaYoutube,   status: 'connected',    handle: 'HubStudio' },
  { id: 'facebook',  name: 'Facebook',    icon: FaFacebook,  status: 'connected',    handle: 'HubStudio' },
  { id: 'linkedin',  name: 'LinkedIn',    icon: FaLinkedin,  status: 'disconnected', handle: '—' },
  { id: 'twitter',   name: 'X (Twitter)', icon: FaXTwitter,  status: 'disconnected', handle: '—' },
]

const STATUS_CONFIG = {
  connected:    { label: 'Conectado',    color: 'success', icon: LuCircleCheck, btnLabel: 'Gerenciar',  btnVariant: 'outline' },
  expired:      { label: 'Expirado',     color: 'warning', icon: LuCircleAlert, btnLabel: 'Reconectar', btnVariant: 'primary' },
  disconnected: { label: 'Desconectado', color: 'error',   icon: LuWifiOff,     btnLabel: 'Conectar',   btnVariant: 'primary' },
}

const PERMISSIONS = [
  { label: 'Publicação de conteúdo', desc: 'Criar, agendar e excluir publicações nos perfis vinculados.', done: true },
  { label: 'Leitura de métricas',    desc: 'Acessar alcance, engajamento e crescimento de seguidores.',   done: true },
  { label: 'Gestão de comentários',  desc: 'Responder e moderar comentários direto pela plataforma.',     done: false },
]

export default function RedesTab() {
  const { theme } = useTheme()
  const [networks, setNetworks] = useState(INITIAL)

  const handleAction = (id, status) => {
    if (status === 'connected') return
    setNetworks(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'connected', handle: n.handle === '—' ? '@hubstudio' : n.handle } : n
    ))
  }

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Redes sociais</h2>
        <p>Vincule suas contas para agendar e analisar tudo num só lugar.</p>
      </div>

      <div className="set-net-grid">
        {networks.map(({ id, name, icon: Icon, status, handle }, i) => {
          const cfg = STATUS_CONFIG[status]
          const StatusIcon = cfg.icon
          const color = networkColor(id, theme)
          return (
            <motion.div
              key={id}
              className="set-net-card"
              style={{ '--net-color': color }}
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
            >
              <div className="set-net-card__top">
                <div className="set-net-card__icon" style={{ background: `${color}18`, color }}>
                  <Icon size={22} />
                </div>
                <span className={`set-net-card__status set-net-card__status--${cfg.color}`}>
                  <StatusIcon size={12} /> {cfg.label}
                </span>
              </div>
              <div className="set-net-card__body">
                <h3>{name}</h3>
                <span className="set-net-card__handle">{handle}</span>
              </div>
              <Button
                variant={cfg.btnVariant}
                size="sm"
                fullWidth
                onClick={() => handleAction(id, status)}
              >
                {cfg.btnLabel}
              </Button>
            </motion.div>
          )
        })}

        <motion.button
          type="button"
          className="set-net-card set-net-card--add"
          variants={fadeUp} initial="hidden" animate="visible" custom={networks.length}
        >
          <span className="set-net-card__add-icon"><LuPlus size={24} /></span>
          <span>Conectar outra rede</span>
        </motion.button>
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
