import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuX, LuCheck, LuMessageSquare, LuCalendarClock,
  LuArrowLeft, LuZap,
} from 'react-icons/lu'
import { approvePost, rejectPost, getBestTimeSlots } from '../../../../services/posts'
import StatusBadge from './StatusBadge'
import NetworkPills from './NetworkPills'
import PhonePreview from './PhonePreview'
import DateTimePicker from './DateTimePicker'
import './ApprovalDrawer.css'

// A data só serve se ainda estiver no futuro (o backend exige > agora + 1 min).
const isFuture = (iso) => Boolean(iso) && new Date(iso).getTime() > Date.now() + 60_000

/**
 * Drawer lateral pra revisar um post pendente: preview completo e as decisões.
 * Aprovar já agenda o post na data pedida pelo autor — se ela passou enquanto
 * o post esperava, o revisor escolhe outra data ou publica na hora.
 * Rejeitar exige um motivo, que fica salvo no post pro autor corrigir.
 */
export default function ApprovalDrawer({ post, isOpen, onClose, onAction }) {
  const [reason, setReason] = useState('')
  const [newDate, setNewDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setReason('')
    setNewDate('')
    setError('')
  }, [post?.id])

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

  const datePassed = !isFuture(post.scheduledFor)

  const decide = async (decision, options = {}) => {
    setError('')
    if (decision === 'reject' && !reason.trim()) {
      setError('Escreva o motivo da rejeição — o autor vai ver pra poder corrigir.')
      return
    }
    if (decision === 'approve' && !options.publishNow && datePassed && !isFuture(newDate)) {
      setError('A data pedida já passou. Escolha uma nova data no futuro ou publique agora.')
      return
    }
    setSubmitting(true)
    try {
      if (decision === 'reject') {
        await rejectPost(post.id, reason.trim())
      } else {
        await approvePost(post.id, {
          publishNow: options.publishNow,
          scheduledAt: !options.publishNow && newDate ? `${newDate.slice(0, 16)}:00` : null,
        })
      }
      onAction(decision)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
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
                    <strong>{post.author?.name || 'Autor desconhecido'}</strong>
                    {post.submittedAt && (
                      <span>
                        Enviado em {new Date(post.submittedAt).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
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

              {/* Data — se passou, o revisor escolhe outra (ou publica agora no rodapé) */}
              <div className="approval__reschedule">
                <span className="approval__label">
                  <LuCalendarClock size={14} /> {datePassed ? 'Nova data de publicação' : 'Mudar a data (opcional)'}
                </span>
                {datePassed && (
                  <p className="approval__no-comments">
                    A data pedida pelo autor já passou enquanto o post aguardava revisão.
                  </p>
                )}
                <DateTimePicker
                  value={newDate}
                  onChange={setNewDate}
                  placeholder={datePassed ? 'Escolha quando publicar' : 'Manter a data do autor'}
                  openUpward
                  getBestTimes={getBestTimeSlots}
                />
              </div>

              {/* Motivo da rejeição */}
              <div className="approval__comments">
                <span className="approval__label">
                  <LuMessageSquare size={14} /> Motivo (obrigatório pra rejeitar)
                </span>
                <div className="approval__comment-input">
                  <textarea
                    placeholder="Ex: troque a imagem de capa e revise a legenda..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                </div>
              </div>

              {error && <p className="approval__error" role="alert">{error}</p>}
            </div>

            {/* Footer com ações */}
            <div className="approval__footer">
              <button
                type="button"
                className="approval__btn approval__btn--danger"
                onClick={() => decide('reject')}
                disabled={submitting}
              >
                <LuX size={15} /> Rejeitar
              </button>
              {datePassed && (
                <button
                  type="button"
                  className="approval__btn approval__btn--success"
                  onClick={() => decide('approve', { publishNow: true })}
                  disabled={submitting}
                >
                  <LuZap size={15} /> Publicar agora
                </button>
              )}
              <button
                type="button"
                className="approval__btn approval__btn--success"
                onClick={() => decide('approve')}
                disabled={submitting || (datePassed && !newDate)}
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
