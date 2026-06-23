import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Toast from './Toast'

const ToastContext = createContext(null)
let toastDispatcher = null

const DEFAULT_TOAST = {
  type: 'info',
  duration: 4000,
  closable: true,
}

function normalizeToast(toast) {
  if (typeof toast === 'string') {
    return {
      ...DEFAULT_TOAST,
      message: toast,
    }
  }

  return {
    ...DEFAULT_TOAST,
    ...toast,
    type: toast?.type || DEFAULT_TOAST.type,
  }
}

export function showToast(toast) {
  if (!toastDispatcher) {
    if (import.meta.env.DEV) {
      console.warn('ToastProvider ainda nao foi montado.')
    }
    return null
  }

  return toastDispatcher(toast)
}

export function ToastProvider({ children, maxToasts = 4 }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast) => {
    const id = toast?.id || `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const nextToast = {
      ...normalizeToast(toast),
      id,
    }

    setToasts(current => [nextToast, ...current].slice(0, maxToasts))
    return id
  }, [maxToasts])

  useEffect(() => {
    toastDispatcher = addToast

    return () => {
      if (toastDispatcher === addToast) {
        toastDispatcher = null
      }
    }
  }, [addToast])

  const value = useMemo(() => ({
    showToast: addToast,
    closeToast: removeToast,
  }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-viewport" aria-label="Notificacoes">
        <AnimatePresence initial={false}>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.')
  }

  return context
}
