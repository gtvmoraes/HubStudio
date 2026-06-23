import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuChevronDown, LuCheck, LuPlus } from 'react-icons/lu'
import { useTeam } from '../../../../contexts/TeamContext'
import { ROLES } from '../../../../services/team'

const initial = (name) => name?.charAt(0).toUpperCase() || '?'

function TeamAvatar({ team, size = 'md' }) {
  const klass = `team-switcher__avatar${size === 'sm' ? ' team-switcher__avatar--sm' : ''}`
  if (team.photo) {
    return (
      <div className={klass} style={{ background: 'transparent' }}>
        <img src={team.photo} alt="" />
      </div>
    )
  }
  return (
    <div className={klass} style={{ background: team.color }}>
      {initial(team.name)}
    </div>
  )
}

export default function TeamSwitcher({ onCreateClick }) {
  const { teams, currentTeam, switchTeam } = useTeam()
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

  if (!currentTeam) return null

  return (
    <div className="team-switcher" ref={ref}>
      <button
        type="button"
        className="team-switcher__trigger"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <TeamAvatar team={currentTeam} />
        <div className="team-switcher__info">
          <strong>{currentTeam.name}</strong>
          <span>{ROLES[currentTeam.role]?.label || currentTeam.role} · Plano {currentTeam.plan}</span>
        </div>
        <LuChevronDown
          size={16}
          className={`team-switcher__chev${open ? ' team-switcher__chev--open' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="team-switcher__menu"
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            <div className="team-switcher__menu-head">Seus times</div>

            <div className="team-switcher__list">
              {teams.map((team, i) => {
                const isActive = team.id === currentTeam.id
                return (
                  <motion.button
                    key={team.id}
                    type="button"
                    className={`team-switcher__item${isActive ? ' team-switcher__item--active' : ''}`}
                    onClick={() => { switchTeam(team.id); setOpen(false) }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                  >
                    <TeamAvatar team={team} size="sm" />
                    <div className="team-switcher__item-info">
                      <strong>{team.name}</strong>
                      <span>{ROLES[team.role]?.label} · {team.totalMembers} {team.totalMembers === 1 ? 'membro' : 'membros'}</span>
                    </div>
                    {isActive && <LuCheck size={14} className="team-switcher__check" />}
                  </motion.button>
                )
              })}
            </div>

            <div className="team-switcher__divider" />

            <button
              type="button"
              className="team-switcher__action"
              onClick={() => { setOpen(false); onCreateClick() }}
            >
              <LuPlus size={14} /> Criar nova equipe
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
