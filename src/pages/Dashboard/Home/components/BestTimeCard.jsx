import { LuArrowRight, LuTrendingUp } from 'react-icons/lu'

// Substitui o heatmap. Foco em destacar O MELHOR horário + alternativas
// próximas + ação direta de agendamento. `data` vem de getBestTimes()
// (services/analytics.js) — real quando há posts com métrica coletada,
// mock caso contrário.
export default function BestTimeCard({ data, onSchedule }) {
  const recommendations = data && data.length > 0 ? data : []
  if (recommendations.length === 0) {
    return (
      <div className="best-time">
        <div className="best-time__header">
          <h3>Melhor horário para postar</h3>
        </div>
        <div className="chart-card__empty">
          Publique alguns posts e colete métricas pra ver seu melhor horário aqui.
        </div>
      </div>
    )
  }

  const top = recommendations.find(r => r.top) || recommendations[0]
  const others = recommendations.filter(r => r !== top).slice(0, 3)

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

      {others.length > 0 && (
        <div className="best-time__list">
          <span className="best-time__list-label">Alternativas</span>
          {others.map((r, i) => (
            <div key={`${r.day}-${r.hour}`} className="best-time__item">
              <span className="best-time__rank">#{i + 2}</span>
              <span className="best-time__when">{r.short} · {r.hour}</span>
              <div className="best-time__bar">
                <div className="best-time__bar-fill" style={{ width: `${r.engagement}%` }} />
              </div>
              <span className="best-time__pct">+{r.engagement}%</span>
            </div>
          ))}
        </div>
      )}

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
