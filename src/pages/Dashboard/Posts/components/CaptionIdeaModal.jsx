import { useState, useRef, useEffect } from 'react'
import { LuX, LuWandSparkles, LuLoaderCircle } from 'react-icons/lu'
import './CaptionIdeaModal.css'

export default function CaptionIdeaModal({ networkLabel, onGenerate, onClose }) {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!idea.trim() || loading) return
    setLoading(true)
    setError('')
    try {
      await onGenerate(idea.trim())
    } catch (err) {
      setError(err.message || 'Erro ao gerar legenda. Tente novamente.')
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e)
  }

  return (
    <div className="caption-modal__overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="caption-modal" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <button className="caption-modal__close" type="button" onClick={onClose} aria-label="Fechar">
          <LuX size={18} />
        </button>

        <div className="caption-modal__header">
          <LuWandSparkles size={22} className="caption-modal__icon" />
          <div>
            <h2>Gerar legenda com IA</h2>
            <p>Para <strong>{networkLabel}</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="caption-modal__field">
            <label htmlFor="caption-idea">
              Descreva brevemente o assunto do seu post
            </label>
            <textarea
              id="caption-idea"
              ref={textareaRef}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ex: dicas de produtividade para empreendedores que trabalham de casa"
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <span className="caption-modal__counter">{idea.length} / 500</span>
          </div>

          {error && <p className="caption-modal__error">{error}</p>}

          <div className="caption-modal__actions">
            <button
              type="button"
              className="caption-modal__btn caption-modal__btn--ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="caption-modal__btn caption-modal__btn--primary"
              disabled={!idea.trim() || loading}
            >
              {loading
                ? <><LuLoaderCircle size={15} className="caption-modal__spin" /> Gerando...</>
                : <><LuWandSparkles size={15} /> Gerar legenda</>}
            </button>
          </div>

          <p className="caption-modal__hint">Ctrl+Enter para gerar rapidamente</p>
        </form>
      </div>
    </div>
  )
}
