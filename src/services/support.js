// Mock de suporte. Quando o backend chegar, substituir o corpo das funções —
// os contratos de retorno não mudam (mesmo padrão dos demais services).

// ─── Base de conhecimento ───
export const getKnowledgeCategories = () => Promise.resolve([
  { id: 'primeiros-passos', icon: 'rocket',   title: 'Primeiros passos',  desc: 'Configure sua conta e conecte suas redes.',        count: 12 },
  { id: 'agendamento',      icon: 'calendar', title: 'Agendamento',       desc: 'Crie, agende e publique em todas as plataformas.',  count: 18 },
  { id: 'analytics',        icon: 'chart',    title: 'Analytics',         desc: 'Entenda suas métricas e relatórios.',               count: 9  },
  { id: 'conta-cobranca',   icon: 'card',     title: 'Conta & Cobrança',  desc: 'Planos, faturas e dados de pagamento.',             count: 14 },
  { id: 'integracoes',      icon: 'plug',     title: 'Integrações',       desc: 'Conecte Instagram, TikTok, YouTube e mais.',        count: 11 },
  { id: 'equipes',          icon: 'users',    title: 'Equipes',           desc: 'Convide membros e gerencie permissões.',            count: 7  },
])

export const getPopularArticles = () => Promise.resolve([
  { id: 1, category: 'Agendamento',     title: 'Como agendar um post para várias redes ao mesmo tempo', views: '4.2K' },
  { id: 2, category: 'Primeiros passos', title: 'Conectando sua conta profissional do Instagram',        views: '3.8K' },
  { id: 3, category: 'Analytics',       title: 'Entendendo o Score da conta e como melhorá-lo',          views: '2.9K' },
  { id: 4, category: 'Conta & Cobrança', title: 'Como alterar ou cancelar meu plano',                    views: '2.4K' },
  { id: 5, category: 'Integrações',     title: 'Por que minha publicação falhou? Erros comuns',          views: '2.1K' },
])

// ─── Status do sistema ───
export const getSystemStatus = () => Promise.resolve({
  overall: 'operational', // operational | degraded | outage
  updatedAt: 'Atualizado há 2 minutos',
  components: [
    { id: 'api',          label: 'API & Núcleo',        status: 'operational' },
    { id: 'scheduling',   label: 'Agendamento',         status: 'operational' },
    { id: 'dashboard',    label: 'Dashboard & Analytics', status: 'operational' },
    { id: 'integrations', label: 'Integrações sociais', status: 'degraded' },
    { id: 'ai',           label: 'IA & Insights',       status: 'operational' },
  ],
})

// ─── Chamados ───
let TICKETS = [
  { id: 1048, subject: 'Falha ao conectar o TikTok',           category: 'Integrações',     priority: 'alta',  status: 'andamento', createdAt: '02 jun', updatedAt: 'há 1h'   },
  { id: 1042, subject: 'Dúvida sobre cobrança do plano anual',  category: 'Conta & Cobrança', priority: 'media', status: 'aberto',    createdAt: '31 mai', updatedAt: 'há 3h'   },
  { id: 1031, subject: 'Relatório de analytics não exportou',   category: 'Analytics',       priority: 'baixa', status: 'resolvido', createdAt: '28 mai', updatedAt: 'há 2 dias' },
]

export const getTickets = () => Promise.resolve([...TICKETS])

export const createTicket = ({ subject, category, priority, description }) => {
  const ticket = {
    id: Math.max(0, ...TICKETS.map(t => t.id)) + 1,
    subject,
    category,
    priority,
    description,
    status: 'aberto',
    createdAt: 'agora',
    updatedAt: 'agora',
  }
  TICKETS = [ticket, ...TICKETS]
  return Promise.resolve(ticket)
}

// ─── FAQ ───
export const getSupportFaqs = () => Promise.resolve([
  { id: 1, q: 'Posso cancelar quando quiser?',                a: 'Sim! Não há fidelidade. Cancele a qualquer momento nas Configurações → Pagamento, sem burocracia ou taxas adicionais.' },
  { id: 2, q: 'Como conecto uma conta profissional do Instagram?', a: 'O agendamento requer conta Profissional (Criador ou Empresa). A conversão é gratuita e leva menos de 1 minuto nas configurações do Instagram.' },
  { id: 3, q: 'Quantas plataformas posso conectar?',          a: 'Lite: até 3 perfis. Pro: até 10. Elite: ilimitado. Suportamos Instagram, TikTok, YouTube, Facebook, LinkedIn e X (Twitter).' },
  { id: 4, q: 'Por que minha publicação falhou?',             a: 'As causas mais comuns são token de integração expirado ou permissões revogadas na rede social. Reconecte a conta em Integrações e tente reagendar.' },
  { id: 5, q: 'Qual o tempo de resposta do suporte?',         a: 'Depende do seu plano: Lite responde por e-mail em até 48h, Pro tem suporte prioritário em até 4h e Elite conta com atendimento 24/7 e gerente dedicado.' },
  { id: 6, q: 'Meus dados estão seguros?',                    a: 'Sim. Usamos criptografia em trânsito e em repouso, e nunca publicamos nada sem sua autorização explícita.' },
])
