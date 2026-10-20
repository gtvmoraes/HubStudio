import { motion } from 'framer-motion'
import { LuEye, LuHeart, LuMessageCircle, LuTrendingUp, LuTrendingDown, LuUsers } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import AnimatedNumber from '../../../../components/AnimatedNumber/AnimatedNumber'

const STAT_ICONS = {
  followers: LuUsers, views: LuEye, likes: LuHeart, comments: LuMessageCircle,
}
const STAT_LABELS = {
  followers: 'Seguidores',
  views: 'Visualizações',
  likes: 'Curtidas',
  comments: 'Comentários',
}

// Views/likes/comments vêm das métricas reais coletadas por post (TikTok/
// YouTube/Instagram/Facebook/LinkedIn). Seguidores é o card principal e vem de
// getAudienceTotal (soma Instagram+TikTok+YouTube), carregado à parte.
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

function KpiCard({ statKey, val, index, primary }) {
  const Icon = STAT_ICONS[statKey]
  const TrendIcon = val?.trend === 'down' ? LuTrendingDown : LuTrendingUp
  return (
    <motion.div
      className={`kpi-card${primary ? ' kpi-card--primary' : ''}`}
      variants={fadeUp} initial="hidden" animate="visible" custom={index}
    >
      <div className="kpi-card__top">
        <div className="kpi-card__icon"><Icon size={24} /></div>
        {val?.change && (
          <span className={`kpi-card__change kpi-card__change--${val.trend}`}>
            <TrendIcon size={12} /> {val.change}
          </span>
        )}
      </div>
      <div className="kpi-card__body">
        <span className="kpi-card__label">{STAT_LABELS[statKey]}</span>
        <span className="kpi-card__value">{val ? <AnimatedNumber value={val.value} /> : '—'}</span>
      </div>
    </motion.div>
  )
}

// `stats` e `followers`: undefined = ainda carregando · null = carregou e não há
// dado (não fica em skeleton pra sempre quando a API falha ou a conta não tem métrica)
export default function KpiGrid({ stats, followers }) {
  return (
    <div className="dash-home__kpis">
      {followers === undefined
        ? <Skeleton />
        : <KpiCard statKey="followers" val={followers} index={0} primary />}
      {SHOWN_KEYS.map((key, i) => stats === undefined
        ? <Skeleton key={key} />
        : <KpiCard key={key} statKey={key} val={stats?.[key]} index={i + 1} />)}
    </div>
  )
}
