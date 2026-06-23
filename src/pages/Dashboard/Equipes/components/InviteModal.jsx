import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuX, LuMail, LuSend } from 'react-icons/lu'
import { ROLES, ROLE_ORDER } from '../../../../services/team'

export default function InviteModal({ isOpen, onClose, onInvite }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const canSubmit = email.trim().includes('@') && role

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSending(true)
    await new Promise(r => setTimeout(r, 500))
    onInvite({ email: email.trim(), role, message })
    setSending(false)
    setEmail(''); setRole('editor'); setMessage('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="invite-root">
          <motion.div
            className="invite__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="invite"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="invite__head">
              <h2>Convidar membro</h2>
              <button type="button" onClick={onClose} aria-label="Fechar">
                <LuX size={18} />
              </button>
            </div>

            <form className="invite__form" onSubmit={handleSubmit}>
              <div className="invite__field">
                <label htmlFor="invite-email">
                  <LuMail size={13} /> E-mail
                </label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="colega@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="invite__field">
                <label>Papel</label>
                <div className="invite__roles">
                  {ROLE_ORDER.filter(id => id !== 'admin').map(id => {
                    const r = ROLES[id]
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`invite__role${role === id ? ' invite__role--active' : ''}`}
                        style={role === id ? { borderColor: r.color, color: r.color, background: `${r.color}12` } : {}}
                        onClick={() => setRole(id)}
                      >
                        <strong>{r.label}</strong>
                        <span>{r.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="invite__field">
                <label htmlFor="invite-msg">Mensagem <span>(opcional)</span></label>
                <textarea
                  id="invite-msg"
                  placeholder="Olá! Te convido pra fazer parte do nosso time..."
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>

              <div className="invite__footer">
                <button type="button" className="invite__cancel" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="invite__submit"
                  disabled={!canSubmit || sending}
                >
                  <LuSend size={14} />
                  {sending ? 'Enviando...' : 'Enviar convite'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
