import { useState, useRef, useEffect } from 'react'
import { LuX, LuWandSparkles, LuLoaderCircle, LuRefreshCw, LuCheck } from 'react-icons/lu'
import './CaptionIdeaModal.css'

const MAX_REGENS = 3

export default function CaptionIdeaModal({ networkLabel, onGenerate, onSelect, onClose }) {
  const [idea, setIdea] = useState('')
  const [phase, setPhase] = useState('input') // 'input' | 'select'
  const [captions, setCaptions] = useState([])
  const [cta, setCta] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [regenCount, setRegenCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (phase === 'input') textareaRef.current?.focus()
  }, [phase])

  const generate = async (currentIdea) => {
    setLoading(true)
    setError('')
    try {
      const result = await onGenerate(currentIdea)
      setCaptions(result.captions ?? result)
      setCta(result.cta ?? '')
      setSelectedIdx(0)
      setPhase('select')
    } catch (err) {
      setError(err.message || 'Erro ao gerar legendas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!idea.trim() || loading) return
    generate(idea.trim())
  }

  const handleRegen = () => {
    if (regenCount >= MAX_REGENS || loading) return
    setRegenCount(n => n + 1)
    generate(idea.trim())
  }

  const handleUse = () => {
    onSelect(captions[selectedIdx], cta)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    if (phase === 'input' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e)
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
            <h2>{phase === 'input' ? 'Gerar legenda com IA' : 'Escolha uma opção'}</h2>
            <p>Para <strong>{networkLabel}</strong></p>
          </div>
        </div>

        {phase === 'input' && (
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
                  : <><LuWandSparkles size={15} /> Gerar legendas</>}
              </button>
            </div>

            <p className="caption-modal__hint">Ctrl+Enter para gerar rapidamente</p>
          </form>
        )}

        {phase === 'select' && (
          <div>
            {loading ? (
              <div className="caption-modal__loading">
                <LuLoaderCircle size={22} className="caption-modal__spin" />
                <span>Gerando novas opções...</span>
              </div>
            ) : (
              <div className="caption-modal__options">
                {captions.map((cap, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`caption-modal__option${selectedIdx === i ? ' caption-modal__option--selected' : ''}`}
                    onClick={() => setSelectedIdx(i)}
                  >
                    {selectedIdx === i && <LuCheck size={14} className="caption-modal__option-check" />}
                    <p>{cap}</p>
                  </button>
                ))}
              </div>
            )}

            {error && <p className="caption-modal__error">{error}</p>}

            <div className="caption-modal__actions caption-modal__actions--select">
              <button
                type="button"
                className="caption-modal__btn caption-modal__btn--ghost"
                onClick={handleRegen}
                disabled={loading || regenCount >= MAX_REGENS}
                title={regenCount >= MAX_REGENS ? 'Limite de regenerações atingido' : `Regenerar (${MAX_REGENS - regenCount} restante${MAX_REGENS - regenCount !== 1 ? 's' : ''})`}
              >
                <LuRefreshCw size={14} /> Regenerar
                {regenCount > 0 && <span className="caption-modal__regen-count">{regenCount}/{MAX_REGENS}</span>}
              </button>
              <button
                type="button"
                className="caption-modal__btn caption-modal__btn--ghost"
                onClick={() => setPhase('input')}
                disabled={loading}
              >
                Voltar
              </button>
              <button
                type="button"
                className="caption-modal__btn caption-modal__btn--primary"
                onClick={handleUse}
                disabled={loading || captions.length === 0}
              >
                <LuCheck size={15} /> Usar esta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
