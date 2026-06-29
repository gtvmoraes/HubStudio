import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuX, LuCopy, LuCheck, LuUsers } from 'react-icons/lu'

export default function ShareCodeModal({ isOpen, onClose, team }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(team?.joinCode ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              <h2>Compartilhar código de acesso</h2>
              <button type="button" onClick={onClose} aria-label="Fechar">
                <LuX size={18} />
              </button>
            </div>

            <div className="share-code">
              <div className="share-code__icon">
                <LuUsers size={28} />
              </div>

              <p className="share-code__desc">
                Compartilhe o código abaixo com quem você quer na equipe
                <strong> {team?.name}</strong>. Eles entram como
                <strong> Visualizadores</strong> e você define os cargos depois.
              </p>

              <div className="share-code__box">
                <span className="share-code__code">{team?.joinCode}</span>
                <button
                  type="button"
                  className={`share-code__copy${copied ? ' share-code__copy--done' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? <LuCheck size={15} /> : <LuCopy size={15} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>

              <p className="share-code__hint">
                A pessoa pode usar o código ao se cadastrar no HubStudio ou na
                tela de Equipes após entrar.
              </p>
            </div>

            <div className="invite__footer">
              <button type="button" className="invite__cancel" onClick={onClose}>
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
