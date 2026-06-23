/**
 * Mocks de equipe — membros, convites, atividade, configurações.
 * Estrutura espelhando o que o backend devolveria.
 *
 * Tudo aqui é escopado por teamId. Quando uma equipe nova é criada,
 * `initTeamData(teamId, founder)` registra dados vazios pra ela
 * (só com o fundador como membro).
 */

export const ROLES = {
  admin: {
    id: 'admin',
    label: 'Admin',
    color: '#DC2626',
    description: 'Controle total. Inclui financeiro e configurações da conta.',
  },
  manager: {
    id: 'manager',
    label: 'Gerente',
    color: '#4F35E8',
    description: 'Aprova posts, gerencia equipe e vê analytics completo.',
  },
  editor: {
    id: 'editor',
    label: 'Editor',
    color: '#0EA5E9',
    description: 'Cria e agenda posts (sujeito a aprovação).',
  },
  reviewer: {
    id: 'reviewer',
    label: 'Revisor',
    color: '#F59E0B',
    description: 'Aprova/comenta nos posts, mas não cria.',
  },
  viewer: {
    id: 'viewer',
    label: 'Visualizador',
    color: '#6B7280',
    description: 'Read-only — vê analytics e calendário, não interage.',
  },
}

export const ROLE_ORDER = ['admin', 'manager', 'editor', 'reviewer', 'viewer']

// Matriz de permissões — qual papel pode fazer o quê
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

// Limites por plano
export const PLAN_LIMITS = {
  lite:  { label: 'Lite',  maxUsers: 1,        allowsApproval: false },
  pro:   { label: 'Pro',   maxUsers: 5,        allowsApproval: false },
  elite: { label: 'Elite', maxUsers: Infinity, allowsApproval: true  },
}

// ── Cores disponíveis pros avatares de times ──
export const TEAM_COLORS = [
  { id: 'purple', value: '#4F35E8' },
  { id: 'pink',   value: '#E1306C' },
  { id: 'blue',   value: '#0A66C2' },
  { id: 'green',  value: '#10B981' },
  { id: 'orange', value: '#F59E0B' },
  { id: 'red',    value: '#EF4444' },
]

// Tipos de time — o componente decide qual ícone renderizar a partir do id.
export const TEAM_TYPES = [
  { id: 'personal', label: 'Pessoal', desc: 'Só eu uso, sem outros membros.' },
  { id: 'agency',   label: 'Agência', desc: 'Gerencio várias marcas e clientes.' },
  { id: 'brand',    label: 'Marca',   desc: 'Uma empresa, vários funcionários.' },
]

// ── Times que o usuário atual faz parte ──
const USER_TEAMS = [
  {
    id: 't1',
    name: 'HubStudio Team',
    type: 'agency',
    color: '#4F35E8',
    plan: 'elite',
    role: 'admin',
    totalMembers: 7,
    pendingPosts: 1,
    photo: null,
    description: 'Nosso time principal — cuida das marcas mais quentes.',
  },
  {
    id: 't2',
    name: 'Marketing Studio',
    type: 'agency',
    color: '#E1306C',
    plan: 'pro',
    role: 'manager',
    totalMembers: 4,
    pendingPosts: 3,
    photo: null,
    description: '',
  },
  {
    id: 't3',
    name: 'Personal Brand',
    type: 'personal',
    color: '#10B981',
    plan: 'lite',
    role: 'admin',
    totalMembers: 1,
    pendingPosts: 0,
    photo: null,
    description: '',
  },
]

export const getUserTeams = () => Promise.resolve(USER_TEAMS)

// ════════════════════════════════════════════════════════════
// Dados escopados por equipe
// ════════════════════════════════════════════════════════════

const defaultConfig = () => ({
  requireApprovalFromEditors: false,
  requireDoubleApprovalAbove100k: false,
  autoApproveScheduled48h: false,
  notifyManagersAfter24h: false,
  defaultApproverIds: [],
})

const TEAM_DATA = {
  // ── HubStudio Team (t1) ──
  t1: {
    members: [
      { id: 'u1', name: 'Breno Dantas',  email: 'breno.dantas.pc@gmail.com', role: 'admin',    joinedAt: '2026-01-12T10:00:00', lastActive: 'agora' },
      { id: 'u2', name: 'Maria Costa',   email: 'maria@hubstudio.com',       role: 'manager',  joinedAt: '2026-02-04T14:20:00', lastActive: '2h' },
      { id: 'u3', name: 'Carlos Souza',  email: 'carlos@hubstudio.com',      role: 'manager',  joinedAt: '2026-02-18T09:30:00', lastActive: '5h' },
      { id: 'u4', name: 'João Silva',    email: 'joao@hubstudio.com',        role: 'editor',   joinedAt: '2026-03-22T16:45:00', lastActive: 'agora' },
      { id: 'u5', name: 'Lucas Santos',  email: 'lucas@hubstudio.com',       role: 'editor',   joinedAt: '2026-04-01T11:15:00', lastActive: '1d' },
      { id: 'u6', name: 'Ana Beatriz',   email: 'ana@hubstudio.com',         role: 'reviewer', joinedAt: '2026-04-10T08:00:00', lastActive: '3d' },
      { id: 'u7', name: 'Pedro Henrique',email: 'pedro@cliente.com',         role: 'viewer',   joinedAt: '2026-04-25T15:20:00', lastActive: '1sem' },
    ],
    invites: [
      { id: 'i1', email: 'estagiario@empresa.com', role: 'editor', invitedBy: 'Breno Dantas', invitedAt: '2026-05-26T16:30:00' },
      { id: 'i2', email: 'cliente.novo@gmail.com', role: 'viewer', invitedBy: 'Maria Costa',  invitedAt: '2026-05-25T10:15:00' },
    ],
    config: {
      requireApprovalFromEditors: true,
      requireDoubleApprovalAbove100k: false,
      autoApproveScheduled48h: false,
      notifyManagersAfter24h: true,
      defaultApproverIds: ['u2', 'u3'],
    },
    activity: [
      { id: 'a1', type: 'post-approved',  actor: 'Maria Costa',   target: '5 dicas para aumentar seu engajamento', targetUser: 'João Silva', at: '2026-05-28T14:32:00' },
      { id: 'a2', type: 'post-created',   actor: 'João Silva',    target: 'Story de bastidores',                   at: '2026-05-28T11:08:00' },
      { id: 'a3', type: 'member-added',   actor: 'Breno Dantas',  target: 'Carlos Souza',                          extra: { role: 'manager' }, at: '2026-05-28T09:00:00' },
      { id: 'a4', type: 'post-submitted', actor: 'Lucas Santos',  target: 'Promo Black Friday',                    at: '2026-05-27T18:20:00' },
      { id: 'a5', type: 'post-rejected',  actor: 'Maria Costa',   target: 'Texto sobre concorrente',               targetUser: 'Lucas Santos', extra: { reason: 'Evita citar concorrentes diretamente.' }, at: '2026-05-26T15:45:00' },
      { id: 'a6', type: 'post-scheduled', actor: 'Carlos Souza',  target: 'Como criar conteúdo que conecta',       at: '2026-05-26T10:00:00' },
      { id: 'a7', type: 'role-changed',   actor: 'Breno Dantas',  target: 'Ana Beatriz',                           extra: { from: 'editor', to: 'reviewer' }, at: '2026-05-25T14:00:00' },
      { id: 'a8', type: 'config-changed', actor: 'Breno Dantas',  target: 'Fluxo de aprovação',                    extra: { detail: 'Ativada aprovação obrigatória pra Editores' }, at: '2026-05-24T16:30:00' },
      { id: 'a9', type: 'post-published', actor: 'Sistema',       target: 'Seus Reels alcançaram 2x do nada',      at: '2026-05-15T20:00:00' },
    ],
  },

  // ── Marketing Studio (t2) ──
  t2: {
    members: [
      { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com', role: 'manager', joinedAt: '2026-02-10T10:00:00', lastActive: 'agora' },
      { id: 'm1', name: 'Rafaela Mendes', email: 'rafa@marketing.com', role: 'admin',  joinedAt: '2025-11-01T10:00:00', lastActive: 'agora' },
      { id: 'm2', name: 'Tiago Lima',     email: 'tiago@marketing.com', role: 'editor', joinedAt: '2026-01-22T14:00:00', lastActive: '4h' },
      { id: 'm3', name: 'Bruna Alves',    email: 'bruna@marketing.com', role: 'editor', joinedAt: '2026-03-05T09:00:00', lastActive: '1d' },
    ],
    invites: [
      { id: 'mi1', email: 'social@marketing.com', role: 'editor',   invitedBy: 'Rafaela Mendes', invitedAt: '2026-05-27T11:00:00' },
      { id: 'mi2', email: 'analista@marketing.com', role: 'viewer', invitedBy: 'Breno Dantas',   invitedAt: '2026-05-26T14:30:00' },
      { id: 'mi3', email: 'designer@marketing.com', role: 'editor', invitedBy: 'Rafaela Mendes', invitedAt: '2026-05-22T09:00:00' },
    ],
    config: defaultConfig(),
    activity: [
      { id: 'ma1', type: 'post-published', actor: 'Tiago Lima',      target: 'Campanha de outono',          at: '2026-05-28T10:00:00' },
      { id: 'ma2', type: 'post-scheduled', actor: 'Bruna Alves',     target: 'Reels do produto X',          at: '2026-05-27T17:00:00' },
      { id: 'ma3', type: 'member-added',   actor: 'Rafaela Mendes',  target: 'Breno Dantas',                extra: { role: 'manager' }, at: '2026-02-10T10:00:00' },
    ],
  },

  // ── Personal Brand (t3) ──
  t3: {
    members: [
      { id: 'u1', name: 'Breno Dantas', email: 'breno.dantas.pc@gmail.com', role: 'admin', joinedAt: '2026-01-12T10:00:00', lastActive: 'agora' },
    ],
    invites: [],
    config: defaultConfig(),
    activity: [
      { id: 'pa1', type: 'team-created', actor: 'Breno Dantas', target: 'a equipe', at: '2026-01-12T10:00:00' },
    ],
  },
}

/**
 * Registra dados em branco pra uma equipe recém-criada.
 * Idempotente — chamar duas vezes não sobrescreve.
 */
export const initTeamData = (teamId, founder) => {
  if (TEAM_DATA[teamId]) return
  TEAM_DATA[teamId] = {
    members: founder ? [founder] : [],
    invites: [],
    config: defaultConfig(),
    activity: [
      {
        id: `a-init-${teamId}`,
        type: 'team-created',
        actor: founder?.name || 'Você',
        target: 'a equipe',
        at: new Date().toISOString(),
      },
    ],
  }
}

export const getTeamMembers   = (teamId) => Promise.resolve(TEAM_DATA[teamId]?.members  || [])
export const getPendingInvites = (teamId) => Promise.resolve(TEAM_DATA[teamId]?.invites  || [])
export const getApprovalConfig = (teamId) => Promise.resolve(TEAM_DATA[teamId]?.config   || defaultConfig())
export const getTeamActivity   = (teamId) => Promise.resolve(TEAM_DATA[teamId]?.activity || [])

// Time atual (informações detalhadas). Mantido por compatibilidade —
// hoje quem consome esse dado é o TeamContext via getUserTeams().
export const getTeamInfo = (teamId) => {
  const found = USER_TEAMS.find(t => t.id === teamId) || USER_TEAMS[0]
  const data = TEAM_DATA[found.id]
  return Promise.resolve({
    ...found,
    totalMembers: data?.members.length ?? 0,
    pendingInvites: data?.invites.length ?? 0,
  })
}
