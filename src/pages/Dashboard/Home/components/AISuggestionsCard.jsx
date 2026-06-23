import { motion } from 'framer-motion'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

export default function AISuggestionsCard({ suggestions, feedback, onAction }) {
  return (
    <motion.div
      className="chart-card"
      variants={fadeUp} initial="hidden" animate="visible" custom={2}
    >
      <div className="chart-card__header">
        <h3>Sugestões da IA para você</h3>
      </div>
      <div className="ai-suggestions">
        {suggestions.map(s => {
          const Icon = s.icon
          return (
            <div key={s.id} className="ai-suggestion">
              <div className="ai-suggestion__icon">{Icon && <Icon size={16} />}</div>
              <div className="ai-suggestion__body">
                <span className="ai-suggestion__label">{s.label}</span>
                <p>{s.text}</p>
              </div>
              <button
                type="button"
                className="ai-suggestion__btn"
                onClick={() => onAction(s)}
              >
                {feedback[`ai-${s.id}`] || s.action}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
