import { motion } from 'framer-motion'
import { LuMapPin } from 'react-icons/lu'

export default function AudienceCard({ data }) {
  if (!data) {
    return (
      <div className="audience">
        <div className="chart-card__header">
          <h3>Seu público</h3>
        </div>
        <div className="chart-card__empty">Sem dados de audiência.</div>
      </div>
    )
  }

  const ageSorted = [...data.ageGroups].sort((a, b) => b.value - a.value)
  const maxAge = ageSorted[0]?.value || 100

  return (
    <div className="audience">
      <div className="chart-card__header">
        <h3>Seu público</h3>
        <span className="audience__hint">Distribuição dos seguidores</span>
      </div>

      <div className="audience__section">
        <span className="audience__label">Faixa etária</span>
        <div className="audience__bars">
          {ageSorted.map((g, i) => (
            <div key={g.range} className="audience__bar-row">
              <span className="audience__bar-range">{g.range}</span>
              <div className="audience__bar-track">
                <motion.div
                  className="audience__bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(g.value / maxAge) * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.05 * i }}
                />
              </div>
              <span className="audience__bar-pct">{g.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="audience__split">
        <div className="audience__sub">
          <span className="audience__label">Gênero</span>
          <div className="audience__gender">
            <div className="audience__gender-bar" aria-hidden="true">
              <span style={{ width: `${data.gender.female}%`, background: '#E84FA5' }} />
              <span style={{ width: `${data.gender.male}%`,   background: '#4F35E8' }} />
            </div>
            <div className="audience__gender-stats">
              <span><i className="audience__dot" style={{ background: '#E84FA5' }} /> Feminino {data.gender.female}%</span>
              <span><i className="audience__dot" style={{ background: '#4F35E8' }} /> Masculino {data.gender.male}%</span>
            </div>
          </div>
        </div>

        <div className="audience__sub">
          <span className="audience__label"><LuMapPin size={11} /> Top localizações</span>
          <ul className="audience__locations">
            {data.topLocations.slice(0, 3).map(loc => (
              <li key={loc.city} className="audience__location">
                <span>{loc.city}</span>
                <strong>{loc.value}%</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
