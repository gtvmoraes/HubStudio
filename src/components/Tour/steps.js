// ═══════════════════════════════════════════════════════════════
// Roteiro do tour guiado — 100% declarativo.
//
// Cada passo:
//   id        identificador único (usado pra retomar após reload)
//   chapter   a que ato pertence (agrupa a barra de progresso)
//   route     se presente, o tour navega pra cá antes de mostrar
//   anchor    valor do data-tour do alvo (sem âncora = card central)
//   title/body texto
//   placement 'top' | 'bottom' | 'left' | 'right' (default: bottom)
//   optional  true = pula sozinho se o elemento não existir na tela
//   waitFor   'click' = não avança sozinho; espera o usuário clicar no alvo
//   action    botão extra que leva a algum lugar e encerra o tour
// ═══════════════════════════════════════════════════════════════

export const CHAPTERS = [
  { id: 'intro',     label: 'Boas-vindas' },
  { id: 'sidebar',   label: 'Navegação'   },
  { id: 'dashboard', label: 'Dashboard'   },
  { id: 'redes',     label: 'Suas redes'  },
  { id: 'composer',  label: 'Criar post'  },
  { id: 'equipes',   label: 'Equipes'     },
  { id: 'fim',       label: 'Pronto'      },
]

export const STEPS = [
  // ── Ato 0 — Abertura ───────────────────────────────────────
  {
    id: 'welcome',
    chapter: 'intro',
    route: '/dashboard',
    title: 'Bem-vindo ao HubStudio',
    body: 'Vou te mostrar o essencial em menos de 2 minutos, passando por cada tela e apontando onde fica cada coisa. Pode pular a qualquer momento.',
  },

  // ── Ato 1 — Orientação (Sidebar) ───────────────────────────
  {
    id: 'context',
    chapter: 'sidebar',
    route: '/dashboard',
    anchor: 'sidebar-context',
    placement: 'right',
    title: 'Pessoal ou equipe',
    body: 'Este seletor controla tudo o que você vê. Suas contas pessoais ficam separadas das contas de cada equipe: conectar redes, postar e ver métricas sempre usa o contexto escolhido aqui.',
  },
  {
    id: 'nav',
    chapter: 'sidebar',
    anchor: 'sidebar-nav',
    placement: 'right',
    title: 'Suas três áreas',
    body: 'Dashboard mostra os números. Posts é onde você cria e agenda. Equipes é onde você convida gente pra trabalhar junto.',
  },
  {
    id: 'search',
    chapter: 'sidebar',
    anchor: 'sidebar-search',
    placement: 'right',
    title: 'Busca global',
    body: 'Aperte Ctrl + K de qualquer lugar pra achar páginas, configurações e suas publicações. É o atalho mais rápido do sistema.',
  },
  {
    id: 'theme',
    chapter: 'sidebar',
    anchor: 'sidebar-theme',
    placement: 'right',
    title: 'Claro ou escuro',
    body: 'Troque o tema quando quiser. Sua escolha fica salva neste navegador.',
  },

  // ── Ato 2 — O Dashboard ────────────────────────────────────
  {
    id: 'filters',
    chapter: 'dashboard',
    route: '/dashboard',
    anchor: 'dash-filters',
    placement: 'bottom',
    title: 'Filtros de período e rede',
    body: 'Tudo no dashboard responde a estes dois filtros. Escolha o intervalo e, se quiser, isole uma rede específica pra ver só os números dela.',
  },
  {
    id: 'kpis',
    chapter: 'dashboard',
    anchor: 'block-kpis',
    placement: 'bottom',
    optional: true,
    title: 'Seus números principais',
    body: 'Visualizações, curtidas e comentários somados das redes conectadas. Eles contam as publicações feitas pelo HubStudio, por isso começam zerados numa conta nova.',
  },
  {
    id: 'followers',
    chapter: 'dashboard',
    anchor: 'block-followersTotal',
    placement: 'bottom',
    optional: true,
    title: 'Seguidores',
    body: 'A soma de seguidores das redes conectadas, com quanto você ganhou nos últimos 7 e 30 dias. Filtrando por uma rede, ele detalha só aquela.',
  },
  {
    id: 'engagement',
    chapter: 'dashboard',
    anchor: 'block-charts',
    placement: 'top',
    optional: true,
    title: 'Engajamento ao longo do tempo',
    body: 'Clique nos cartões de métrica pra alternar entre visualizações, curtidas e comentários: o gráfico troca junto. Dá pra ver por dia, semana ou mês.',
  },
  {
    id: 'insights',
    chapter: 'dashboard',
    anchor: 'block-insights',
    placement: 'bottom',
    optional: true,
    title: 'Insights da IA',
    body: 'Leituras automáticas do seu desempenho: qual formato rende mais, onde você cresceu e qual o melhor horário pra postar.',
  },
  {
    id: 'customize',
    chapter: 'dashboard',
    anchor: 'dash-toolbar',
    placement: 'bottom',
    title: 'Monte o dashboard do seu jeito',
    body: 'Em Personalizar você arrasta os cartões como peças de Lego e monta a ordem que fizer sentido. A gente guarda do jeito que você deixar.',
  },

  // ── Ato 3 — Conectar redes (momento-chave) ─────────────────
  {
    id: 'redes',
    chapter: 'redes',
    route: '/dashboard/configuracoes?tab=redes',
    anchor: 'redes-grid',
    placement: 'top',
    title: 'O passo mais importante',
    body: 'Aqui você vincula Instagram, TikTok, YouTube, Facebook, LinkedIn e X. Sem pelo menos uma rede conectada não há o que agendar, nem métrica pra mostrar.',
    action: { label: 'Conectar uma rede agora', to: '/dashboard/configuracoes?tab=redes' },
  },

  // ── Ato 4 — Criar um post ──────────────────────────────────
  {
    id: 'composer-networks',
    chapter: 'composer',
    route: '/dashboard/posts/novo',
    anchor: 'composer-networks',
    placement: 'bottom',
    waitFor: 'click',
    title: 'Escolha as redes',
    body: 'Selecione uma ou várias: o mesmo post vai pra todas de uma vez. Clique numa rede aqui pra continuar.',
  },
  {
    id: 'composer-ai',
    chapter: 'composer',
    anchor: 'composer-ai',
    placement: 'bottom',
    optional: true,
    title: 'Deixe a IA escrever',
    body: 'Gerar legenda abre um campo pra você descrever a ideia e a IA escreve no formato ideal da rede. Hashtags sugere as tags certas pro seu conteúdo.',
  },
  {
    id: 'composer-preview',
    chapter: 'composer',
    anchor: 'composer-preview',
    placement: 'left',
    optional: true,
    title: 'Preview real',
    body: 'Este celular mostra exatamente como o post vai aparecer em cada rede, atualizando enquanto você digita.',
  },
  {
    id: 'composer-schedule',
    chapter: 'composer',
    anchor: 'composer-schedule',
    placement: 'top',
    optional: true,
    title: 'Publique agora ou agende',
    body: 'Escolha data e hora e o sistema publica sozinho no momento certo. Deixando em branco, o post sai na hora.',
  },

  // ── Ato 5 — Equipes ────────────────────────────────────────
  {
    id: 'equipes',
    chapter: 'equipes',
    route: '/dashboard/equipes',
    anchor: 'equipes-header',
    placement: 'bottom',
    optional: true,
    title: 'Trabalhe em equipe',
    body: 'Crie uma equipe ou entre em uma com código de convite. Cada membro ganha um papel com permissões próprias, e você pode exigir aprovação antes de publicar.',
  },

  // ── Encerramento ───────────────────────────────────────────
  {
    id: 'done',
    chapter: 'fim',
    route: '/dashboard',
    title: 'Tudo pronto',
    body: 'É isso! Você pode rever este tour quando quiser pelo botão Refazer tour, em Suporte ou em Configurações → Aparência.',
    finale: true,
  },
]

// Chaves de localStorage usadas pelo tour
export const TOUR_KEYS = {
  legacyFlag: 'hs-show-onboarding', // setada no cadastro (AuthContext)
  progress:   'hs-tour-step',       // id do passo, pra retomar após reload
  completed:  'hs-tour-done',       // '1' quando concluiu ou pulou
}
