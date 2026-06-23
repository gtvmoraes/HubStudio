import { motion } from 'framer-motion'
import { LuSparkles, LuArrowRight, LuTrendingUp, LuTrendingDown, LuLightbulb } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const TYPE_META = {
  positive: { Icon: LuTrendingUp,   color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  negative: { Icon: LuTrendingDown, color: '#EF4444', bg: 'rgba(239,68,68,0.10)'  },
  tip:      { Icon: LuLightbulb,    color: '#4F35E8', bg: 'rgba(79,53,232,0.10)'  },
}

export default function AIInsightsBar({ insights = [], onViewAll }) {
  if (!insights.length) return null

  return (
    <motion.div
      className="ai-insights-bar"
      variants={fadeUp} initial="hidden" animate="visible" custom={1}
    >
      <div className="ai-insights-bar__header">
        <span className="ai-insights-bar__title">
          <LuSparkles size={15} aria-hidden="true" />
          Insights da IA
        </span>
        <button
          type="button"
          className="ai-insights-bar__link"
          onClick={onViewAll}
        >
          Ver todos os insights <LuArrowRight size={13} />
        </button>
      </div>

      <div className="ai-insights-bar__items">
        {insights.map((insight, i) => {
          const { Icon, color, bg } = TYPE_META[insight.type] ?? TYPE_META.tip
          return (
            <div key={insight.id} className="ai-insight-pill">
              <span className="ai-insight-pill__icon" style={{ background: bg, color }}>
                <Icon size={14} aria-hidden="true" />
              </span>
              <p>
                <strong style={{ color }}>{insight.highlight}</strong>
                {' '}{insight.text}
              </p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
