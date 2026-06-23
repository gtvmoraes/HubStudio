import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LuSearch, LuFileText, LuCornerDownLeft } from 'react-icons/lu'

export default function SupportHero({ firstName, articles = [], onOpenArticle }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const rootRef = useRef(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return articles
      .filter(a => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
      .slice(0, 5)
  }, [query, articles])

  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setFocused(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const showResults = focused && query.trim() && results.length > 0

  return (
    <motion.div
      className="sup-hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sup-hero__glow" aria-hidden="true" />
      <div className="sup-hero__inner">
        <span className="sup-hero__eyebrow">Central de Ajuda</span>
        <h1 className="sup-hero__title">Como podemos ajudar, {firstName}?</h1>
        <p className="sup-hero__sub">
          Busque na nossa base de conhecimento ou fale com nosso time.
        </p>

        <div className="sup-hero__search-wrap" ref={rootRef}>
          <div className={`sup-hero__search ${focused ? 'sup-hero__search--focused' : ''}`}>
            <LuSearch size={20} className="sup-hero__search-icon" />
            <input
              type="text"
              placeholder="Buscar artigos, guias e respostas…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              aria-label="Buscar na central de ajuda"
            />
            <kbd className="sup-hero__kbd">Enter</kbd>
          </div>

          {showResults && (
            <motion.div
              className="sup-hero__results"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {results.map(a => (
                <button
                  key={a.id}
                  type="button"
                  className="sup-hero__result"
                  onClick={() => { onOpenArticle?.(a); setFocused(false) }}
                >
                  <LuFileText size={16} />
                  <span className="sup-hero__result-text">
                    <strong>{a.title}</strong>
                    <small>{a.category}</small>
                  </span>
                  <LuCornerDownLeft size={14} className="sup-hero__result-enter" />
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
