import { motion } from 'framer-motion'
import {
  LuUsers, LuShieldCheck, LuCheck, LuActivity, LuSettings,
} from 'react-icons/lu'
import { PERMISSION_MATRIX } from '../../../../services/team'

const ALL_TABS = [
  { id: 'membros',       label: 'Membros',       Icon: LuUsers },
  { id: 'papeis',        label: 'Papéis',        Icon: LuShieldCheck },
  { id: 'aprovacao',     label: 'Aprovação',     Icon: LuCheck },
  { id: 'atividade',     label: 'Atividade',     Icon: LuActivity },
  { id: 'configuracoes', label: 'Configurações', Icon: LuSettings, gate: 'accountSettings' },
]

export default function EquipesTabs({ active, onChange, counts = {}, currentRole }) {
  const tabs = ALL_TABS.filter(t => !t.gate || PERMISSION_MATRIX[currentRole]?.[t.gate])

  return (
    <div className="eq-tabs" role="tablist">
      {tabs.map(tab => {
        const Icon = tab.Icon
        const count = counts[tab.countKey] || 0
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`eq-tabs__tab${isActive ? ' eq-tabs__tab--active' : ''}${tab.warn && count > 0 ? ' eq-tabs__tab--warn' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <Icon size={15} />
            {tab.label}
            {count > 0 && <span className="eq-tabs__count">{count}</span>}
            {isActive && (
              <motion.span
                layoutId="eq-tabs-underline"
                className="eq-tabs__underline"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
