import { useEffect } from 'react'

/**
 * Registra um mapa de atalhos de teclado. Aceita combos como "mod+k" (mod = Cmd no
 * Mac e Ctrl no resto), e teclas únicas como "n" ou "?". Atalhos de tecla única
 * só disparam se o foco NÃO estiver num input/textarea/contenteditable.
 *
 * @param {Record<string, () => void>} shortcuts
 * @param {boolean} enabled — true por padrão
 */
export default function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handler = (e) => {
      const target = e.target
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      const key = e.key.toLowerCase()
      const mod = e.metaKey || e.ctrlKey
      const shift = e.shiftKey

      // Combos com modificador (mod+k, mod+shift+k, etc.) — sempre ativos
      if (mod) {
        const combo = shift ? `mod+shift+${key}` : `mod+${key}`
        if (shortcuts[combo]) {
          e.preventDefault()
          shortcuts[combo]()
          return
        }
      }

      // Atalhos de tecla única — bloqueia se estiver digitando
      if (!isTyping && shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}
