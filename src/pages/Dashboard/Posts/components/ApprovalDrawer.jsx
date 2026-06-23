import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuX, LuCheck, LuMessageSquare, LuCalendarClock,
  LuArrowLeft, LuSend,
} from 'react-icons/lu'
import { useAuth } from '../../../../contexts/AuthContext'
import StatusBadge from './StatusBadge'
import NetworkPills from './NetworkPills'
import PhonePreview from './PhonePreview'
import './ApprovalDrawer.css'

/**
 * Drawer lateral pra revisar um post pendente.
 * Mostra preview completo (com Phone Preview), thread de comentários e
 * ações de Aprovar / Pedir alterações / Rejeitar.
 */
export default function ApprovalDrawer({ post, isOpen, onClose, onAction }) {
  const { user } = useAuth()
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (post) setComments(post.comments || [])
  }, [post])

  // Trava o scroll do body quando o drawer está aberto (igual ao Modal)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!post) return null

  // Mapeia o `type` antigo (string) pra `typesByNetwork` pro PhonePreview
  const typesByNetwork = {}
  ;(post.networks || []).forEach(n => { typesByNetwork[n] = post.type })

  const addComment = () => {
    if (!comment.trim()) return
    const newComment = {
      id: Date.now(),
      author: user?.name || 'Você',
      text: comment.trim(),
      createdAt: new Date().toISOString(),
    }
    setComments(prev => [...prev, newComment])
    setComment('')
  }

  const handleDecision = async (decision) => {
    if (decision === 'reject' && !comment.trim()) {
      alert('Adicione um comentário explicando o motivo da rejeição.')
      return
    }
    setSubmitting(true)
    if (comment.trim()) addComment()
    await new Promise(r => setTimeout(r, 400))
    setSubmitting(false)
    onAction(decision, { ...post, comments: [...comments, ...(comment.trim() ? [{
      id: Date.now(),
      author: user?.name || 'Você',
      text: comment.trim(),
      createdAt: new Date().toISOString(),
    }] : [])] })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="approval-root">
          <motion.div
            className="approval__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className="approval"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="approval__header">
              <button
                type="button"
                className="approval__back"
                onClick={onClose}
                aria-label="Voltar"
              >
                <LuArrowLeft size={18} />
              </button>
              <div className="approval__title">
                <h2>Revisar publicação</h2>
                <StatusBadge status={post.status} />
              </div>
              <button
                type="button"
                className="approval__close"
                onClick={onClose}
                aria-label="Fechar"
              >
                <LuX size={18} />
              </button>
            </div>

            {/* Conteúdo scrollável */}
            <div className="approval__body">
              {/* Meta info */}
              <div className="approval__meta">
                <div className="approval__author">
                  <div className="approval__avatar">
                    {(post.author?.name?.[0] || 'A').toUpperCase()}
                  </div>
                  <div>
                    <strong>{post.author?.name}</strong>
                    <span>{post.author?.email}</span>
                  </div>
                </div>
                <div className="approval__info">
                  <span>
                    <LuCalendarClock size={13} />
                    {post.scheduledFor
                      ? `Quer publicar em ${new Date(post.scheduledFor).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}`
                      : 'Sem data agendada'}
                  </span>
                </div>
              </div>

              <div className="approval__networks">
                <span className="approval__label">Redes</span>
                <NetworkPills networks={post.networks} size={16} />
              </div>

              {/* Phone preview */}
              <div className="approval__preview-section">
                <span className="approval__label">Pré-visualização</span>
                <PhonePreview
                  networks={post.networks || []}
                  typesByNetwork={typesByNetwork}
                  title={post.title}
                  content={post.content}
                  user={post.author}
                />
              </div>

              {/* Comentários */}
              <div className="approval__comments">
                <span className="approval__label">
                  <LuMessageSquare size={14} /> Comentários ({comments.length})
                </span>
                <div className="approval__comments-list">
                  {comments.length === 0 ? (
                    <p className="approval__no-comments">
                      Nenhum comentário ainda. Adicione um abaixo se for pedir alterações.
                    </p>
                  ) : (
                    comments.map(c => (
                      <div key={c.id} className="approval__comment">
                        <div className="approval__comment-avatar">
                          {c.author?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="approval__comment-body">
                          <strong>{c.author}</strong>
                          <span className="approval__comment-time">
                            {new Date(c.createdAt).toLocaleString('pt-BR', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          <p>{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="approval__comment-input">
                  <textarea
                    placeholder="Escreva um comentário (obrigatório pra rejeitar)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                  />
                  <button
                    type="button"
                    className="approval__comment-send"
                    onClick={addComment}
                    disabled={!comment.trim()}
                  >
                    <LuSend size={14} /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Footer com ações */}
            <div className="approval__footer">
              <button
                type="button"
                className="approval__btn approval__btn--danger"
                onClick={() => handleDecision('reject')}
                disabled={submitting}
              >
                <LuX size={15} /> Rejeitar
              </button>
              <button
                type="button"
                className="approval__btn approval__btn--success"
                onClick={() => handleDecision('approve')}
                disabled={submitting}
              >
                <LuCheck size={15} /> Aprovar e agendar
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
