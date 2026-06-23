// Extrai as iniciais (até 2) de um nome completo. Ex.: "Breno Dantas" → "BD".
export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
