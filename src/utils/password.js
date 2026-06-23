// Calcula a força da senha (0–4) e retorna o label correspondente.
// 1 ponto para cada critério: 8+ chars, maiúscula+minúscula, número, caractere especial.
export function calcStrength(pwd) {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return Math.min(score, 4)
}

export const STRENGTH_LABELS = ['', 'Fraca', 'Média', 'Boa', 'Forte']
