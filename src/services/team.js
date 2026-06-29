import { authFetch } from './api'

// ── Constantes de UI (não vêm da API) ─────────────────────────────────────────

export const ROLES = {
  admin:    { id: 'admin',    label: 'Admin',         color: '#DC2626', description: 'Controle total. Inclui financeiro e configurações da conta.' },
  manager:  { id: 'manager',  label: 'Gerente',       color: '#4F35E8', description: 'Aprova posts, gerencia equipe e vê analytics completo.' },
  editor:   { id: 'editor',   label: 'Editor',        color: '#0EA5E9', description: 'Cria e agenda posts (sujeito a aprovação).' },
  reviewer: { id: 'reviewer', label: 'Revisor',       color: '#F59E0B', description: 'Aprova/comenta nos posts, mas não cria.' },
  viewer:   { id: 'viewer',   label: 'Visualizador',  color: '#6B7280', description: 'Read-only — vê analytics e calendário, não interage.' },
}

export const ROLE_ORDER = ['admin', 'manager', 'editor', 'reviewer', 'viewer']

export const PERMISSIONS = [
  { key: 'createPost',        label: 'Criar posts' },
  { key: 'scheduleDirectly',  label: 'Agendar sem aprovação' },
  { key: 'approve',           label: 'Aprovar/rejeitar' },
  { key: 'manageMembers',     label: 'Gerenciar membros' },
  { key: 'viewAnalytics',     label: 'Ver analytics' },
  { key: 'accountSettings',   label: 'Configurações da conta' },
  { key: 'billing',           label: 'Pagamentos e plano' },
]

export const PERMISSION_MATRIX = {
  admin:    { createPost: true,  scheduleDirectly: true,  approve: true,  manageMembers: true,  viewAnalytics: true, accountSettings: true,  billing: true  },
  manager:  { createPost: true,  scheduleDirectly: true,  approve: true,  manageMembers: true,  viewAnalytics: true, accountSettings: false, billing: false },
  editor:   { createPost: true,  scheduleDirectly: false, approve: false, manageMembers: false, viewAnalytics: true, accountSettings: false, billing: false },
  reviewer: { createPost: false, scheduleDirectly: false, approve: true,  manageMembers: false, viewAnalytics: true, accountSettings: false, billing: false },
  viewer:   { createPost: false, scheduleDirectly: false, approve: false, manageMembers: false, viewAnalytics: true, accountSettings: false, billing: false },
}

export const PLAN_LIMITS = {
  lite:  { label: 'Lite',  maxUsers: 1,        allowsApproval: false },
  pro:   { label: 'Pro',   maxUsers: 5,        allowsApproval: false },
  elite: { label: 'Elite', maxUsers: Infinity, allowsApproval: true  },
}

export const TEAM_COLORS = [
  { id: 'purple', value: '#4F35E8' },
  { id: 'pink',   value: '#E1306C' },
  { id: 'blue',   value: '#0A66C2' },
  { id: 'green',  value: '#10B981' },
  { id: 'orange', value: '#F59E0B' },
  { id: 'red',    value: '#EF4444' },
]

export const TEAM_TYPES = [
  { id: 'personal', label: 'Pessoal', desc: 'Só eu uso, sem outros membros.' },
  { id: 'agency',   label: 'Agência', desc: 'Gerencio várias marcas e clientes.' },
  { id: 'brand',    label: 'Marca',   desc: 'Uma empresa, vários funcionários.' },
]

// ── API ────────────────────────────────────────────────────────────────────────

export const getUserTeams = async () => {
  const res = await authFetch('/teams')
  if (!res.ok) return []
  return res.json()
}

export const createTeamApi = async (data) => {
  const res = await authFetch('/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao criar equipe')
  return res.json()
}

export const updateTeamApi = async (teamId, data) => {
  const res = await authFetch(`/teams/${teamId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Erro ao atualizar equipe')
  return res.json()
}

export const deleteTeamApi = async (teamId) => {
  await authFetch(`/teams/${teamId}`, { method: 'DELETE' })
}

export const joinByCodeApi = async (code) => {
  const res = await authFetch(`/teams/join/${code}`, { method: 'POST' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Código inválido ou equipe não encontrada.')
  }
  return res.json()
}

export const getTeamMembers = async (teamId) => {
  const res = await authFetch(`/teams/${teamId}/members`)
  if (!res.ok) return []
  return res.json()
}

export const getApprovalConfig = async (teamId) => {
  const res = await authFetch(`/teams/${teamId}/approval-config`)
  if (!res.ok) return null
  return res.json()
}

export const getTeamActivity = async (teamId) => {
  const res = await authFetch(`/teams/${teamId}/activity`)
  if (!res.ok) return []
  return res.json()
}

export const changeRoleApi = async (teamId, memberId, role) => {
  const res = await authFetch(`/teams/${teamId}/members/${memberId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Erro ao alterar cargo')
  return res.json()
}

export const removeMemberApi = async (teamId, memberId) => {
  await authFetch(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
}

export const updateApprovalConfigApi = async (teamId, config) => {
  const res = await authFetch(`/teams/${teamId}/approval-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  if (!res.ok) throw new Error('Erro ao salvar configuração')
  return res.json()
}
