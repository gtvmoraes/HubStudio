import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LuArrowRight, LuArrowLeft, LuX, LuSparkles, LuCircleCheck, LuHand } from 'react-icons/lu'
import { useTour } from './TourProvider'
import useAnchorRect from './useAnchorRect'
import './Tour.css'

const CARD_W = 380
const CARD_GAP = 18
const MARGIN = 16          // respiro mínimo das bordas da tela

// Escolhe onde encaixar o cartão em relação ao recorte, com fallback
// automático quando não cabe no lado pedido.
function placeCard(rect, placement, vw, vh, cardH = 210) {
  if (!rect) {
    return { top: vh / 2 - cardH / 2, left: vw / 2 - CARD_W / 2, centered: true }
  }
  const fits = {
    bottom: rect.top + rect.height + CARD_GAP + cardH < vh - MARGIN,
    top:    rect.top - CARD_GAP - cardH > MARGIN,
    right:  rect.left + rect.width + CARD_GAP + CARD_W < vw - MARGIN,
    left:   rect.left - CARD_GAP - CARD_W > MARGIN,
  }
  const order = [placement, 'bottom', 'top', 'right', 'left'].filter(Boolean)
  const side = order.find(s => fits[s]) || 'bottom'

  let top, left
  if (side === 'bottom') { top = rect.top + rect.height + CARD_GAP; left = rect.left + rect.width / 2 - CARD_W / 2 }
  if (side === 'top')    { top = rect.top - CARD_GAP - cardH;       left = rect.left + rect.width / 2 - CARD_W / 2 }
  if (side === 'right')  { left = rect.left + rect.width + CARD_GAP; top = rect.top + rect.height / 2 - cardH / 2 }
  if (side === 'left')   { left = rect.left - CARD_GAP - CARD_W;     top = rect.top + rect.height / 2 - cardH / 2 }

  // Prende dentro da viewport
  left = Math.max(MARGIN, Math.min(left, vw - CARD_W - MARGIN))
  top  = Math.max(MARGIN, Math.min(top,  vh - cardH - MARGIN))
  return { top, left, side }
}

const useViewport = () => {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return vp
}

export default function TourOverlay() {
  const { step, index, total, chapters, steps, next, prev, finish, skipChapter } = useTour()
  const navigate = useNavigate()
  const vp = useViewport()
  const { rect, status } = useAnchorRect(step?.anchor, { active: true })

  const spring = { type: 'spring', stiffness: 260, damping: 30, mass: 0.8 }

  // Passo com âncora inexistente e marcado como optional → segue adiante
  useEffect(() => {
    if (status === 'missing' && step?.optional) next()
  }, [status, step, next])

  // Passo "waitFor: click" avança quando o usuário clica no alvo de verdade
  useEffect(() => {
    if (step?.waitFor !== 'click' || !step?.anchor) return
    const el = document.querySelector(`[data-tour="${step.anchor}"]`)
    if (!el) return
    const onClick = () => setTimeout(next, 450)
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [step, next])

  // Teclado: setas navegam, Esc encerra
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); finish() }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, finish])

  const pos = useMemo(
    () => placeCard(rect, step?.placement, vp.w, vp.h),
    [rect, step?.placement, vp.w, vp.h]
  )

  const chapterIdx = chapters.findIndex(c => c.id === step?.chapter)
  const isLast = index === total - 1
  const waiting = step?.waitFor === 'click'

  // Progresso por capítulo: quantos passos de cada ato já passaram
  const chapterProgress = useMemo(() => chapters.map(ch => {
    const all = steps.filter(s => s.chapter === ch.id)
    const done = all.filter(s => steps.indexOf(s) < index).length
    return { ...ch, total: all.length, done, active: ch.id === step?.chapter }
  }), [chapters, steps, index, step])

  if (!step) return null

  return createPortal(
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="Tour guiado">
      {/* ── Máscara com o recorte do holofote ── */}
      <svg className="tour-mask" width={vp.w} height={vp.h} aria-hidden="true">
        <defs>
          <mask id="tour-hole">
            <rect x="0" y="0" width={vp.w} height={vp.h} fill="white" />
            {rect && (
              <motion.rect
                initial={false}
                animate={{ x: rect.left, y: rect.top, width: rect.width, height: rect.height }}
                transition={spring}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width={vp.w} height={vp.h}
          className="tour-mask__fill"
          mask="url(#tour-hole)"
          onClick={finish}
        />
      </svg>

      {/* ── Anel de neon girando ao redor do alvo ── */}
      {rect && (
        <motion.div
          className={`tour-ring${waiting ? ' tour-ring--waiting' : ''}`}
          initial={false}
          animate={{ x: rect.left, y: rect.top, width: rect.width, height: rect.height }}
          transition={spring}
          aria-hidden="true"
        />
      )}

      {/* ── Cartão ── */}
      <motion.div
        className={`tour-card${pos.centered ? ' tour-card--center' : ''}`}
        initial={false}
        animate={{ x: pos.left, y: pos.top, opacity: 1 }}
        transition={spring}
        style={{ width: CARD_W }}
      >
        {/* Capítulos */}
        <div className="tour-card__chapters" aria-hidden="true">
          {chapterProgress.map((ch, i) => (
            <span
              key={ch.id}
              className={`tour-chip${ch.active ? ' tour-chip--active' : ''}${i < chapterIdx ? ' tour-chip--done' : ''}`}
            >
              {ch.active ? ch.label : i < chapterIdx ? <LuCircleCheck size={11} /> : i + 1}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <h3 className="tour-card__title">
              {step.finale ? <LuCircleCheck size={17} /> : <LuSparkles size={16} />}
              {step.title}
            </h3>
            <p className="tour-card__body">{step.body}</p>

            {waiting && (
              <p className="tour-card__hint">
                <LuHand size={13} /> Clique no elemento destacado pra continuar
              </p>
            )}

            {step.action && (
              <button
                type="button"
                className="tour-card__action"
                onClick={() => { finish(); navigate(step.action.to) }}
              >
                {step.action.label} <LuArrowRight size={14} />
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="tour-card__footer">
          <button type="button" className="tour-card__ghost" onClick={finish}>
            {isLast ? 'Fechar' : 'Pular tour'}
          </button>

          <div className="tour-card__nav">
            <span className="tour-card__count">{index + 1}/{total}</span>
            {index > 0 && (
              <button type="button" className="tour-card__icon-btn" onClick={prev} aria-label="Anterior">
                <LuArrowLeft size={15} />
              </button>
            )}
            <button type="button" className="tour-card__next" onClick={isLast ? finish : next}>
              {isLast ? 'Concluir' : waiting ? 'Pular etapa' : 'Próximo'}
              {!isLast && <LuArrowRight size={14} />}
            </button>
          </div>
        </div>

        {!isLast && step.chapter !== 'intro' && (
          <button type="button" className="tour-card__skip-chapter" onClick={skipChapter}>
            Pular capítulo
          </button>
        )}

        <button type="button" className="tour-card__close" onClick={finish} aria-label="Fechar tour">
          <LuX size={15} />
        </button>
      </motion.div>
    </div>,
    document.body
  )
}
