import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuMapPin } from 'react-icons/lu'
import { SkeletonLines } from './CardSkeleton'

const PLACE_TYPES = [
  { label: 'Cidades', value: 'cities' },
  { label: 'Países',  value: 'countries' },
]

export default function AudienceCard({ data }) {
  const [placeType, setPlaceType] = useState('cities')

  if (data === undefined) {
    return (
      <div className="audience">
        <div className="chart-card__header">
          <h3>Seu público</h3>
        </div>
        <SkeletonLines rows={5} height={16} />
      </div>
    )
  }

  if (!data || !Array.isArray(data.ageGroups)) {
    return (
      <div className="audience">
        <div className="chart-card__header">
          <h3>Seu público</h3>
        </div>
        <div className="chart-card__empty">Sem dados de audiência.</div>
      </div>
    )
  }

  // Faixas na ordem natural (13–17 → 65+), como no painel profissional
  const ageSorted = data.ageGroups
  const maxAge = Math.max(...ageSorted.map(g => g.value), 1)
  const countries = data.topCountries ?? []
  const places = placeType === 'countries'
    ? countries.map(c => ({ name: c.country, value: c.value }))
    : (data.topLocations ?? []).map(l => ({ name: l.city, value: l.value }))

  return (
    <div className="audience">
      <div className="chart-card__header">
        <h3>Seu público</h3>
        <span className="audience__hint">Seguidores do Instagram</span>
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
          <div className="audience__places-head">
            <span className="audience__label"><LuMapPin size={11} /> Principais locais</span>
            {countries.length > 0 && (
              <div className="chart-card__period">
                {PLACE_TYPES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    className={`chart-card__period-btn ${placeType === p.value ? 'chart-card__period-btn--active' : ''}`}
                    onClick={() => setPlaceType(p.value)}
                    aria-pressed={placeType === p.value}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ul className="audience__locations">
            {places.slice(0, 5).map(place => (
              <li key={place.name} className="audience__location">
                <span>{place.name}</span>
                <strong>{place.value}%</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
