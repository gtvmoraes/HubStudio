import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LuMessageCircle, LuX, LuSend, LuTrash2 } from 'react-icons/lu'
import { useAuth } from '../../../../contexts/AuthContext'
import { useTeam } from '../../../../contexts/TeamContext'
import { getChatHistory, sendChatMessage, clearChatHistory } from '../../../../services/supportChat'
import '../Suporte.css'
import ChatMarkdown from '../../../../components/ChatMarkdown/ChatMarkdown'

const SOURCE_PATHS = new Set(['/dashboard/configuracoes?tab=perfil', '/dashboard/configuracoes?tab=redes', '/dashboard/posts', '/dashboard', '/dashboard/suporte'])

export default function LiveChatWidget({ open, onOpenChange }) {
  const { user } = useAuth()
  const { activeContext, can, loading: teamLoading } = useTeam()
  const companyId = activeContext.personal ? null : activeContext.id
  const analyticsAllowed = can('viewAnalytics')
  const [turns, setTurns] = useState([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState('')
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const sendController = useRef(null)
  const generation = useRef(0)
  const busy = useRef(false)

  useEffect(() => {
    generation.current++
    sendController.current?.abort()
    busy.current = false
    setTurns([]); setDraft(''); setError(''); setTyping(false); setClearing(false)
  }, [companyId, user?.id, analyticsAllowed])

  useEffect(() => {
    if (!open || teamLoading) return
    const controller = new AbortController()
    const current = generation.current
    setLoading(true); setError('')
    getChatHistory(companyId, controller.signal).then(history => {
      if (!controller.signal.aborted && current === generation.current) setTurns(history.turns || [])
    }).catch(err => {
      if (!controller.signal.aborted && current === generation.current) setError(err.message)
    }).finally(() => {
      if (!controller.signal.aborted && current === generation.current) setLoading(false)
    })
    return () => controller.abort()
  }, [open, companyId, user?.id, analyticsAllowed, teamLoading])

  useEffect(() => () => { generation.current++; sendController.current?.abort() }, [])
  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' }) }, [turns, typing, error])
  useEffect(() => { if (open && !loading) inputRef.current?.focus() }, [open, loading])

  const sendQuestion = async (value, retryId = null) => {
    const question = value.trim()
    if (!question || question.length > 2000 || busy.current || loading || teamLoading || clearing) return
    busy.current = true
    const current = generation.current
    const requestId = crypto.randomUUID()
    const controller = new AbortController()
    sendController.current = controller
    setDraft(''); setTyping(true); setError('')
    const pending = { id: requestId, question, answer: null }
    setTurns(previous => retryId ? previous.map(turn => turn.id === retryId ? pending : turn) : [...previous, pending])
    try {
      const response = await sendChatMessage(question, requestId, companyId, controller.signal)
      if (current === generation.current && !controller.signal.aborted) setTurns(previous => previous.map(turn => turn.id === requestId ? response : turn))
    } catch (err) {
      if (current === generation.current && !controller.signal.aborted) setTurns(previous => previous.map(turn => turn.id === requestId ? { ...turn, failure: err.message } : turn))
    } finally {
      if (current === generation.current) { busy.current = false; setTyping(false) }
    }
  }

  const clear = async () => {
    if (busy.current || clearing || loading || !window.confirm('Apagar a conversa deste contexto?')) return
    const current = generation.current
    const controller = new AbortController()
    sendController.current = controller
    setClearing(true); setError('')
    try {
      await clearChatHistory(companyId, controller.signal)
      if (current === generation.current) setTurns([])
    } catch (err) { if (current === generation.current && !controller.signal.aborted) setError(err.message) }
    finally { if (current === generation.current) setClearing(false) }
  }
  const unavailable = loading || typing || clearing || teamLoading
  const suggestions = ['Quais redes estão conectadas?', analyticsAllowed ? 'Como está meu desempenho nos últimos 30 dias?' : 'Como agendar uma publicação?', 'Por que uma publicação pode falhar?']

  return <>
    <button type="button" className={`sup-chat-fab ${open ? 'sup-chat-fab--hidden' : ''}`} onClick={() => onOpenChange(true)} aria-label="Abrir assistente HubStudio">
      <LuMessageCircle size={24} />
    </button>
    <AnimatePresence>{open && <motion.section className="sup-chat" role="dialog" aria-label="Assistente HubStudio" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} transition={{ duration: 0.22 }}>
      <div className="sup-chat__header">
        <div className="sup-chat__agent"><div className="sup-chat__avatar">H</div><div className="sup-chat__agent-info">
          <strong>Assistente HubStudio · IA</strong><span>{activeContext.personal ? 'Pessoal' : activeContext.name}</span>
        </div></div>
        <button type="button" className="sup-chat__close" disabled={unavailable || turns.length === 0} onClick={clear} aria-label="Apagar conversa"><LuTrash2 size={16} /></button>
        <button type="button" className="sup-chat__close" onClick={() => onOpenChange(false)} aria-label="Fechar chat"><LuX size={18} /></button>
      </div>
      <div className="sup-chat__body" ref={bodyRef} role="log" aria-live="polite" aria-relevant="additions text">
        <div className="sup-chat__msg sup-chat__msg--agent">Olá! Posso responder sobre seu perfil, redes e posts, além de ajudar com dúvidas sobre o HubStudio. Uso os dados do contexto selecionado e não altero sua conta.</div>
        <p className="sup-chat__notice">Respostas geradas com IA. Não envie senhas, códigos ou tokens.</p>
        {(loading || teamLoading) && <p role="status">Carregando conversa…</p>}
        {!loading && turns.length === 0 && <div className="sup-chat__suggestions">{suggestions.map(question => <button type="button" key={question} disabled={unavailable} onClick={() => sendQuestion(question)}>{question}</button>)}</div>}
        {turns.map(turn => <div key={turn.id} className="sup-chat__turn">
          <div className="sup-chat__msg sup-chat__msg--user">{turn.question}</div>
          {turn.answer && <div className="sup-chat__msg sup-chat__msg--agent">
            <ChatMarkdown>{turn.answer}</ChatMarkdown>
            <div className="sup-chat__sources"><span>Conferir no HubStudio:</span>{(turn.sources || []).filter(source => SOURCE_PATHS.has(source.path)).map(source => <Link key={source.path} to={source.path} onClick={() => onOpenChange(false)}>{source.label}</Link>)}</div>
          </div>}
          {turn.failure && <div className="sup-chat__error" role="alert"><p>{turn.failure}</p><button type="button" disabled={unavailable} onClick={() => sendQuestion(turn.question, turn.id)}>Tentar novamente</button></div>}
        </div>)}
        {typing && <div className="sup-chat__msg sup-chat__msg--agent sup-chat__typing" aria-label="Preparando resposta"><span /><span /><span /></div>}
        {error && <p className="sup-chat__error" role="alert">{error}</p>}
      </div>
      <form className="sup-chat__input" onSubmit={e => { e.preventDefault(); sendQuestion(draft) }}>
        <textarea ref={inputRef} rows={2} maxLength={2000} placeholder="Pergunte sobre seu perfil ou o HubStudio…" value={draft} onChange={e => setDraft(e.target.value)} disabled={unavailable} aria-label="Mensagem" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); sendQuestion(draft) } }} />
        <button type="submit" aria-label="Enviar" disabled={!draft.trim() || unavailable}><LuSend size={16} /></button>
      </form>
    </motion.section>}</AnimatePresence>
  </>
}
