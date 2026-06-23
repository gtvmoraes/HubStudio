import { useState, useEffect, useRef, useMemo } from 'react'
import {
  LuCalendarClock, LuChevronLeft, LuChevronRight,
  LuClock, LuX, LuSparkles,
} from 'react-icons/lu'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const WEEKDAYS = ['D','S','T','Q','Q','S','S']

const TIME_PRESETS = [
  { label: '09:00', h: 9,  m: 0  },
  { label: '12:00', h: 12, m: 0  },
  { label: '18:00', h: 18, m: 0  },
  { label: '20:00', h: 20, m: 0  },
]

const pad = (n) => String(n).padStart(2, '0')

// Converte "YYYY-MM-DDTHH:MM" → Date local (sem timezone shift)
function parseLocal(value) {
  if (!value) return null
  const [date, time] = value.split('T')
  const [y, mo, d] = date.split('-').map(Number)
  const [h, mi] = (time || '12:00').split(':').map(Number)
  return new Date(y, mo - 1, d, h, mi)
}

// Date → "YYYY-MM-DDTHH:MM" preservando hora local
function toLocalString(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatDisplay(d) {
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function DateTimePicker({
  value, onChange, placeholder = 'Selecionar data e hora',
  openUpward = false,   // se true, popover abre pra cima (útil quando o picker está no fim da página)
  getBestTimes,         // (dateObj, now) => [{ label, h, m, reason }] — sugestões de IA (opcional)
}) {
  const wrapRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [showYears, setShowYears] = useState(false)
  const selected = useMemo(() => parseLocal(value), [value])

  // View do calendário (mês/ano que estão sendo mostrados)
  const today = new Date()
  const [view, setView] = useState({
    year:  selected?.getFullYear() ?? today.getFullYear(),
    month: selected?.getMonth() ?? today.getMonth(),
  })

  // Tempo selecionado (separado pra não dispar onChange a cada digitada)
  const [hour, setHour] = useState(selected?.getHours() ?? 12)
  const [minute, setMinute] = useState(selected?.getMinutes() ?? 0)

  // Sync interno quando o value muda de fora
  useEffect(() => {
    if (selected) {
      setView({ year: selected.getFullYear(), month: selected.getMonth() })
      setHour(selected.getHours())
      setMinute(selected.getMinutes())
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Grid do calendário (sempre 42 células — 6 semanas)
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

  const isSelected = (day) =>
    day && selected &&
    view.year === selected.getFullYear() &&
    view.month === selected.getMonth() &&
    day === selected.getDate()

  const goPrev = () => setView(v => {
    const m = v.month - 1
    return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m }
  })
  const goNext = () => setView(v => {
    const m = v.month + 1
    return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m }
  })
  const goToday = () => setView({ year: today.getFullYear(), month: today.getMonth() })

  // Aplica a seleção (chamada quando o usuário escolhe um dia ou usa preset)
  const applyDate = (day, h = hour, m = minute) => {
    const d = new Date(view.year, view.month, day, h, m)
    onChange(toLocalString(d))
  }

  const handleTimeChange = (h, m) => {
    setHour(h); setMinute(m)
    if (selected) {
      const d = new Date(selected)
      d.setHours(h); d.setMinutes(m)
      onChange(toLocalString(d))
    }
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange('')
  }

  // IA — melhores horários pra data escolhida (ou hoje, se nada selecionado)
  const aiBase = selected || today
  const aiSameDay =
    aiBase.getFullYear() === today.getFullYear() &&
    aiBase.getMonth() === today.getMonth() &&
    aiBase.getDate() === today.getDate()
  const aiSlots = getBestTimes ? getBestTimes(aiBase, today) : []

  const applyAiSlot = (h, m) => {
    setHour(h); setMinute(m)
    const d = new Date(aiBase.getFullYear(), aiBase.getMonth(), aiBase.getDate(), h, m)
    onChange(toLocalString(d))
  }

  return (
    <div className="dtpicker" ref={wrapRef}>
      <button
        type="button"
        className={`dtpicker__trigger${selected ? ' dtpicker__trigger--filled' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <LuCalendarClock size={16} />
        <span>{selected ? formatDisplay(selected) : placeholder}</span>
        {selected && (
          <span
            role="button"
            tabIndex={0}
            className="dtpicker__clear"
            onClick={clear}
            onKeyDown={(e) => { if (e.key === 'Enter') clear(e) }}
            aria-label="Limpar data"
          >
            <LuX size={14} />
          </span>
        )}
      </button>

      {open && (
        <div className={`dtpicker__popover${openUpward ? ' dtpicker__popover--up' : ''}`}>
          {/* Cabeçalho com navegação de mês */}
          <div className="dtpicker__head">
            <button type="button" onClick={goPrev} aria-label="Mês anterior">
              <LuChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="dtpicker__head-title"
              onClick={() => setShowYears(s => !s)}
            >
              {MONTHS[view.month]} <span className="dtpicker__head-year">{view.year} ▾</span>
            </button>
            <button type="button" onClick={goNext} aria-label="Próximo mês">
              <LuChevronRight size={16} />
            </button>
          </div>

          {/* Year picker (overlay sobre o calendário) */}
          {showYears && (
            <div className="dtpicker__years">
              <div className="dtpicker__years-nav">
                <button
                  type="button"
                  onClick={() => setView(v => ({ ...v, year: v.year - 12 }))}
                  aria-label="12 anos antes"
                >
                  <LuChevronLeft size={14} />
                </button>
                <span>
                  {view.year - 6} – {view.year + 5}
                </span>
                <button
                  type="button"
                  onClick={() => setView(v => ({ ...v, year: v.year + 12 }))}
                  aria-label="12 anos depois"
                >
                  <LuChevronRight size={14} />
                </button>
              </div>
              <div className="dtpicker__years-grid">
                {Array.from({ length: 12 }, (_, i) => view.year - 6 + i).map(y => (
                  <button
                    key={y}
                    type="button"
                    className={`dtpicker__year${y === view.year ? ' dtpicker__year--active' : ''}`}
                    onClick={() => { setView(v => ({ ...v, year: y })); setShowYears(false) }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Weekdays */}
          {!showYears && (
            <>
              <div className="dtpicker__weekdays">
                {WEEKDAYS.map((d, i) => <span key={i}>{d}</span>)}
              </div>

              {/* Grid */}
              <div className="dtpicker__grid">
                {cells.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={!day}
                    className={`dtpicker__day
                      ${isToday(day) ? 'dtpicker__day--today' : ''}
                      ${isSelected(day) ? 'dtpicker__day--selected' : ''}
                      ${!day ? 'dtpicker__day--empty' : ''}
                    `}
                    onClick={() => day && applyDate(day)}
                  >
                    {day || ''}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Time picker */}
          <div className="dtpicker__time">
            <span className="dtpicker__time-label">
              <LuClock size={14} /> Horário
            </span>
            <div className="dtpicker__time-inputs">
              <input
                type="number"
                min="0" max="23"
                value={pad(hour)}
                onChange={e => {
                  const h = Math.max(0, Math.min(23, parseInt(e.target.value || 0, 10)))
                  handleTimeChange(h, minute)
                }}
              />
              <span>:</span>
              <input
                type="number"
                min="0" max="59"
                value={pad(minute)}
                onChange={e => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value || 0, 10)))
                  handleTimeChange(hour, m)
                }}
              />
            </div>

            {/* Atalhos rápidos */}
            <div className="dtpicker__presets">
              {TIME_PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className={`dtpicker__preset${hour === p.h && minute === p.m ? ' dtpicker__preset--active' : ''}`}
                  onClick={() => handleTimeChange(p.h, p.m)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* IA — melhores horários pra data escolhida */}
            {getBestTimes && aiSlots.length > 0 && (
              <div className="dtpicker__ai">
                <span className="dtpicker__ai-label">
                  <LuSparkles size={13} />
                  Melhores horários {aiSameDay ? 'pra hoje' : 'pra este dia'}
                </span>
                <div className="dtpicker__ai-slots">
                  {aiSlots.map(s => {
                    const active = hour === s.h && minute === s.m
                    return (
                      <button
                        key={s.label}
                        type="button"
                        className={`dtpicker__ai-slot${active ? ' dtpicker__ai-slot--active' : ''}`}
                        onClick={() => applyAiSlot(s.h, s.m)}
                      >
                        <strong>{s.label}</strong>
                        <em>{s.reason}</em>
                      </button>
                    )
                  })}
                </div>
                {aiSameDay && (
                  <span className="dtpicker__ai-note">
                    Mostrando só horários que ainda não passaram hoje.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="dtpicker__footer">
            <button type="button" className="dtpicker__today-btn" onClick={goToday}>
              Hoje
            </button>
            <button
              type="button"
              className="dtpicker__confirm"
              onClick={() => setOpen(false)}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
