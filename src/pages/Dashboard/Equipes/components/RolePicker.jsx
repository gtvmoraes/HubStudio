import { useState, useEffect, useRef } from 'react'
import { LuChevronDown, LuCheck } from 'react-icons/lu'
import { ROLES, ROLE_ORDER } from '../../../../services/team'

/**
 * Dropdown editável de papel. Mostra o atual e abre uma lista com os 5
 * papéis disponíveis. Cada item tem nome + descrição curta.
 */
export default function RolePicker({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const meta = ROLES[value]

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className={`role-picker${disabled ? ' role-picker--disabled' : ''}`} ref={ref}>
      <button
        type="button"
        className="role-picker__trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        style={{ color: meta?.color, borderColor: meta?.color }}
        disabled={disabled}
      >
        <i className="role-picker__dot" style={{ background: meta?.color }} />
        {meta?.label}
        {!disabled && <LuChevronDown size={13} />}
      </button>

      {open && (
        <div className="role-picker__menu">
          {ROLE_ORDER.map(id => {
            const r = ROLES[id]
            return (
              <button
                key={id}
                type="button"
                className={`role-picker__item${value === id ? ' role-picker__item--active' : ''}`}
                onClick={() => { onChange(id); setOpen(false) }}
              >
                <i className="role-picker__dot" style={{ background: r.color }} />
                <div className="role-picker__item-text">
                  <strong style={{ color: r.color }}>{r.label}</strong>
                  <span>{r.description}</span>
                </div>
                {value === id && <LuCheck size={14} style={{ color: r.color }} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
