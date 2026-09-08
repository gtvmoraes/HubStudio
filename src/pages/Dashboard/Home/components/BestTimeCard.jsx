import { LuArrowRight, LuTrendingUp } from 'react-icons/lu'
import { SkeletonLines } from './CardSkeleton'

const WEEKDAYS = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 }
const pad = (n) => String(n).padStart(2, '0')

// "Sex" + "18h–21h" → próxima sexta às 18:00 no formato que o compositor lê
// ("YYYY-MM-DDTHH:MM"). Sem isso o botão só abria o compositor em branco.
function nextDateFor(short, hour) {
  const key = (short || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const target = WEEKDAYS[key]
  const startHour = parseInt(String(hour).match(/\d{1,2}/)?.[0] ?? '', 10)
  if (target === undefined || Number.isNaN(startHour)) return ''

  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, 0)
  let delta = (target - d.getDay() + 7) % 7
  if (delta === 0 && d <= now) delta = 7   // hoje já passou → semana que vem
  d.setDate(d.getDate() + delta)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`
}

// Substitui o heatmap. Foco em destacar O MELHOR horário + alternativas
// próximas + ação direta de agendamento. `data` vem de getBestTimes()
// (services/analytics.js) — sempre real; vazio quando ainda não há posts
// com métrica coletada suficiente.
export default function BestTimeCard({ data, onSchedule }) {
  if (data === undefined) {
    return (
      <div className="best-time">
        <div className="best-time__header">
          <h3>Melhor horário para postar</h3>
        </div>
        <SkeletonLines rows={4} height={18} />
      </div>
    )
  }

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
        onClick={() => onSchedule?.({ day: top.short, hour: top.hour, date: nextDateFor(top.short, top.hour) })}
      >
        Agendar para {top.short} {top.hour}
        <LuArrowRight size={14} />
      </button>
    </div>
  )
}
