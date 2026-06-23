// Tabs de filtro por status. "Aguardando aprovação" ganha destaque
// visual quando tem itens (warning). "Falhou" só aparece se houver.
const TABS = [
  { value: 'all',       label: 'Todos' },
  { value: 'draft',     label: 'Rascunhos' },
  { value: 'pending',   label: 'Aguardando aprovação', highlight: true },
  { value: 'scheduled', label: 'Agendados' },
  { value: 'published', label: 'Publicados' },
  { value: 'failed',    label: 'Falhou',  conditional: true },
]

export default function StatusTabs({ active, onChange, counts }) {
  return (
    <div className="status-tabs" role="tablist">
      {TABS.map(tab => {
        const count = counts[tab.value] || 0
        if (tab.conditional && count === 0) return null
        const showHighlight = tab.highlight && count > 0
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active === tab.value}
            className={`status-tabs__tab${active === tab.value ? ' status-tabs__tab--active' : ''}${showHighlight ? ' status-tabs__tab--warn' : ''}`}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {count > 0 && <span className="status-tabs__count">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
