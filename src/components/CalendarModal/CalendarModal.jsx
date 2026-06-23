import { useState, useMemo } from 'react'
import Modal from '../Modal/Modal'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import './CalendarModal.css'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const WEEKDAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

const STATUS_LABEL = {
  scheduled: 'Agendado',
  published: 'Publicado',
  draft:     'Rascunho',
}

function statusOf(year, month, day, markers) {
  if (!day) return null
  return markers[`${year}-${month}-${day}`] || null
}

export default function CalendarModal({ isOpen, onClose, markers = {} }) {
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const cells = useMemo(() => {
    const firstDay = new Date(view.year, view.month, 1).getDay()
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const base = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
    return [...base, ...Array(Math.max(0, 42 - base.length)).fill(null)]
  }, [view])

  const isCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth()

  const goPrev = () => setView(v => {
    const m = v.month - 1
    return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m }
  })
  const goNext = () => setView(v => {
    const m = v.month + 1
    return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m }
  })
  const goToday = () => setView({ year: today.getFullYear(), month: today.getMonth() })

  // Estatísticas do mês exibido (conta os markers daquele ano/mês)
  const totals = useMemo(() => {
    const t = { scheduled: 0, published: 0, draft: 0 }
    Object.entries(markers).forEach(([key, status]) => {
      const [yy, mm] = key.split('-').map(Number)
      if (yy === view.year && mm === view.month && t[status] != null) t[status]++
    })
    return t
  }, [markers, view])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Calendário de publicações" size="xl">
      <div className="cal-modal">
        <div className="cal-modal__header">
          <div className="cal-modal__nav">
            <button type="button" onClick={goPrev} aria-label="Mês anterior">
              <LuChevronLeft size={18} />
            </button>
            <h3>{MONTHS[view.month]} {view.year}</h3>
            <button type="button" onClick={goNext} aria-label="Próximo mês">
              <LuChevronRight size={18} />
            </button>
          </div>
          <button type="button" className="cal-modal__today" onClick={goToday}>Hoje</button>
        </div>

        <div className="cal-modal__legend">
          <span className="cal-modal__legend-item cal-modal__legend-item--scheduled">
            Agendados <strong>{totals.scheduled}</strong>
          </span>
          <span className="cal-modal__legend-item cal-modal__legend-item--published">
            Publicados <strong>{totals.published}</strong>
          </span>
          <span className="cal-modal__legend-item cal-modal__legend-item--draft">
            Rascunhos <strong>{totals.draft}</strong>
          </span>
        </div>

        <div className="cal-modal__weekdays">
          {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
        </div>

        <div className="cal-modal__grid">
          {cells.map((day, i) => {
            const status = statusOf(view.year, view.month, day, markers)
            const isToday = isCurrentMonth && day === today.getDate()
            return (
              <div
                key={i}
                className={`cal-modal__cell
                  ${isToday ? 'cal-modal__cell--today' : ''}
                  ${status ? `cal-modal__cell--${status}` : ''}
                  ${!day ? 'cal-modal__cell--empty' : ''}
                `}
              >
                <span className="cal-modal__day-num">{day}</span>
                {status && (
                  <span className={`cal-modal__chip cal-modal__chip--${status}`}>
                    {STATUS_LABEL[status]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
