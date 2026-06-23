import { motion } from 'framer-motion'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

export default function ContentReachCard({ data }) {
  return (
    <motion.div
      className="chart-card"
      variants={fadeUp} initial="hidden" animate="visible" custom={7}
    >
      <h3>Alcance por tipo de conteúdo</h3>

      {(!data || data.length === 0) ? (
        <div className="chart-card__empty">Sem dados de alcance.</div>
      ) : (
        <div className="reach-bars">
          {data.map(({ type, value, color }) => (
            <div key={type} className="reach-bar">
              <div className="reach-bar__meta">
                <span style={{ color }}>{type}</span>
                <span>{value}%</span>
              </div>
              <div className="reach-bar__track">
                <motion.div
                  className="reach-bar__fill"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
