import { useState, useEffect, useRef } from 'react'
import { LuListFilter, LuX, LuCalendar, LuLayoutGrid, LuList } from 'react-icons/lu'
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const NETWORKS = [
  { id: 'instagram', label: 'Instagram',   Icon: FaInstagram },
  { id: 'tiktok',    label: 'TikTok',      Icon: FaTiktok    },
  { id: 'youtube',   label: 'YouTube',     Icon: FaYoutube   },
  { id: 'facebook',  label: 'Facebook',    Icon: FaFacebook  },
  { id: 'linkedin',  label: 'LinkedIn',    Icon: FaLinkedin  },
  { id: 'twitter',   label: 'X (Twitter)', Icon: FaXTwitter  },
]

const PERIODS = [
  { id: 'all',     label: 'Tudo' },
  { id: 'today',   label: 'Hoje' },
  { id: 'week',    label: 'Esta semana' },
  { id: 'month',   label: 'Este mês' },
  { id: 'past',    label: 'Anteriores' },
]

export default function PostsFilters({
  selectedNetworks, onNetworksChange,
  period, onPeriodChange,
  view, onViewChange,
}) {
  const { theme } = useTheme()
  const [netOpen, setNetOpen] = useState(false)
  const [perOpen, setPerOpen] = useState(false)
  const netRef = useRef(null)
  const perRef = useRef(null)

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (netRef.current && !netRef.current.contains(e.target)) setNetOpen(false)
      if (perRef.current && !perRef.current.contains(e.target)) setPerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleNetwork = (id) => {
    if (selectedNetworks.includes(id)) {
      onNetworksChange(selectedNetworks.filter(n => n !== id))
    } else {
      onNetworksChange([...selectedNetworks, id])
    }
  }

  const periodLabel = PERIODS.find(p => p.id === period)?.label || 'Tudo'

  return (
    <div className="posts-filters">
      {/* Filtro: redes */}
      <div className="posts-filters__chip" ref={netRef}>
        <button
          type="button"
          className={`posts-filters__btn${selectedNetworks.length > 0 ? ' posts-filters__btn--active' : ''}`}
          onClick={() => setNetOpen(o => !o)}
        >
          <LuListFilter size={14} />
          Redes
          {selectedNetworks.length > 0 && (
            <span className="posts-filters__count">{selectedNetworks.length}</span>
          )}
        </button>
        {netOpen && (
          <div className="posts-filters__pop">
            <div className="posts-filters__pop-head">
              <strong>Filtrar por rede</strong>
              {selectedNetworks.length > 0 && (
                <button type="button" onClick={() => onNetworksChange([])}>
                  Limpar
                </button>
              )}
            </div>
            <div className="posts-filters__pop-list">
              {NETWORKS.map(n => {
                const Icon = n.Icon
                const checked = selectedNetworks.includes(n.id)
                return (
                  <label key={n.id} className="posts-filters__option">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleNetwork(n.id)}
                    />
                    <span className="posts-filters__option-icon" style={{ color: networkColor(n.id, theme) }}>
                      <Icon size={14} />
                    </span>
                    {n.label}
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filtro: período */}
      <div className="posts-filters__chip" ref={perRef}>
        <button
          type="button"
          className={`posts-filters__btn${period !== 'all' ? ' posts-filters__btn--active' : ''}`}
          onClick={() => setPerOpen(o => !o)}
        >
          <LuCalendar size={14} />
          {periodLabel}
        </button>
        {perOpen && (
          <div className="posts-filters__pop">
            <div className="posts-filters__pop-list">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`posts-filters__period${p.id === period ? ' posts-filters__period--active' : ''}`}
                  onClick={() => { onPeriodChange(p.id); setPerOpen(false) }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chips ativos (pode limpar individualmente) */}
      {selectedNetworks.map(id => {
        const n = NETWORKS.find(x => x.id === id)
        if (!n) return null
        const Icon = n.Icon
        const color = networkColor(id, theme)
        return (
          <span key={id} className="posts-filters__active" style={{ borderColor: color, color }}>
            <Icon size={12} />
            {n.label}
            <button type="button" onClick={() => toggleNetwork(id)} aria-label="Remover">
              <LuX size={11} />
            </button>
          </span>
        )
      })}

      <div className="posts-filters__spacer" />

      {/* Toggle de view: lista / calendário */}
      <div className="posts-filters__view-toggle">
        <button
          type="button"
          className={`posts-filters__view${view === 'list' ? ' posts-filters__view--active' : ''}`}
          onClick={() => onViewChange('list')}
          aria-label="Visualização em lista"
        >
          <LuList size={14} /> Lista
        </button>
        <button
          type="button"
          className={`posts-filters__view${view === 'calendar' ? ' posts-filters__view--active' : ''}`}
          onClick={() => onViewChange('calendar')}
          aria-label="Visualização em calendário"
        >
          <LuLayoutGrid size={14} /> Calendário
        </button>
      </div>
    </div>
  )
}
