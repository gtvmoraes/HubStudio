import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LuTrendingUp, LuTrendingDown, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const NETWORKS = [
  { id: 'instagram', name: 'Instagram',   icon: FaInstagram, followers: '8.6K', growth: '+12.4%', trend: 'up'   },
  { id: 'tiktok',    name: 'TikTok',      icon: FaTiktok,    followers: '4.2K', growth: '+24.8%', trend: 'up'   },
  { id: 'youtube',   name: 'YouTube',     icon: FaYoutube,   followers: '1.8K', growth: '+6.1%',  trend: 'up'   },
  { id: 'facebook',  name: 'Facebook',    icon: FaFacebook,  followers: '3.1K', growth: '+8.3%',  trend: 'up'   },
  { id: 'linkedin',  name: 'LinkedIn',    icon: FaLinkedin,  followers: '1.2K', growth: '+15.6%', trend: 'up'   },
  { id: 'twitter',   name: 'X (Twitter)', icon: FaXTwitter,  followers: '912',  growth: '-2.3%',  trend: 'down' },
]

const PERIOD_LABELS = {
  '24h': 'Crescimento nas últimas 24h',
  '7d':  'Crescimento nos últimos 7 dias',
  '30d': 'Crescimento nos últimos 30 dias',
  'all': 'Crescimento acumulado total',
}

const SCROLL_STEP = 220

export default function NetworkComparison({ period = '30d' }) {
  const { theme } = useTheme()
  const trackRef = useRef(null)
  const [canLeft,  setCanLeft]  = useState(false)
  const [canRight, setCanRight] = useState(true)

  // drag state
  const drag = useRef({ active: false, startX: 0, scrollStart: 0 })

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' })
  }

  const onPointerDown = (e) => {
    drag.current = { active: true, startX: e.clientX, scrollStart: trackRef.current.scrollLeft }
    trackRef.current.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    trackRef.current.scrollLeft = drag.current.scrollStart - dx
    updateArrows()
  }
  const onPointerUp = () => { drag.current.active = false }

  return (
    <motion.div
      className="net-compare"
      variants={fadeUp} initial="hidden" animate="visible" custom={5}
    >
      <div className="net-compare__header">
        <h3>Comparação entre redes</h3>
        <div className="net-compare__controls">
          <span className="net-compare__sub">{PERIOD_LABELS[period] ?? PERIOD_LABELS['30d']}</span>
          <button
            className="net-compare__arrow"
            onClick={() => scroll(-1)}
            disabled={!canLeft}
            aria-label="Anterior"
          >
            <LuChevronLeft size={16} />
          </button>
          <button
            className="net-compare__arrow"
            onClick={() => scroll(1)}
            disabled={!canRight}
            aria-label="Próximo"
          >
            <LuChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        className="net-compare__track"
        ref={trackRef}
        onScroll={updateArrows}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {NETWORKS.map(({ id, name, icon: Icon, followers, growth, trend }) => {
          const TrendIcon = trend === 'up' ? LuTrendingUp : LuTrendingDown
          const color = networkColor(id, theme)
          return (
            <div key={id} className="net-compare__card" style={{ '--net': color }}>
              <div className="net-compare__icon" style={{ background: `${color}18`, color }}>
                <Icon size={18} />
              </div>
              <div className="net-compare__body">
                <span className="net-compare__name">{name}</span>
                <strong className="net-compare__value">{followers}</strong>
                <span className={`net-compare__growth net-compare__growth--${trend}`}>
                  <TrendIcon size={11} /> {growth}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
