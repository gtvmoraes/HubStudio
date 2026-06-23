import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  LuCircleCheck,
  LuInfo,
  LuTriangleAlert,
  LuCircleX,
  LuX,
} from 'react-icons/lu'
import './Toast.css'

const TOAST_CONFIG = {
  success: {
    icon: LuCircleCheck,
    label: 'Sucesso',
  },
  error: {
    icon: LuCircleX,
    label: 'Erro',
  },
  warning: {
    icon: LuTriangleAlert,
    label: 'Aviso',
  },
  info: {
    icon: LuInfo,
    label: 'Informacao',
  },
}

export default function Toast({ toast, onClose }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info
  const Icon = config.icon
  const duration = toast.duration ?? 4000
  const canAutoClose = duration !== Infinity && duration > 0

  useEffect(() => {
    if (!canAutoClose) return undefined

    const timeoutId = window.setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => window.clearTimeout(timeoutId)
  }, [canAutoClose, duration, onClose, toast.id])

  const progressTransition = useMemo(() => ({
    duration: duration / 1000,
    ease: 'linear',
  }), [duration])

  return (
    <motion.article
      className={`toast toast--${toast.type}`}
      layout
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      initial={{ opacity: 0, x: 72, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 44, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="toast__accent" aria-hidden="true" />

      <div className="toast__icon" aria-hidden="true">
        <Icon size={18} strokeWidth={2.25} />
      </div>

      <div className="toast__content">
        <strong className="toast__title">{toast.title || config.label}</strong>
        {toast.message && (
          <p className="toast__message">{toast.message}</p>
        )}
      </div>

      {toast.closable !== false && (
        <button
          type="button"
          className="toast__close"
          onClick={() => onClose(toast.id)}
          aria-label="Fechar notificacao"
        >
          <LuX size={16} />
        </button>
      )}

      {canAutoClose && (
        <motion.span
          className="toast__progress"
          aria-hidden="true"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={progressTransition}
        />
      )}
    </motion.article>
  )
}
