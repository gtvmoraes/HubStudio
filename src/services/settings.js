// Mock de configurações. Quando o backend chegar, substituir o corpo das
// funções — os contratos de retorno não mudam (padrão dos demais services).

// ─── Sessões ativas ───
export const getSessions = () => Promise.resolve([
  { id: 1, device: 'Windows · Chrome',   location: 'São Paulo, BR',      lastActive: 'Agora',        current: true  },
  { id: 2, device: 'iPhone 15 · Safari', location: 'São Paulo, BR',      lastActive: 'há 3 horas',   current: false },
  { id: 3, device: 'MacBook · Firefox',  location: 'Rio de Janeiro, BR', lastActive: 'há 2 dias',    current: false },
])

// ─── Histórico de faturas ───
export const getInvoices = () => Promise.resolve([
  { id: 'INV-2026-006', date: '01 jun 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
  { id: 'INV-2026-005', date: '01 mai 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
  { id: 'INV-2026-004', date: '01 abr 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
  { id: 'INV-2026-003', date: '01 mar 2026', amount: 'R$ 39,90', status: 'paga',     plan: 'Pro · Mensal' },
])

// ─── Uso do plano ───
export const getUsage = () => Promise.resolve({
  profiles: { used: 6,  total: 10 },
  posts:    { used: 142, total: null },   // null = ilimitado
  storage:  { used: 3.2, total: 10, unit: 'GB' },
})
