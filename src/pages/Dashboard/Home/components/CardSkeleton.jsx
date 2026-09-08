// Placeholders de carregamento. Ocupam a MESMA altura do conteúdo final pra
// não haver salto de layout quando os dados chegam (convenção: `undefined`
// = carregando, ver DashboardHome).

// Linhas genéricas dentro de um card (usado por listas e blocos de texto).
export function SkeletonLines({ rows = 3, height = 14, gap = 12 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, width: i === rows - 1 ? '65%' : '100%', borderRadius: 8 }}
        />
      ))}
    </div>
  )
}

// Bloco que reserva uma altura fixa (gráficos, donuts, mapas).
export function SkeletonBlock({ height = 180, radius = 12 }) {
  return <div className="skeleton" style={{ height, width: '100%', borderRadius: radius }} />
}

// Item de lista com ícone à esquerda + duas linhas (feed, agendamentos).
export function SkeletonList({ rows = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 11, width: '75%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 9, width: '40%', borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
