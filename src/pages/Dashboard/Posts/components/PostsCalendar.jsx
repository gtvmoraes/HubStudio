import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight } from 'react-icons/lu'
import { STATUS_META } from '../../../../services/posts'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const WEEKDAYS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

/**
 * View de calendário full-screen na página de Posts.
 * Mostra posts (agendados, publicados, rascunhos com data, etc.) nas células
 * dos seus dias. Clicar num chip leva pra edição. Clicar num dia abre o composer
 * pré-selecionando aquele dia.
 */
export default function PostsCalendar({ posts, onReview }) {
  const navigate = useNavigate()
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [showYearPicker, setShowYearPicker] = useState(false)
  const yearWrapRef = useRef(null)

  // Fecha o year picker ao clicar fora
  useEffect(() => {
    if (!showYearPicker) return
    const h = (e) => {
      if (yearWrapRef.current && !yearWrapRef.current.contains(e.target)) {
        setShowYearPicker(false)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [showYearPicker])

  // Agrupa posts pelo dia (chave: YYYY-MM-DD)
  const postsByDay = useMemo(() => {
    const map = {}
    posts.forEach(p => {
      const dateStr = p.scheduledFor || p.publishedAt
      if (!dateStr) return
      const d = new Date(dateStr)
      if (d.getFullYear() !== view.year || d.getMonth() !== view.month) return
      const key = d.getDate()
      if (!map[key]) map[key] = []
      map[key].push(p)
    })
    return map
  }, [posts, view])

  const cells = useMemo(() => {
    const firstDay = new Date(view.year, view.month, 1).getDay()
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
    const base = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    return [...base, ...Array(Math.max(0, 42 - base.length)).fill(null)]
  }, [view])

  const isToday = (day) =>
    day &&
    view.year === today.getFullYear() &&
    view.month === today.getMonth() &&
    day === today.getDate()

  const goPrev = () => setView(v => {
    const m = v.month - 1
    return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m }
  })
  const goNext = () => setView(v => {
    const m = v.month + 1
    return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m }
  })
  const goPrevYear = () => setView(v => ({ ...v, year: v.year - 1 }))
  const goNextYear = () => setView(v => ({ ...v, year: v.year + 1 }))
  const goToday = () => setView({ year: today.getFullYear(), month: today.getMonth() })
  const setYear = (y) => { setView(v => ({ ...v, year: y })); setShowYearPicker(false) }

  const handlePostClick = (post, e) => {
    e.stopPropagation()
    if (post.status === 'pending' && onReview) onReview(post)
    else navigate(`/dashboard/posts/${post.id}/editar`)
  }

  const handleDayClick = (day) => {
    if (!day) return
    // Abre composer pré-agendado nesse dia às 12h (formato YYYY-MM-DDTHH:MM)
    const dStr = `${view.year}-${String(view.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00`
    navigate(`/dashboard/posts/novo?date=${dStr}`)
  }

  return (
    <div className="cal-view">
      {/* Header */}
      <div className="cal-view__head">
        <div className="cal-view__nav">
          <button type="button" onClick={goPrevYear} aria-label="Ano anterior" title="Ano anterior">
            <LuChevronsLeft size={18} />
          </button>
          <button type="button" onClick={goPrev} aria-label="Mês anterior" title="Mês anterior">
            <LuChevronLeft size={18} />
          </button>

          <div className="cal-view__title-wrap" ref={yearWrapRef}>
            <button
              type="button"
              className="cal-view__title-btn"
              onClick={() => setShowYearPicker(s => !s)}
              title="Trocar ano"
            >
              <h2>{MONTHS[view.month]} <span className="cal-view__year">{view.year}</span></h2>
            </button>
            {showYearPicker && (
              <div className="cal-view__years">
                <div className="cal-view__years-nav">
                  <button type="button" onClick={() => setView(v => ({ ...v, year: v.year - 12 }))}>
                    <LuChevronLeft size={14} />
                  </button>
                  <span>{view.year - 6} – {view.year + 5}</span>
                  <button type="button" onClick={() => setView(v => ({ ...v, year: v.year + 12 }))}>
                    <LuChevronRight size={14} />
                  </button>
                </div>
                <div className="cal-view__years-grid">
                  {Array.from({ length: 12 }, (_, i) => view.year - 6 + i).map(y => (
                    <button
                      key={y}
                      type="button"
                      className={`cal-view__year-btn${y === view.year ? ' cal-view__year-btn--active' : ''}`}
                      onClick={() => setYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={goNext} aria-label="Próximo mês" title="Próximo mês">
            <LuChevronRight size={18} />
          </button>
          <button type="button" onClick={goNextYear} aria-label="Próximo ano" title="Próximo ano">
            <LuChevronsRight size={18} />
          </button>
        </div>
        <button type="button" className="cal-view__today" onClick={goToday}>
          Hoje
        </button>
      </div>

      {/* Weekdays */}
      <div className="cal-view__weekdays">
        {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
      </div>

      {/* Grid */}
      <div className="cal-view__grid">
        {cells.map((day, i) => {
          const dayPosts = day ? (postsByDay[day] || []) : []
          return (
            <div
              key={i}
              className={`cal-view__cell
                ${isToday(day) ? 'cal-view__cell--today' : ''}
                ${!day ? 'cal-view__cell--empty' : ''}
              `}
              onClick={() => handleDayClick(day)}
            >
              {day && (
                <>
                  <div className="cal-view__day-head">
                    <span className="cal-view__day-num">{day}</span>
                    {dayPosts.length > 0 && (
                      <span className="cal-view__day-count">{dayPosts.length}</span>
                    )}
                  </div>
                  <div className="cal-view__day-posts">
                    {dayPosts.slice(0, 3).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className={`cal-view__chip cal-view__chip--${p.status}`}
                        onClick={(e) => handlePostClick(p, e)}
                        title={p.title}
                      >
                        <i className="cal-view__chip-dot" style={{ background: STATUS_META[p.status]?.color }} />
                        <span>{p.title}</span>
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <span className="cal-view__more">+{dayPosts.length - 3} mais</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
