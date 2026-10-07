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

// Padrões de cada cargo — o que vale de fato é a matriz da equipe (GET
// /teams/{id}/permissions, exposta pelo TeamContext via can()). Isto aqui é só
// o fallback enquanto ela carrega.
export const PERMISSION_MATRIX = {
  admin:    { createPost: true,  scheduleDirectly: true,  approve: true,  manageMembers: true,  viewAnalytics: true, accountSettings: true,  billing: true  },
  manager:  { createPost: true,  scheduleDirectly: true,  approve: true,  manageMembers: true,  viewAnalytics: true, accountSettings: false, billing: false },
  editor:   { createPost: true,  scheduleDirectly: false, approve: false, manageMembers: false, viewAnalytics: true, accountSettings: false, billing: false },
  reviewer: { createPost: false, scheduleDirectly: false, approve: true,  manageMembers: false, viewAnalytics: true, accountSettings: false, billing: false },
  viewer:   { createPost: false, scheduleDirectly: false, approve: false, manageMembers: false, viewAnalytics: true, accountSettings: false, billing: false },
}

// Mesma hierarquia do backend (TeamService.rank): Editor e Revisor no mesmo nível.
export const ROLE_RANK = { admin: 4, manager: 3, editor: 2, reviewer: 2, viewer: 1 }

// Ninguém atribui cargo acima do próprio; Admin só por outro Admin.
export const canGrantRole = (actorRole, role) =>
  ROLE_RANK[role] <= ROLE_RANK[actorRole] && (role !== 'admin' || actorRole === 'admin')

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

// O backend devolve { message } nas regras de negócio (ex: "Você não pode
// remover um membro com cargo acima do seu") — repassa isso em vez de um genérico.
const failWith = async (res, fallback) => {
  const body = await res.json().catch(() => ({}))
  throw new Error(body.message || fallback)
}

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
  const res = await authFetch(`/teams/${teamId}`, { method: 'DELETE' })
  if (!res.ok) await failWith(res, 'Erro ao excluir equipe')
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
  if (!res.ok) await failWith(res, 'Erro ao alterar cargo')
  return res.json()
}

export const removeMemberApi = async (teamId, memberId) => {
  const res = await authFetch(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
  if (!res.ok) await failWith(res, 'Erro ao remover membro')
}

export const leaveTeamApi = async (teamId) => {
  const res = await authFetch(`/teams/${teamId}/leave`, { method: 'POST' })
  if (!res.ok) await failWith(res, 'Erro ao sair da equipe')
}

export const getPermissionMatrix = async (teamId) => {
  const res = await authFetch(`/teams/${teamId}/permissions`)
  if (!res.ok) return null
  return res.json()
}

export const updatePermissionMatrixApi = async (teamId, matrix) => {
  const res = await authFetch(`/teams/${teamId}/permissions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matrix }),
  })
  if (!res.ok) await failWith(res, 'Erro ao salvar permissões')
  return res.json()
}

export const importAccountsApi = async (teamId, socialAccountIds) => {
  const res = await authFetch(`/teams/${teamId}/accounts/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ socialAccountIds }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Erro ao importar contas.')
  }
  return res.json()
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
