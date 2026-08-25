import { motion } from 'framer-motion'
import { FaInstagram } from 'react-icons/fa'
import { LuEye, LuHeart, LuMessageCircle, LuTrendingUp, LuTrendingDown } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const STAT_ICONS = {
  views: LuEye, likes: LuHeart, comments: LuMessageCircle, followers: FaInstagram,
}
const STAT_LABELS = {
  views: 'Visualizações',
  likes: 'Curtidas',
  comments: 'Comentários',
  followers: 'Seguidores',
}

// Views/likes/comments vêm das métricas reais coletadas por post (TikTok/
// YouTube/Instagram/Facebook/LinkedIn). Seguidores é à parte (prop `followers`,
// só Instagram tem contagem rastreada hoje) — ícone do Instagram no tile deixa
// o escopo claro sem precisar de texto extra.
const SHOWN_KEYS = ['views', 'likes', 'comments']

function Skeleton() {
  return (
    <div className="kpi-card kpi-card--skeleton">
      <div className="skeleton kpi-card__icon-skeleton" />
      <div className="kpi-card__body-skeleton">
        <div className="skeleton skeleton--label" />
        <div className="skeleton skeleton--value" />
      </div>
    </div>
  )
}

export default function KpiGrid({ stats, followers }) {
  if (!stats) {
    return (
      <div className="dash-home__kpis">
        {[...Array(3)].map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  const tiles = Object.entries(stats).filter(([key]) => SHOWN_KEYS.includes(key))
  if (followers) tiles.push(['followers', followers])

  return (
    <div className="dash-home__kpis">
      {tiles
        .map(([key, val], i) => {
          const Icon = STAT_ICONS[key]
          const TrendIcon = val.trend === 'down' ? LuTrendingDown : LuTrendingUp
          return (
            <motion.div
              key={key}
              className="kpi-card"
              variants={fadeUp} initial="hidden" animate="visible" custom={i}
            >
              <div className="kpi-card__top">
                <div className="kpi-card__icon"><Icon size={24} /></div>
                {val.change && (
                  <span className={`kpi-card__change kpi-card__change--${val.trend}`}>
                    <TrendIcon size={12} /> {val.change}
                  </span>
                )}
              </div>
              <div className="kpi-card__body">
                <span className="kpi-card__label">{STAT_LABELS[key]}</span>
                <span className="kpi-card__value">{val.value}</span>
              </div>
            </motion.div>
          )
        })}
    </div>
  )
}
