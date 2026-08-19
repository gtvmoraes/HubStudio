import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LuChevronDown, LuCheck, LuPlus, LuUser, LuLogIn } from 'react-icons/lu'
import { useTeam } from '../../contexts/TeamContext'
import { ROLES } from '../../services/team'
import './ContextSwitcher.css'

const initial = (name) => name?.charAt(0).toUpperCase() || '?'

function ContextAvatar({ context, size = 'md' }) {
  const klass = `context-switcher__avatar${size === 'sm' ? ' context-switcher__avatar--sm' : ''}`
  if (context.personal) {
    return (
      <div className={`${klass} context-switcher__avatar--personal`}>
        <LuUser size={size === 'sm' ? 15 : 20} />
      </div>
    )
  }
  if (context.photo) {
    return (
      <div className={klass} style={{ background: 'transparent' }}>
        <img src={context.photo} alt="" />
      </div>
    )
  }
  return (
    <div className={klass} style={{ background: context.color }}>
      {initial(context.name)}
    </div>
  )
}

// Seletor global de contexto (Pessoal ou uma das equipes do usuário) — deixa
// explícito em qual escopo as ações de conectar rede/publicar/ver dados
// estão acontecendo. Sempre visível (diferente do antigo TeamSwitcher, que
// só existia dentro da página Equipes e desaparecia sem uma equipe ativa).
export default function ContextSwitcher({ onCreateClick }) {
  const { contexts, activeContext, switchTeam } = useTeam()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="context-switcher" ref={ref}>
      <button
        type="button"
        className="context-switcher__trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ContextAvatar context={activeContext} />
        <div className="context-switcher__info">
          <strong>{activeContext.name}</strong>
          <span>
            {activeContext.personal ? 'Sua conta' : (ROLES[activeContext.role]?.label || activeContext.role)}
            {!activeContext.personal && activeContext.plan ? ` · Plano ${activeContext.plan}` : ''}
          </span>
        </div>
        <LuChevronDown
          size={16}
          className={`context-switcher__chev${open ? ' context-switcher__chev--open' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="context-switcher__menu"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="context-switcher__menu-head">Contextos</div>

            <div className="context-switcher__list">
              {contexts.map((ctx, i) => {
                const isActive = ctx.id === activeContext.id
                return (
                  <motion.button
                    key={ctx.id ?? 'personal'}
                    type="button"
                    className={`context-switcher__item${isActive ? ' context-switcher__item--active' : ''}`}
                    onClick={() => { switchTeam(ctx.id); setOpen(false) }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                  >
                    <ContextAvatar context={ctx} size="sm" />
                    <div className="context-switcher__item-info">
                      <strong>{ctx.name}</strong>
                      <span>
                        {ctx.personal
                          ? 'Só você'
                          : `${ROLES[ctx.role]?.label || ctx.role} · ${ctx.totalMembers} ${ctx.totalMembers === 1 ? 'membro' : 'membros'}`}
                      </span>
                    </div>
                    {isActive && <LuCheck size={14} className="context-switcher__check" />}
                  </motion.button>
                )
              })}
            </div>

            <div className="context-switcher__divider" />

            <button
              type="button"
              className="context-switcher__action"
              onClick={() => { setOpen(false); onCreateClick() }}
            >
              <LuPlus size={14} /> Criar nova equipe
            </button>
            <button
              type="button"
              className="context-switcher__action"
              onClick={() => { setOpen(false); navigate('/dashboard/equipes') }}
            >
              <LuLogIn size={14} /> Entrar em uma equipe
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
