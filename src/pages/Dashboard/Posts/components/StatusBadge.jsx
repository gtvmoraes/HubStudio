import { STATUS_META } from '../../../../services/posts'

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status]
  if (!meta) return null
  return (
    <span className={`status-badge status-badge--${status}`}>
      <i className="status-badge__dot" style={{ background: meta.color }} />
      {meta.label}
    </span>
  )
}
