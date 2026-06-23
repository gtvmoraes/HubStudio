import { LuTicket, LuPlus, LuChevronRight } from 'react-icons/lu'

const STATUS_META = {
  aberto:    { label: 'Aberto',       cls: 'open'  },
  andamento: { label: 'Em andamento', cls: 'prog'  },
  resolvido: { label: 'Resolvido',    cls: 'done'  },
}

const PRIORITY_META = {
  alta:  { label: 'Alta',  cls: 'high' },
  media: { label: 'Média', cls: 'mid'  },
  baixa: { label: 'Baixa', cls: 'low'  },
}

export default function MyTickets({ tickets = [], onNewTicket }) {
  return (
    <div className="sup-tickets chart-card">
      <div className="sup-section-head sup-section-head--row">
        <div>
          <h3><LuTicket size={18} /> Meus chamados</h3>
          <span className="sup-section-head__sub">Acompanhe suas solicitações de suporte</span>
        </div>
        <button type="button" className="sup-tickets__new" onClick={onNewTicket}>
          <LuPlus size={15} /> Abrir chamado
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="sup-tickets__empty">
          <LuTicket size={28} />
          <p>Você ainda não abriu nenhum chamado.</p>
          <button type="button" className="sup-tickets__new" onClick={onNewTicket}>
            <LuPlus size={15} /> Abrir o primeiro
          </button>
        </div>
      ) : (
        <ul className="sup-tickets__list">
          {tickets.map(t => {
            const st = STATUS_META[t.status] ?? STATUS_META.aberto
            const pr = PRIORITY_META[t.priority] ?? PRIORITY_META.media
            return (
              <li key={t.id} className="sup-ticket">
                <span className="sup-ticket__id">#{t.id}</span>
                <div className="sup-ticket__main">
                  <span className="sup-ticket__subject">{t.subject}</span>
                  <div className="sup-ticket__tags">
                    <span className="sup-ticket__cat">{t.category}</span>
                    <span className={`sup-ticket__priority sup-ticket__priority--${pr.cls}`}>{pr.label}</span>
                  </div>
                </div>
                <div className="sup-ticket__meta">
                  <span className={`sup-ticket__status sup-ticket__status--${st.cls}`}>{st.label}</span>
                  <span className="sup-ticket__date">{t.updatedAt}</span>
                </div>
                <LuChevronRight size={16} className="sup-ticket__chevron" />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
