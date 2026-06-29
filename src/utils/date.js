/**
 * Retorna uma string legível de tempo relativo ao momento atual.
 * Ex: "agora", "2 minutos", "3 horas", "ontem", "5 dias", "2 meses"
 */
export function timeAgo(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (isNaN(date)) return null

  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60)   return 'agora'
  if (diffMin < 60)   return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`
  if (diffHour < 24)  return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'}`
  if (diffDay === 1)  return 'ontem'
  if (diffDay < 30)   return `${diffDay} dias`
  if (diffMonth < 12) return `${diffMonth} ${diffMonth === 1 ? 'mês' : 'meses'}`
  return `${diffYear} ${diffYear === 1 ? 'ano' : 'anos'}`
}
