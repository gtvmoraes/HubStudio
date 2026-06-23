import { ROLES } from '../../../../services/team'

export default function RoleBadge({ role, size = 'md' }) {
  const meta = ROLES[role]
  if (!meta) return null
  return (
    <span
      className={`role-badge role-badge--${size}`}
      style={{ color: meta.color, borderColor: meta.color }}
    >
      <i className="role-badge__dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  )
}
