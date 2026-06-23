import { LuArrowRight, LuTrendingUp } from 'react-icons/lu'

// Substitui o heatmap. Foco em destacar O MELHOR horário + alternativas
// próximas + ação direta de agendamento.
const RECOMMENDATIONS = [
  { day: 'Sexta-feira', short: 'Sex', hour: '20h', engagement: 95, top: true  },
  { day: 'Quinta',      short: 'Qui', hour: '19h', engagement: 92, top: false },
  { day: 'Quarta',      short: 'Qua', hour: '21h', engagement: 88, top: false },
  { day: 'Terça',       short: 'Ter', hour: '19h', engagement: 85, top: false },
]

export default function BestTimeCard({ onSchedule }) {
  const top = RECOMMENDATIONS.find(r => r.top) || RECOMMENDATIONS[0]
  const others = RECOMMENDATIONS.filter(r => !r.top).slice(0, 3)

  return (
    <div className="best-time">
      <div className="best-time__header">
        <h3>Melhor horário para postar</h3>
      </div>

      <div className="best-time__featured">
        <div className="best-time__featured-day">
          <span className="best-time__featured-label">Pico de engajamento</span>
          <strong>{top.day}</strong>
          <span className="best-time__featured-hour">{top.hour}</span>
        </div>
        <div className="best-time__featured-stat">
          <LuTrendingUp size={14} />
          +{top.engagement}%
        </div>
      </div>

      <div className="best-time__list">
        <span className="best-time__list-label">Alternativas</span>
        {others.map((r, i) => (
          <div key={r.day} className="best-time__item">
            <span className="best-time__rank">#{i + 2}</span>
            <span className="best-time__when">{r.short} · {r.hour}</span>
            <div className="best-time__bar">
              <div className="best-time__bar-fill" style={{ width: `${r.engagement}%` }} />
            </div>
            <span className="best-time__pct">+{r.engagement}%</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="best-time__cta"
        onClick={() => onSchedule?.({ day: top.short, hour: top.hour })}
      >
        Agendar para {top.short} {top.hour}
        <LuArrowRight size={14} />
      </button>
    </div>
  )
}
