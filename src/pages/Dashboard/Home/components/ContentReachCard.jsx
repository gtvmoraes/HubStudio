import { motion } from 'framer-motion'
import { FaInstagram, FaTiktok, FaYoutube, FaLinkedin, FaFacebook, FaTwitter } from 'react-icons/fa'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { NETWORK_META, networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'
import { SkeletonLines } from './CardSkeleton'
import AnimatedNumber from '../../../../components/AnimatedNumber/AnimatedNumber'

const NETWORK_ICONS = {
  instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube,
  linkedin: FaLinkedin, facebook: FaFacebook, twitter: FaTwitter,
}

const compact = (n) => {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace('.0', '')}K`
  return `${num}`
}

// Instagram mede alcance (contas únicas); as demais APIs expõem visualizações.
const metricHint = (networks) => {
  const hasIg = networks.includes('instagram')
  const hasOthers = networks.some(n => n !== 'instagram')
  if (hasIg && hasOthers) return 'Alcance no Instagram · visualizações nas demais redes'
  if (hasIg) return 'Contas alcançadas no Instagram'
  return 'Visualizações dos posts no período'
}

// `data` vem de GET /analytics/content-reach: uma fatia por rede + formato,
// com o número absoluto (`reach`) e a fatia do total (`value`, em %).
export default function ContentReachCard({ data }) {
  const { theme } = useTheme()

  const rows = Array.isArray(data) ? data : []
  const total = rows.reduce((sum, r) => sum + (Number(r.reach) || 0), 0)
  const max = Math.max(...rows.map(r => Number(r.reach) || 0), 1)
  const networks = [...new Set(rows.map(r => r.network).filter(Boolean))]

  return (
    <motion.div
      className="chart-card content-reach"
      variants={fadeUp} initial="hidden" animate="visible" custom={7}
    >
      <div className="chart-card__header">
        <h3>Alcance por tipo de conteúdo</h3>
      </div>

      {data === undefined ? (
        <SkeletonLines rows={5} height={16} />
      ) : rows.length === 0 ? (
        <div className="chart-card__empty">Sem dados de alcance no período.</div>
      ) : (
        <>
          <div className="content-reach__summary">
            <div className="content-reach__headline">
              <strong className="content-reach__total">
                <AnimatedNumber value={compact(total)} />
              </strong>
              <span className="chart-card__sub">{metricHint(networks)}</span>
            </div>
            {networks.length > 1 && (
              <div className="content-reach__nets" aria-label={`${networks.length} redes`}>
                {networks.map(n => {
                  const Icon = NETWORK_ICONS[n]
                  return Icon ? <Icon key={n} size={14} style={{ color: networkColor(n, theme) }} /> : null
                })}
              </div>
            )}
          </div>

          <div className="content-reach__stack" role="img"
            aria-label={rows.map(r => `${r.type} ${r.value}%`).join(', ')}>
            {rows.map((r, i) => (
              <motion.span
                key={`${r.network}-${r.type}`}
                style={{ background: r.color }}
                initial={{ flexGrow: 0 }}
                animate={{ flexGrow: Number(r.reach) || 0 }}
                transition={{ duration: 0.8, delay: 0.05 * i }}
              />
            ))}
          </div>

          <ul className="content-reach__list">
            {rows.map((r, i) => {
              const Icon = NETWORK_ICONS[r.network]
              const pct = r.value > 0 ? `${r.value}%` : '<1%'
              return (
                <li key={`${r.network}-${r.type}`} className="content-reach__row">
                  <span className="content-reach__dot" style={{ background: r.color }} />
                  <div className="content-reach__label">
                    <span className="content-reach__type">{r.type}</span>
                    {r.network && (
                      <span className="content-reach__net">
                        {Icon && <Icon size={10} />}
                        {NETWORK_META[r.network]?.label ?? r.network}
                      </span>
                    )}
                  </div>
                  <div className="content-reach__bar">
                    <motion.span
                      style={{ background: r.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((Number(r.reach) || 0) / max) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.1 + 0.05 * i }}
                    />
                  </div>
                  <span className="content-reach__value">{compact(r.reach)}</span>
                  <span className="content-reach__pct">{pct}</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </motion.div>
  )
}
