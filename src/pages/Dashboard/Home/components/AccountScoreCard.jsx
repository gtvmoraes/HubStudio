import { motion } from 'framer-motion'
import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const SCORE = 87

const ITEMS = [
  { label: 'Frequência de posts', status: 'good' },
  { label: 'Crescimento',         status: 'good' },
  { label: 'Engajamento',         status: 'good' },
  { label: 'Stories',             status: 'warn' },
  { label: 'Taxa de resposta',    status: 'warn' },
]

const getMessage = (score) => {
  if (score >= 80) return 'Continue assim! Você está indo muito bem.'
  if (score >= 60) return 'Bom progresso! Ainda há espaço para crescer.'
  return 'Atenção: algumas áreas precisam de melhoria.'
}

const CIRCUMFERENCE = 2 * Math.PI * 42
const progress = (SCORE / 100) * CIRCUMFERENCE

export default function AccountScoreCard() {
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
          <strong className="account-score__value">{SCORE}</strong>
          <span className="account-score__max">/100</span>
        </div>
      </div>

      <ul className="account-score__list">
        {ITEMS.map(({ label, status }) => (
          <li key={label} className={`account-score__item account-score__item--${status}`}>
            {status === 'good'
              ? <LuCircleCheck size={15} aria-hidden="true" />
              : <LuTriangleAlert size={15} aria-hidden="true" />
            }
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <p className="account-score__msg">{getMessage(SCORE)}</p>
    </motion.div>
  )
}
