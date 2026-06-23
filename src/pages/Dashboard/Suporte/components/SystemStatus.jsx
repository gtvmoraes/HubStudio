import { LuActivity, LuArrowUpRight } from 'react-icons/lu'

const OVERALL_META = {
  operational: { label: 'Todos os sistemas operacionais', cls: 'ok'   },
  degraded:    { label: 'Desempenho degradado',           cls: 'warn' },
  outage:      { label: 'Interrupção em andamento',        cls: 'down' },
}

const COMPONENT_STATUS = {
  operational: { label: 'Operacional',  cls: 'ok'   },
  degraded:    { label: 'Instável',     cls: 'warn' },
  outage:      { label: 'Fora do ar',   cls: 'down' },
}

export default function SystemStatus({ data }) {
  if (!data) return null
  const overall = OVERALL_META[data.overall] ?? OVERALL_META.operational

  return (
    <div className="sup-status chart-card">
      <div className="sup-section-head">
        <h3><LuActivity size={18} /> Status do sistema</h3>
      </div>

      <div className={`sup-status__banner sup-status__banner--${overall.cls}`}>
        <span className="sup-status__pulse" aria-hidden="true" />
        {overall.label}
      </div>

      <ul className="sup-status__list">
        {data.components.map(c => {
          const st = COMPONENT_STATUS[c.status] ?? COMPONENT_STATUS.operational
          return (
            <li key={c.id} className="sup-status__item">
              <span className="sup-status__label">{c.label}</span>
              <span className={`sup-status__tag sup-status__tag--${st.cls}`}>
                <span className="sup-status__dot" aria-hidden="true" />
                {st.label}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="sup-status__footer">
        <span>{data.updatedAt}</span>
        <a href="#" className="sup-status__link" onClick={e => e.preventDefault()}>
          Página de status <LuArrowUpRight size={13} />
        </a>
      </div>
    </div>
  )
}
