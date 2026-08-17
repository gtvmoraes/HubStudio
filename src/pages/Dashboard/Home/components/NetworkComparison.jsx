import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { LuTrendingUp, LuTrendingDown, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'
import { networkColor } from '../../../../services/posts'
import { useTheme } from '../../../../contexts/ThemeContext'

const ICON_BY_ID = {
  instagram: FaInstagram,
  tiktok:    FaTiktok,
  youtube:   FaYoutube,
  facebook:  FaFacebook,
  linkedin:  FaLinkedin,
  twitter:   FaXTwitter,
}

// Engajamento (curtidas + comentários + compartilhamentos) das métricas reais
// coletadas por post — não "seguidores", que nenhuma rede expõe hoje.
const PERIOD_LABELS = {
  '24h': 'Engajamento nas últimas 24h',
  '7d':  'Engajamento nos últimos 7 dias',
  '30d': 'Engajamento nos últimos 30 dias',
  'all': 'Engajamento acumulado total',
}

const fmtCompact = (n) => {
  const num = Number(n) || 0
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return `${num}`
}

const SCROLL_STEP = 220

export default function NetworkComparison({ period = '30d', data = [] }) {
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
        {data.map(({ id, name, engagement, change, trend }) => {
          const Icon = ICON_BY_ID[id]
          const TrendIcon = trend === 'down' ? LuTrendingDown : LuTrendingUp
          const color = networkColor(id, theme)
          return (
            <div key={id} className="net-compare__card" style={{ '--net': color }}>
              <div className="net-compare__icon" style={{ background: `${color}18`, color }}>
                {Icon && <Icon size={18} />}
              </div>
              <div className="net-compare__body">
                <span className="net-compare__name">{name}</span>
                <strong className="net-compare__value">{fmtCompact(engagement)}</strong>
                {change && (
                  <span className={`net-compare__growth net-compare__growth--${trend}`}>
                    <TrendIcon size={11} /> {change}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
