import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuMessageCircle, LuX, LuSend } from 'react-icons/lu'

const WELCOME = {
  from: 'agent',
  text: 'Olá! Sou a Deb, do time HubStudio. Como posso te ajudar hoje?',
}

const AUTO_REPLY = 'Obrigada pela mensagem! Um especialista vai assumir esta conversa em instantes. Enquanto isso, dá uma olhada na nossa base de conhecimento acima.'

export default function LiveChatWidget({ open, onOpenChange }) {
  const [messages, setMessages] = useState([WELCOME])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages(m => [...m, { from: 'user', text }])
    setDraft('')
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages(m => [...m, { from: 'agent', text: AUTO_REPLY }])
    }, 1400)
  }

  return (
    <>
      <button
        type="button"
        className={`sup-chat-fab ${open ? 'sup-chat-fab--hidden' : ''}`}
        onClick={() => onOpenChange(true)}
        aria-label="Abrir chat ao vivo"
      >
        <LuMessageCircle size={24} />
        <span className="sup-chat-fab__pulse" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="sup-chat"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="sup-chat__header">
              <div className="sup-chat__agent">
                <div className="sup-chat__avatar">D</div>
                <div className="sup-chat__agent-info">
                  <strong>Deb · HubStudio</strong>
                  <span className="sup-chat__online"><i /> Online agora</span>
                </div>
              </div>
              <button className="sup-chat__close" onClick={() => onOpenChange(false)} aria-label="Fechar chat">
                <LuX size={18} />
              </button>
            </div>

            <div className="sup-chat__body" ref={bodyRef}>
              {messages.map((m, i) => (
                <div key={i} className={`sup-chat__msg sup-chat__msg--${m.from}`}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="sup-chat__msg sup-chat__msg--agent sup-chat__typing">
                  <span /><span /><span />
                </div>
              )}
            </div>

            <form className="sup-chat__input" onSubmit={send}>
              <input
                type="text"
                placeholder="Escreva sua mensagem…"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                aria-label="Mensagem"
              />
              <button type="submit" aria-label="Enviar" disabled={!draft.trim()}>
                <LuSend size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
