import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { LuTrendingDown, LuTrendingUp, LuUsers, LuArrowRight } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'
import { SkeletonLines } from './CardSkeleton'
import AnimatedNumber from '../../../../components/AnimatedNumber/AnimatedNumber'

const NETWORK_ICONS = { instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube }
const EMPTY_NETS = ['instagram', 'tiktok', 'youtube']

// `data` vem de getAudienceTotal() (services/analytics.js) — soma Instagram +
// TikTok + YouTube quando a rede selecionada é "Todas", e mostra só a rede
// filtrada quando o filtro é uma dessas 3 (o detalhamento por rede abaixo do
// total só aparece quando há mais de uma pra detalhar).
// A API devolve, por período, o total atual (`raw`) e a variação (`change`,
// ex.: "+7.4%"). O ganho absoluto sai daí: total − total/(1 + variação).
// Sem `change` não dá pra derivar nada — devolve null e a coluna mostra "—".
function gainFrom(entry) {
  if (!entry) return null
  const pct = parseFloat(String(entry.change ?? '').replace('%', '').replace(',', '.'))
  const total = Number(entry.raw)
  if (!Number.isFinite(pct) || !Number.isFinite(total)) return null
  if (pct <= -100) return null
  const previous = total / (1 + pct / 100)
  return { gain: Math.round(total - previous), pct }
}

const fmtGain = (n) => {
  if (n === null || n === undefined) return '—'
  const abs = Math.abs(n)
  const short = abs >= 1_000_000 ? `${(abs / 1_000_000).toFixed(1)}M`
    : abs >= 1_000 ? `${(abs / 1_000).toFixed(1)}K`
    : `${abs}`
  return `${n < 0 ? '−' : '+'}${short}`
}

export default function FollowersCard({ data, growth }) {
  const navigate = useNavigate()
  const { theme } = useTheme()

  // Carregando — reserva a mesma altura do conteúdo final (sem salto)
  if (data === undefined) {
    return (
      <motion.div
        className="chart-card followers-total"
        variants={fadeUp} initial="hidden" animate="visible" custom={2}
      >
        <div className="chart-card__header"><h3>Seguidores</h3></div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 190, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ height: 12, width: 120, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 44, width: 150, borderRadius: 10 }} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}><SkeletonLines rows={3} height={14} /></div>
        </div>
      </motion.div>
    )
  }

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

  // Linhas do resumo de crescimento — só as que a API realmente devolveu.
  const growthRows = [
    { key: 'week',  label: 'Últimos 7 dias',  entry: growth?.week  },
    { key: 'month', label: 'Últimos 30 dias', entry: growth?.month },
    { key: 'all',   label: 'Desde o início',  entry: growth?.all   },
  ]
    .filter(r => r.entry)
    .map(r => {
      const g = gainFrom(r.entry)
      return {
        key: r.key,
        label: r.label,
        gain: g ? g.gain : null,
        pct: g ? g.pct : null,
        dir: !g || g.pct === 0 ? 'flat' : g.pct > 0 ? 'up' : 'down',
      }
    })

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
          <strong className="followers-total__value"><AnimatedNumber value={value} /></strong>
          {change && (
            <span className={`followers-total__change followers-total__change--${trend}`}>
              <TrendIcon size={13} /> {change}
              <em>no período</em>
            </span>
          )}
        </div>

        {/* Uma única rede: não há o que detalhar, então o espaço vira o
            resumo de crescimento (7 dias / 30 dias / total). */}
        {!showBreakdown && growthRows.length > 0 && (
          <div className="followers-total__growth">
            {growthRows.map(row => (
              <div key={row.key} className="followers-total__growth-item">
                <span className="followers-total__growth-label">{row.label}</span>
                <strong className="followers-total__growth-value"><AnimatedNumber value={fmtGain(row.gain)} /></strong>
                <span
                  className={`followers-total__growth-pct followers-total__growth-pct--${row.dir}`}
                >
                  {row.pct === null ? 'sem dados' : `${row.pct > 0 ? '+' : ''}${row.pct.toFixed(1)}%`}
                </span>
              </div>
            ))}
          </div>
        )}

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
                      <span className="followers-total__net-value"><AnimatedNumber value={item.formattedValue} /></span>
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
