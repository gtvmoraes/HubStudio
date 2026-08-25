import { motion } from 'framer-motion'
import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const CIRCUMFERENCE = 2 * Math.PI * 42

// `data` vem de getAccountScore() (services/analytics.js) — real quando há
// pelo menos uma conta social conectada, mock caso contrário.
export default function AccountScoreCard({ data }) {
  if (!data) {
    return (
      <motion.div
        className="chart-card account-score"
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
      >
        <h3>Score da conta</h3>
        <div className="chart-card__empty">
          Conecte uma rede social pra calcular o score da sua conta.
        </div>
      </motion.div>
    )
  }

  const { score, items, message } = data
  const progress = (score / 100) * CIRCUMFERENCE

  return (
    <motion.div
      className="chart-card account-score"
      variants={fadeUp} initial="hidden" animate="visible" custom={1}
    >
      <h3>Score da conta</h3>

      <div className="account-score__gauge-wrap">
        <svg viewBox="0 0 100 100" className="account-score__svg" aria-hidden="true">
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="var(--color-bg-tertiary)"
            strokeWidth="9"
          />
          <motion.circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke="#4F35E8"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE - progress }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="account-score__center">
          <strong className="account-score__value">{score}</strong>
          <span className="account-score__max">/100</span>
        </div>
      </div>

      <ul className="account-score__list">
        {items.map(({ label, status }) => (
          <li key={label} className={`account-score__item account-score__item--${status}`}>
            {status === 'good'
              ? <LuCircleCheck size={15} aria-hidden="true" />
              : <LuTriangleAlert size={15} aria-hidden="true" />
            }
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <p className="account-score__msg">{message}</p>
    </motion.div>
  )
}
