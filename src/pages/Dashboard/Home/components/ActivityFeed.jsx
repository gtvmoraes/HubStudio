import { motion } from 'framer-motion'
import { LuSend, LuTrophy, LuMessageCircle, LuPlug, LuCalendarClock } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const TYPE_META = {
  publish:   { icon: LuSend,          color: '#10B981' },
  milestone: { icon: LuTrophy,        color: '#F59E0B' },
  comment:   { icon: LuMessageCircle, color: '#4F35E8' },
  connect:   { icon: LuPlug,          color: '#7C5FE8' },
  schedule:  { icon: LuCalendarClock, color: '#6B7280' },
}

export default function ActivityFeed({ items = [] }) {
  return (
    <motion.div
      className="chart-card activity"
      variants={fadeUp} initial="hidden" animate="visible" custom={4}
    >
      <div className="chart-card__header">
        <h3>Atividade recente</h3>
      </div>

      {items.length === 0 ? (
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
                  <span className="activity__time">{item.time}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </motion.div>
  )
}
