import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuX } from 'react-icons/lu'
import './Modal.css'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    // `scrollbar-gutter: stable` no <html> (em global.css) já reserva o espaço
    // da barra de rolagem, então o overflow:hidden aqui não causa layout shift.
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-root">
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={`modal modal--${size}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
          >
            {title && (
              <div className="modal__header">
                <h2 className="modal__title">{title}</h2>
                <button className="modal__close" onClick={onClose} aria-label="Fechar">
                  <LuX size={20} />
                </button>
              </div>
            )}
            <div className="modal__body">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
