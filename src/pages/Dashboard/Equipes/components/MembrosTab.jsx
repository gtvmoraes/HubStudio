import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuSearch, LuUserPlus } from 'react-icons/lu'
import { ROLES, ROLE_ORDER } from '../../../../services/team'
import MemberRow from './MemberRow'

export default function MembrosTab({ members, currentUserId, onRoleChange, onRemove, onInviteClick }) {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = useMemo(() => {
    let list = members
    if (roleFilter !== 'all') list = list.filter(m => m.role === roleFilter)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
      )
    }
    return list
  }, [members, query, roleFilter])

  return (
    <div className="membros-tab">
      <div className="membros-tab__toolbar">
        <label className="membros-tab__search">
          <LuSearch size={14} />
          <input
            type="search"
            placeholder="Buscar por nome ou e-mail..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </label>

        <select
          className="membros-tab__role-filter"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="all">Todos os papéis</option>
          {ROLE_ORDER.map(id => (
            <option key={id} value={id}>{ROLES[id].label}</option>
          ))}
        </select>

        <button type="button" className="membros-tab__invite" onClick={onInviteClick}>
          <LuUserPlus size={14} /> Convidar membro
        </button>
      </div>

      <div className="membros-tab__list">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className="membros-tab__empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p>
                {members.length === 0
                  ? 'Ainda não tem ninguém aqui. Bora convidar a galera?'
                  : `Nenhum membro encontrado${query ? ` para "${query}"` : ''}.`}
              </p>
              {members.length === 0 && (
                <button type="button" className="membros-tab__empty-cta" onClick={onInviteClick}>
                  <LuUserPlus size={14} /> Convidar primeiro membro
                </button>
              )}
            </motion.div>
          ) : (
            filtered.map((m, i) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i * 0.04, 0.3), duration: 0.3 } }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
              >
                <MemberRow
                  member={m}
                  isMe={m.id === currentUserId}
                  onRoleChange={onRoleChange}
                  onRemove={onRemove}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
