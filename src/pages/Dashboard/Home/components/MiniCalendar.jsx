import { useState } from 'react'
import { LuChevronLeft, LuChevronRight, LuMaximize2 } from 'react-icons/lu'

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

// Status de um dia via lookup no mapa de datas reais (`ano-mês-dia`).
function dayStatus(year, month, day, markers) {
  if (!day) return null
  return markers[`${year}-${month}-${day}`] || null
}

export default function MiniCalendar({ markers = {}, onExpand }) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const firstDay = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  // Sempre 42 células (6 semanas × 7 dias) — calendário fica com altura fixa
  const baseCells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const cells = [...baseCells, ...Array(Math.max(0, 42 - baseCells.length)).fill(null)]

  const isCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth()

  const goPrev = () => setView(v => {
    const m = v.month - 1
    return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m }
  })

  const goNext = () => setView(v => {
    const m = v.month + 1
    return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m }
  })

  return (
    <div className="mini-cal">
      <div className="mini-cal__header">
        <button
          className="mini-cal__nav"
          onClick={goPrev}
          aria-label="Mês anterior"
          type="button"
        >
          <LuChevronLeft size={16} />
        </button>
        <span className="mini-cal__title">{MONTHS[view.month]} {view.year}</span>
        <button
          className="mini-cal__nav"
          onClick={goNext}
          aria-label="Próximo mês"
          type="button"
        >
          <LuChevronRight size={16} />
        </button>
        {onExpand && (
          <button
            className="mini-cal__expand"
            onClick={onExpand}
            aria-label="Expandir calendário"
            type="button"
            title="Expandir"
          >
            <LuMaximize2 size={13} />
          </button>
        )}
      </div>
      <div className="mini-cal__weekdays">
        {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="mini-cal__days">
        {cells.map((day, i) => {
          const status = dayStatus(view.year, view.month, day, markers)
          const isToday = isCurrentMonth && day === today.getDate()
          return (
            <div
              key={i}
              className={`mini-cal__day
                ${isToday ? 'mini-cal__day--today' : ''}
                ${status ? `mini-cal__day--${status}` : ''}
                ${!day ? 'mini-cal__day--empty' : ''}
              `}
            >
              {day}
            </div>
          )
        })}
      </div>
      <div className="mini-cal__legend">
        <span className="mini-cal__legend-item mini-cal__legend-item--scheduled">Agendado</span>
        <span className="mini-cal__legend-item mini-cal__legend-item--published">Publicado</span>
        <span className="mini-cal__legend-item mini-cal__legend-item--draft">Rascunho</span>
      </div>
    </div>
  )
}
