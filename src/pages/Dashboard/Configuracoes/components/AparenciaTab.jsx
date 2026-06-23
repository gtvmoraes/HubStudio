import { useState } from 'react'
import { LuSun, LuMoon, LuMonitor, LuCheck } from 'react-icons/lu'
import { useTheme } from '../../../../contexts/ThemeContext'

const THEMES = [
  { id: 'light', label: 'Claro',   icon: LuSun },
  { id: 'dark',  label: 'Escuro',  icon: LuMoon },
  { id: 'system', label: 'Sistema', icon: LuMonitor },
]

const LANGUAGES = ['Português (Brasil)', 'English (US)', 'Español']
const DATE_FORMATS = ['DD/MM/AAAA', 'MM/DD/AAAA', 'AAAA-MM-DD']

export default function AparenciaTab() {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [dateFormat, setDateFormat] = useState(DATE_FORMATS[0])

  const selectTheme = (id) => {
    if (id === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    } else {
      setTheme(id)
    }
  }

  return (
    <div className="set-section">
      <div className="set-section__head">
        <h2>Aparência</h2>
        <p>Personalize o tema, o idioma e como as datas são exibidas.</p>
      </div>

      <div className="set-card">
        <div className="set-card__title">Tema</div>
        <div className="set-theme-grid">
          {THEMES.map(({ id, label, icon: Icon }) => {
            const active = id === 'system' ? false : theme === id
            return (
              <button
                key={id}
                type="button"
                className={`set-theme-opt ${active ? 'set-theme-opt--active' : ''}`}
                onClick={() => selectTheme(id)}
              >
                <span className={`set-theme-preview set-theme-preview--${id}`} aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="set-theme-opt__label">
                  {label}
                  {active && <LuCheck size={14} />}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="set-card">
        <div className="set-form-grid">
          <div className="set-field">
            <label htmlFor="ap-lang">Idioma</label>
            <select id="ap-lang" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="set-field">
            <label htmlFor="ap-date">Formato de data</label>
            <select id="ap-date" value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
              {DATE_FORMATS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
