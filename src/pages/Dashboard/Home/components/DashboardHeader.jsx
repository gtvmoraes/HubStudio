import { useEffect, useRef, useState } from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { LuCalendar, LuCheck, LuChevronDown, LuDownload, LuGlobe, LuInfinity, LuPlus } from 'react-icons/lu'
import { useTheme } from '../../../../contexts/ThemeContext'

const PERIOD_OPTIONS = [
  { label: 'Ultimas 24h',    shortLabel: '24h',     value: '24h', icon: LuCalendar, tone: '#4F35E8', desc: 'Hoje em tempo real'  },
  { label: 'Ultimos 7 dias', shortLabel: '7 dias',  value: '7d',  icon: LuCalendar, tone: '#4F35E8', desc: 'Pulso recente'       },
  { label: 'Ultimos 30 dias',shortLabel: '30 dias', value: '30d', icon: LuCalendar, tone: '#4F35E8', desc: 'Tendencia mensal'    },
  { label: 'Geral',          shortLabel: 'Geral',   value: 'all', icon: LuInfinity, tone: '#4F35E8', desc: 'Total acumulado'     },
]

const NETWORK_OPTIONS = [
  { label: 'Todas as redes', shortLabel: 'Todas',     value: 'all',       icon: LuGlobe,      tone: '#4F35E8' },
  { label: 'Instagram',      shortLabel: 'Instagram', value: 'instagram', icon: FaInstagram,  tone: '#E1306C' },
  { label: 'TikTok',         shortLabel: 'TikTok',    value: 'tiktok',    icon: FaTiktok,     tone: '#111827', darkTone: '#F5F5F7', mono: true },
  { label: 'YouTube',        shortLabel: 'YouTube',   value: 'youtube',   icon: FaYoutube,    tone: '#FF0033' },
  { label: 'Facebook',       shortLabel: 'Facebook',  value: 'facebook',  icon: FaFacebook,   tone: '#1877F2' },
  { label: 'LinkedIn',       shortLabel: 'LinkedIn',  value: 'linkedin',  icon: FaLinkedin,   tone: '#0A66C2' },
  { label: 'X (Twitter)',    shortLabel: 'X',         value: 'twitter',   icon: FaXTwitter,   tone: '#0F172A', darkTone: '#F5F5F7', mono: true },
]

function DashboardSelect({ id, label, value, options, onChange, variant, showIcons = true }) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const selected = options.find(option => option.value === value) || options[0]
  const SelectedIcon = selected.icon
  // No escuro, tons quase-pretos (TikTok/X) ficam apagados — usa a versão clara
  const toneFor = (o) => (theme === 'dark' && o.darkTone) ? o.darkTone : o.tone

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const selectOption = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  const handleKeyDown = (event) => {
    const currentIndex = options.findIndex(option => option.value === value)

    if (event.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(open => !open)
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex = (currentIndex + direction + options.length) % options.length
      onChange(options[nextIndex].value)
      setIsOpen(true)
    }
  }

  return (
    <div className={`dash-select dash-select--${variant} ${isOpen ? 'dash-select--open' : ''}`} ref={rootRef}>
      <span className="dash-select__label">{label}</span>
      <button
        type="button"
        className="dash-select__trigger"
        aria-label={`Selecionar ${label.toLowerCase()}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen(open => !open)}
        onKeyDown={handleKeyDown}
      >
        <span className="dash-select__value">
          {SelectedIcon && (
            <span className={`dash-select__icon${selected.mono ? ' dash-select__icon--plain' : ''}`} style={{ '--select-tone': toneFor(selected) }}>
              <SelectedIcon size={16} aria-hidden="true" />
            </span>
          )}
          <span>{selected.shortLabel}</span>
        </span>
        <LuChevronDown className="dash-select__chevron" size={16} aria-hidden="true" />
      </button>

      <div id={id} className="dash-select__menu" role="listbox" aria-label={label} aria-hidden={!isOpen}>
        {options.map(option => {
          const Icon = option.icon
          const isSelected = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              className={`dash-select__option ${isSelected ? 'dash-select__option--selected' : ''}`}
              role="option"
              aria-selected={isSelected}
              tabIndex={isOpen ? 0 : -1}
              style={{ '--select-tone': toneFor(option) }}
              onClick={() => selectOption(option)}
            >
              {showIcons && Icon && (
                <span className={`dash-select__option-icon${option.mono ? ' dash-select__option-icon--plain' : ''}`}>
                  <Icon size={17} aria-hidden="true" />
                </span>
              )}
              <span className="dash-select__option-text">
                <span>{option.label}</span>
                <small>{option.desc || (option.value === 'all' ? 'Visao consolidada' : 'Filtrar metricas')}</small>
              </span>
              {isSelected && <LuCheck className="dash-select__check" size={16} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardHeader({
  greeting, period, network, exportFeedback,
  onPeriodChange, onNetworkChange, onNewPost, onExport,
}) {
  return (
    <div className="dash-home__header">
      <div className="dash-home__heading">
        <h1 className="dash-home__greeting">{greeting}</h1>
        <p className="dash-home__sub">Aqui esta o desempenho das suas redes sociais.</p>
      </div>
      <div className="dash-home__filters">
        <DashboardSelect
          id="dashboard-period-options"
          label="Periodo"
          value={period}
          options={PERIOD_OPTIONS}
          onChange={onPeriodChange}
          variant="period"
          showIcons={false}
        />
        <DashboardSelect
          id="dashboard-network-options"
          label="Rede social"
          value={network}
          options={NETWORK_OPTIONS}
          onChange={onNetworkChange}
          variant="network"
        />
        <button type="button" className="dash-home__action" onClick={onNewPost}>
          <LuPlus size={15} /> Novo post
        </button>
        <button type="button" className="dash-home__export" onClick={onExport}>
          <LuDownload size={15} /> {exportFeedback || 'Exportar relatorio'}
        </button>
      </div>
    </div>
  )
}
