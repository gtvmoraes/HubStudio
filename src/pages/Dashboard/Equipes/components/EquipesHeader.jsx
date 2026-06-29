import { motion } from 'framer-motion'
import { LuUsers, LuMail, LuClock, LuCrown } from 'react-icons/lu'
import { PLAN_LIMITS } from '../../../../services/team'
import TeamSwitcher from './TeamSwitcher'

const statVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.1 + i * 0.07, duration: 0.35 },
  }),
}

export default function EquipesHeader({ team, members, invites, pendingPosts, onCreateTeam }) {
  if (!team) return null

  const planMeta = PLAN_LIMITS[team.plan] ?? PLAN_LIMITS.lite
  const usedSlots = members.length
  const isUnlimited = planMeta.maxUsers === Infinity

  return (
    <motion.div
      className="eq-header"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="eq-header__top">
        <div className="eq-header__title">
          <TeamSwitcher onCreateClick={onCreateTeam} />
        </div>
        <motion.span
          className="eq-header__plan"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <LuCrown size={13} />
          Plano {planMeta.label}
        </motion.span>
      </div>

      <div className="eq-header__stats">
        {[
          { Icon: LuUsers, color: 'var(--color-primary)', value: `${usedSlots}${!isUnlimited ? ` / ${planMeta.maxUsers}` : ''}`, label: 'Membros' },
          { Icon: LuMail,  color: 'var(--color-warning)', value: invites.length, label: 'Convites pendentes' },
          { Icon: LuClock, color: 'var(--color-success)', value: pendingPosts,  label: 'Posts aguardando' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="eq-stat"
            custom={i}
            initial="hidden"
            animate="visible"
            variants={statVariants}
          >
            <span className="eq-stat__icon" style={{ color: stat.color }}>
              <stat.Icon size={16} />
            </span>
            <div className="eq-stat__body">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {!isUnlimited && usedSlots > 0 && usedSlots / planMeta.maxUsers >= 0.66 && (
        <motion.div
          className="eq-header__limit"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
        >
          <strong>
            {usedSlots >= planMeta.maxUsers
              ? `Você atingiu o limite de membros do plano ${planMeta.label}.`
              : `Restam ${planMeta.maxUsers - usedSlots} ${planMeta.maxUsers - usedSlots === 1 ? 'vaga' : 'vagas'} no plano ${planMeta.label}.`}
          </strong>
          <span>Faça upgrade pra Elite e tenha membros ilimitados.</span>
          <button type="button">Ver planos</button>
        </motion.div>
      )}
    </motion.div>
  )
}
