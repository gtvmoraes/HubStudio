import { motion } from 'framer-motion'
import { LuMessageCircle, LuTicket, LuMail, LuArrowRight } from 'react-icons/lu'
import { FaWhatsapp } from 'react-icons/fa'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
}

export default function SupportChannels({ onOpenChat, onOpenTicket }) {
  const CHANNELS = [
    {
      id: 'chat',
      icon: LuMessageCircle,
      title: 'Chat ao vivo',
      desc: 'Fale agora com um especialista.',
      meta: 'Online · responde em ~2 min',
      online: true,
      onClick: onOpenChat,
    },
    {
      id: 'ticket',
      icon: LuTicket,
      title: 'Abrir chamado',
      desc: 'Registre um problema e acompanhe.',
      meta: 'Resposta prioritária em até 4h',
      onClick: onOpenTicket,
    },
    {
      id: 'email',
      icon: LuMail,
      title: 'E-mail',
      desc: 'suporte@hubstudio.com',
      meta: 'Resposta em até 24h',
      onClick: () => { window.location.href = 'mailto:suporte@hubstudio.com' },
    },
    {
      id: 'whatsapp',
      icon: FaWhatsapp,
      title: 'WhatsApp',
      desc: 'Atendimento pelo celular.',
      meta: 'Seg–Sex, 9h às 18h',
      onClick: () => { window.open('https://wa.me/5500000000000', '_blank', 'noopener') },
    },
  ]

  return (
    <div className="sup-channels">
      {CHANNELS.map(({ id, icon: Icon, title, desc, meta, online, onClick }, i) => (
        <motion.button
          key={id}
          type="button"
          className="sup-channel"
          onClick={onClick}
          variants={fadeUp} initial="hidden" animate="visible" custom={i}
          whileHover={{ y: -4 }}
        >
          <span className={`sup-channel__icon sup-channel__icon--${id}`}>
            <Icon size={20} />
          </span>
          <span className="sup-channel__body">
            <span className="sup-channel__title">{title}</span>
            <span className="sup-channel__desc">{desc}</span>
            <span className={`sup-channel__meta ${online ? 'sup-channel__meta--online' : ''}`}>
              {online && <span className="sup-channel__dot" aria-hidden="true" />}
              {meta}
            </span>
          </span>
          <LuArrowRight size={16} className="sup-channel__arrow" />
        </motion.button>
      ))}
    </div>
  )
}
