// Helpers para exportar dados como CSV no browser (download direto).

const STAT_LABELS = {
  views: 'Total de visualizações',
  likes: 'Total de curtidas',
  comments: 'Total de comentários',
  shares: 'Total de compartilhamentos',
}

function downloadCsv(rows, filename) {
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportDashboardReport(stats, engagement) {
  const rows = [
    ['KPI', 'Valor', 'Variação'],
    ...Object.entries(stats || {}).map(([k, v]) => [STAT_LABELS[k] || k, v.value, v.change]),
    [],
    ['Data', 'Visualizações', 'Curtidas', 'Comentários'],
    ...(engagement || []).map(d => [d.date, d.views, d.likes, d.comments]),
  ]
  downloadCsv(rows, `hubstudio-relatorio-${new Date().toISOString().slice(0, 10)}.csv`)
}
