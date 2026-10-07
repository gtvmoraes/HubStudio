import { useState, useEffect, useRef } from 'react'
import { LuEllipsisVertical, LuUserMinus, LuShield, LuMail } from 'react-icons/lu'
import { getInitials } from '../../../../utils/string'
import { timeAgo } from '../../../../utils/date'
import RolePicker from './RolePicker'
import { ROLE_RANK } from '../../../../services/team'

export default function MemberRow({ member, isMe, currentRole, canManage, onRoleChange, onRemove }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  // Mesmas regras do backend: só Admin troca cargo (nunca o próprio); remover
  // exige "Gerenciar membros" e não vale pra quem tem cargo acima do seu.
  const canChangeRole = !isMe && currentRole === 'admin'
  const canRemove = !isMe && canManage
    && ROLE_RANK[member.role] <= ROLE_RANK[currentRole]
    && (member.role !== 'admin' || currentRole === 'admin')

  return (
    <div className={`member-row${isMe ? ' member-row--me' : ''}`}>
      <div className="member-row__avatar">
        {getInitials(member.name)}
      </div>

      <div className="member-row__info">
        <div className="member-row__name">
          {member.name}
          {isMe && <span className="member-row__you">você</span>}
        </div>
        <span className="member-row__email">{member.email}</span>
      </div>

      <div className="member-row__role">
        <RolePicker
          value={member.role}
          onChange={(newRole) => onRoleChange(member.id, newRole)}
          disabled={!canChangeRole}
        />
      </div>

      <div className="member-row__last">
        {(() => {
          const ago = timeAgo(member.lastSeenAt)
          if (!ago) return <span className="member-row__last--unknown">—</span>
          return <>Visto {ago === 'agora' ? 'agora' : `há ${ago}`}</>
        })()}
      </div>

      <div className="member-row__menu" ref={ref}>
        <button
          type="button"
          className="member-row__menu-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Opções"
        >
          <LuEllipsisVertical size={16} />
        </button>
        {menuOpen && (
          <div className="member-row__dropdown" role="menu">
            <button type="button" onClick={() => setMenuOpen(false)}>
              <LuShield size={14} /> Ver perfil
            </button>
            <button type="button" onClick={() => setMenuOpen(false)}>
              <LuMail size={14} /> Enviar mensagem
            </button>
            {canRemove && (
              <button
                type="button"
                className="member-row__danger"
                onClick={() => { setMenuOpen(false); onRemove(member.id) }}
              >
                <LuUserMinus size={14} /> Remover do time
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
