import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { LuTrendingDown, LuTrendingUp, LuUsers, LuArrowRight } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const NETWORK_ICONS = { instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube }
const EMPTY_NETS = ['instagram', 'tiktok', 'youtube']

// `data` vem de getAudienceTotal() (services/analytics.js) — soma Instagram +
// TikTok + YouTube quando a rede selecionada é "Todas", e mostra só a rede
// filtrada quando o filtro é uma dessas 3 (o detalhamento por rede abaixo do
// total só aparece quando há mais de uma pra detalhar).
export default function FollowersCard({ data }) {
  const navigate = useNavigate()
  const { theme } = useTheme()

  // ── Estado vazio: convite desenhado (não um texto solto) ──
  if (!data) {
    return (
      <motion.div
        className="chart-card followers-total followers-total--empty"
        variants={fadeUp} initial="hidden" animate="visible" custom={2}
      >
        <div className="chart-card__header"><h3>Seguidores</h3></div>

        <div className="followers-total__empty">
          <div className="followers-total__empty-icons">
            {EMPTY_NETS.map((n, i) => {
              const Icon = NETWORK_ICONS[n]
              return (
                <span
                  key={n}
                  className="followers-total__empty-badge"
                  style={{ color: networkColor(n, theme), zIndex: EMPTY_NETS.length - i }}
                >
                  <Icon size={18} />
                </span>
              )
            })}
          </div>

          <div className="followers-total__empty-text">
            <strong>Some seus seguidores num só lugar</strong>
            <p>Conecte Instagram, TikTok ou YouTube e acompanhe o crescimento total da sua audiência.</p>
          </div>

          <button
            type="button"
            className="followers-total__connect"
            onClick={() => navigate('/dashboard/configuracoes?tab=redes')}
          >
            Conectar redes <LuArrowRight size={15} />
          </button>
        </div>
      </motion.div>
    )
  }

  const { value, change, trend, breakdown } = data
  const TrendIcon = trend === 'down' ? LuTrendingDown : LuTrendingUp
  const showBreakdown = breakdown && breakdown.length > 1
  const maxVal = showBreakdown ? Math.max(...breakdown.map(b => b.value), 1) : 1

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

      <div className="followers-total__body">
        {/* Total como número herói */}
        <div className="followers-total__hero">
          <span className="followers-total__hero-top">
            <span className="followers-total__hero-icon"><LuUsers size={18} /></span>
            Seguidores totais
          </span>
          <strong className="followers-total__value">{value}</strong>
          {change && (
            <span className={`followers-total__change followers-total__change--${trend}`}>
              <TrendIcon size={13} /> {change}
              <em>no período</em>
            </span>
          )}
        </div>

        {/* Participação por rede — com barras */}
        {showBreakdown && (
          <div className="followers-total__nets">
            {breakdown.map(item => {
              const Icon = NETWORK_ICONS[item.network]
              const pct = Math.round((item.value / maxVal) * 100)
              return (
                <div key={item.network} className="followers-total__net">
                  <span className="followers-total__net-icon" style={{ color: networkColor(item.network, theme) }}>
                    {Icon && <Icon size={15} />}
                  </span>
                  <div className="followers-total__net-main">
                    <div className="followers-total__net-line">
                      <span className="followers-total__net-label">{item.label}</span>
                      <span className="followers-total__net-value">{item.formattedValue}</span>
                    </div>
                    <div className="followers-total__net-track">
                      <span
                        className="followers-total__net-fill"
                        style={{ width: `${pct}%`, background: networkColor(item.network, theme) }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
