import { motion } from 'framer-motion'
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { LuTrendingDown, LuTrendingUp, LuUsers } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const NETWORK_ICONS = { instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube }
const NETWORK_COLORS = { instagram: '#E1306C', tiktok: '#111827', youtube: '#FF0033' }

// `data` vem de getAudienceTotal() (services/analytics.js) — soma Instagram +
// TikTok + YouTube quando a rede selecionada no cabeçalho é "Todas as redes",
// e mostra só a rede filtrada quando o filtro é uma dessas 3 (o detalhamento
// por rede abaixo do total só aparece quando há mais de uma pra detalhar).
export default function FollowersCard({ data }) {
  if (!data) {
    return (
      <motion.div
        className="chart-card followers-total"
        variants={fadeUp} initial="hidden" animate="visible" custom={2}
      >
        <div className="chart-card__header">
          <h3>Seguidores</h3>
        </div>
        <div className="chart-card__empty">
          Conecte Instagram, TikTok ou YouTube pra ver seus seguidores aqui.
        </div>
      </motion.div>
    )
  }

  const { value, change, trend, breakdown } = data
  const TrendIcon = trend === 'down' ? LuTrendingDown : LuTrendingUp
  const showBreakdown = breakdown && breakdown.length > 1

  return (
    <motion.div
      className="chart-card followers-total"
      variants={fadeUp} initial="hidden" animate="visible" custom={2}
    >
      <div className="chart-card__header">
        <h3>Seguidores</h3>
        {!showBreakdown && breakdown?.[0] && (
          <span className="chart-card__sub">{breakdown[0].label}</span>
        )}
      </div>

      <div className="followers-total__hero">
        <div className="followers-total__icon"><LuUsers size={22} /></div>
        <strong className="followers-total__value">{value}</strong>
        {change && (
          <span className={`kpi-card__change kpi-card__change--${trend}`}>
            <TrendIcon size={12} /> {change}
          </span>
        )}
      </div>

      {showBreakdown && (
        <div className="followers-total__breakdown">
          {breakdown.map(item => {
            const Icon = NETWORK_ICONS[item.network]
            return (
              <div key={item.network} className="followers-total__row">
                <span className="followers-total__row-icon" style={{ color: NETWORK_COLORS[item.network] }}>
                  {Icon && <Icon size={14} />}
                </span>
                <span className="followers-total__row-label">{item.label}</span>
                <span className="followers-total__row-value">{item.formattedValue}</span>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
