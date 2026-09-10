import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { STEPS, CHAPTERS, TOUR_KEYS } from './steps'
import TourOverlay from './TourOverlay'

const TourContext = createContext(null)
export const useTour = () => useContext(TourContext)

export function TourProvider({ children, onExpandSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [index, setIndex] = useState(-1)     // -1 = tour fechado
  const lastRoute = useRef(null)

  const open = index >= 0
  const step = open ? STEPS[index] : null

  // A sidebar recolhida esconde o seletor de contexto (display:none), o que
  // deixaria passos sem alvo. Expande UMA vez, na abertura do tour — depois o
  // usuário continua livre pra recolher se quiser.
  const expandRef = useRef(onExpandSidebar)
  expandRef.current = onExpandSidebar
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) expandRef.current?.()
    wasOpen.current = open
  }, [open])

  // ── Início automático: só logo após o cadastro ──────────────
  useEffect(() => {
    const shouldStart = localStorage.getItem(TOUR_KEYS.legacyFlag)
    if (!shouldStart) return
    // Retoma de onde parou, se o usuário recarregou no meio
    const saved = localStorage.getItem(TOUR_KEYS.progress)
    const resumeAt = saved ? STEPS.findIndex(s => s.id === saved) : 0
    const t = setTimeout(() => setIndex(resumeAt >= 0 ? resumeAt : 0), 600)
    return () => clearTimeout(t)
  }, [])

  // ── Persistência do progresso ───────────────────────────────
  useEffect(() => {
    if (open && step) localStorage.setItem(TOUR_KEYS.progress, step.id)
  }, [open, step])

  // ── Navegação dirigida pelo tour ────────────────────────────
  // Quando o passo declara uma rota diferente da atual, o tour leva o
  // usuário até lá antes de tentar achar a âncora.
  useEffect(() => {
    if (!open || !step?.route) return
    const current = location.pathname + location.search
    if (current === step.route || lastRoute.current === step.route) return
    lastRoute.current = step.route
    navigate(step.route)
  }, [open, step, location.pathname, location.search, navigate])

  const finish = useCallback(() => {
    localStorage.removeItem(TOUR_KEYS.legacyFlag)
    localStorage.removeItem(TOUR_KEYS.progress)
    localStorage.setItem(TOUR_KEYS.completed, '1')
    lastRoute.current = null
    setIndex(-1)
  }, [])

  const goTo = useCallback((i) => {
    if (i < 0) return
    if (i >= STEPS.length) return finish()
    setIndex(i)
  }, [finish])

  const next = useCallback(() => goTo(index + 1), [index, goTo])
  const prev = useCallback(() => goTo(index - 1), [index, goTo])

  // Pula todos os passos do capítulo atual de uma vez
  const skipChapter = useCallback(() => {
    if (!step) return
    let i = index
    while (i < STEPS.length && STEPS[i].chapter === step.chapter) i++
    goTo(i)
  }, [index, step, goTo])

  // Reinicia o tour do zero (botão "Refazer tour")
  const restart = useCallback(() => {
    localStorage.removeItem(TOUR_KEYS.progress)
    lastRoute.current = null
    setIndex(0)
  }, [])

  const value = useMemo(() => ({
    open, step, index, total: STEPS.length,
    steps: STEPS, chapters: CHAPTERS,
    next, prev, goTo, finish, skipChapter, restart,
  }), [open, step, index, next, prev, goTo, finish, skipChapter, restart])

  return (
    <TourContext.Provider value={value}>
      {children}
      {open && <TourOverlay />}
    </TourContext.Provider>
  )
}
