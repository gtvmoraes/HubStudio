import { motion } from 'framer-motion'
import { LuSend, LuTrophy, LuTriangleAlert, LuPlug, LuCalendarClock } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { SkeletonList } from './CardSkeleton'

const TYPE_META = {
  publish:   { icon: LuSend,          color: '#10B981' },
  milestone: { icon: LuTrophy,        color: '#F59E0B' },
  error:     { icon: LuTriangleAlert, color: '#EF4444' },
  connect:   { icon: LuPlug,          color: '#7C5FE8' },
  schedule:  { icon: LuCalendarClock, color: '#6B7280' },
}

// "há 5 min", "há 2h", "ontem", "há 3 dias" — o backend manda só o horário (`at`)
function timeAgo(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000))
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.round(hours / 24)
  if (days === 1) return 'ontem'
  if (days < 7) return `há ${days} dias`
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function ActivityFeed({ items }) {
  return (
    <motion.div
      className="chart-card activity"
      variants={fadeUp} initial="hidden" animate="visible" custom={4}
    >
      <div className="chart-card__header">
        <h3>Atividade recente</h3>
      </div>

      {items === undefined ? (
        <SkeletonList rows={4} />
      ) : !items || items.length === 0 ? (
        <div className="chart-card__empty">Nenhuma atividade recente.</div>
      ) : (
        <ul className="activity__list">
          {items.map(item => {
            const meta = TYPE_META[item.type] ?? TYPE_META.publish
            const Icon = meta.icon
            return (
              <li key={item.id} className="activity__item">
                <span className="activity__icon" style={{ background: `${meta.color}18`, color: meta.color }}>
                  <Icon size={14} />
                </span>
                <div className="activity__body">
                  <p>{item.text}</p>
                  <span className="activity__time">{timeAgo(item.at)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </motion.div>
  )
}
