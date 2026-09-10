import { useEffect, useState, useCallback, useRef } from 'react'

const PADDING = 10          // respiro entre o recorte e o elemento
const POLL_MS = 350         // procura o alvo até ele existir (troca de rota/render)
const GIVE_UP_MS = 2500     // depois disso, considera que o alvo não vai aparecer

/**
 * Acompanha a posição de um elemento marcado com data-tour="<anchor>".
 *
 * Devolve { rect, status }:
 *   status 'searching' → ainda procurando (a rota pode estar montando)
 *   status 'found'     → rect válido (coordenadas de viewport, já com padding)
 *   status 'missing'   → desistiu; o passo deve ser pulado se for optional
 *
 * Reage a scroll, resize e mudanças de layout (ResizeObserver no alvo),
 * sempre via requestAnimationFrame pra não travar a rolagem.
 */
export default function useAnchorRect(anchor, { active = true } = {}) {
  const [rect, setRect] = useState(null)
  const [status, setStatus] = useState(anchor ? 'searching' : 'found')
  const frameRef = useRef(null)
  const elRef = useRef(null)

  const measure = useCallback(() => {
    const el = elRef.current
    if (!el) return
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      // Elemento existe mas está oculto (display:none / colapsado)
      if (r.width === 0 && r.height === 0) return
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      })
    })
  }, [])

  useEffect(() => {
    if (!active) return
    // Passo sem âncora: card centralizado, nada a medir
    if (!anchor) {
      elRef.current = null
      setRect(null)
      setStatus('found')
      return
    }

    setStatus('searching')
    setRect(null)
    let cancelled = false
    let poll = null
    let giveUp = null
    let ro = null

    const attach = (el) => {
      elRef.current = el
      setStatus('found')
      // Traz o alvo pra área visível antes de medir
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      measure()
      // Remede enquanto o scroll suave acontece
      const settle = setInterval(measure, 60)
      setTimeout(() => clearInterval(settle), 700)

      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(measure)
        ro.observe(el)
      }
    }

    const find = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-tour="${anchor}"]`)
      if (el) {
        clearInterval(poll)
        clearTimeout(giveUp)
        attach(el)
      }
    }

    find()
    if (!elRef.current) {
      poll = setInterval(find, POLL_MS)
      giveUp = setTimeout(() => {
        clearInterval(poll)
        if (!cancelled && !elRef.current) setStatus('missing')
      }, GIVE_UP_MS)
    }

    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)

    return () => {
      cancelled = true
      clearInterval(poll)
      clearTimeout(giveUp)
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
      ro?.disconnect()
      elRef.current = null
    }
  }, [anchor, active, measure])

  return { rect, status, element: elRef.current }
}
