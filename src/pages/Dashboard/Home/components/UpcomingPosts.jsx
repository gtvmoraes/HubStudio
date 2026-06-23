import { motion } from 'framer-motion'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const NET_ICONS = {
  instagram: FaInstagram,
  tiktok:    FaTiktok,
  youtube:   FaYoutube,
  facebook:  FaFacebook,
  linkedin:  FaLinkedin,
  twitter:   FaXTwitter,
}

export default function UpcomingPosts({ posts = [], onSeeAll }) {
  const { theme } = useTheme()
  return (
    <motion.div
      className="chart-card upcoming"
      variants={fadeUp} initial="hidden" animate="visible" custom={3}
    >
      <div className="chart-card__header">
        <h3>Próximos agendamentos</h3>
        <button type="button" className="chart-card__link" onClick={onSeeAll}>Ver todos</button>
      </div>

      {posts.length === 0 ? (
        <div className="chart-card__empty">Nada agendado por enquanto.</div>
      ) : (
        <ul className="upcoming__list">
          {posts.map(p => {
            const Icon = NET_ICONS[p.network] ?? NET_ICONS.instagram
            const color = networkColor(p.network, theme)
            return (
              <li key={p.id} className="upcoming__item">
                <span className="upcoming__icon" style={{ background: `${color}18`, color }}>
                  <Icon size={15} />
                </span>
                <div className="upcoming__body">
                  <span className="upcoming__title">{p.title}</span>
                  <span className="upcoming__when">{p.date} · {p.time}</span>
                </div>
                <span className="upcoming__countdown">{p.countdown}</span>
              </li>
            )
          })}
        </ul>
      )}
    </motion.div>
  )
}
