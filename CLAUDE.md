# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**HubStudio** — Gerenciador de redes sociais com agendamento de posts, analytics e insights de IA.
Frontend only (React + JavaScript + CSS puro). Backend será integrado por outra equipe.

## Commands

```bash
npm install        # instalar dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173)
npm run build      # build de produção
npm run preview    # preview do build
```

## Stack

- **Vite** + React 18 + JavaScript (sem TypeScript)
- **CSS puro** com variáveis CSS (sem Tailwind, sem CSS Modules)
- **react-router-dom v6** — roteamento
- **framer-motion** — animações e transições
- **recharts** — gráficos (LineChart, PieChart)
- **react-icons** — ícones (Lucide = `Lu*`, FontAwesome = `Fa*`)

## Architecture

### Rotas

Providers, de fora pra dentro: `ThemeProvider` → `AuthProvider` → `TeamProvider` → `ToastProvider` → `BrowserRouter`.

| Rota | Componente | Protegida |
|---|---|---|
| `/` | Landing | não |
| `/entrar` | Login | não |
| `/cadastro` | Cadastro | não |
| `/esqueci-senha` | EsqueciSenha | não |
| `/redefinir-senha` | RedefinirSenha | não |
| `/dashboard` | DashboardHome | sim |
| `/dashboard/posts` | Posts (lista + filtros + ações) | sim |
| `/dashboard/posts/novo` | Composer (criar post) | sim |
| `/dashboard/posts/:id/editar` | Composer (editar post) | sim |
| `/dashboard/equipes` | Equipes (gestão de equipe, 5 abas) | sim |
| `/dashboard/configuracoes` | Configuracoes | sim |
| `/dashboard/suporte` | Suporte (central de ajuda) | sim |
| `/integrations/callback` | IntegrationsCallback (retorno do OAuth) | não |
| `/privacy` | PrivacyPolicy | não |
| `/terms` | TermsOfService | não |
| `/dev/tiktok`, `/dev/tiktok/post`, `/dev/tiktok/metrics` | páginas de teste do TikTok | não |
| `/dev/youtube`, `/dev/youtube/post` | páginas de teste do YouTube | não |

As rotas `/dev/*` são de desenvolvimento, **sem autenticação**, acessadas direto pela URL.
Qualquer rota desconhecida redireciona para `/`.

### Contextos globais

- `AuthContext` — estado de autenticação. Token em `localStorage` (`hs-token`). Exporta `useAuth()`.
- `ThemeContext` — dark/light mode via `data-theme` no `<html>`. Exporta `useTheme()` (`theme`, `toggleTheme`, `setTheme`).
- `TeamContext` — equipe/contexto ativo. Exporta `useTeam()` e `PERSONAL_CONTEXT`, um pseudo-contexto
  sempre disponível ao lado das equipes reais (a "company pessoal", nunca devolvida por `GET /teams`).
  A escolha persiste em `localStorage` (`hs-current-team`). Normaliza `role` para minúsculo, porque o
  backend às vezes manda o enum cru em maiúsculo. Expõe `pendingImport`, que dispara o `ImportAccountsModal`
  quando o usuário cria ou entra numa equipe que ainda não tem contas.

### Services

Todos em `src/services/`. A integração com o backend **já começou** — parte dos services faz HTTP real,
parte ainda devolve `Promise.resolve(data)`. Ao mexer aqui, confira em qual grupo o arquivo está.

- `api.js` — base da integração. Exporta `API_BASE` (`VITE_API_URL`, default `https://hubstudio.onrender.com`)
  e `authFetch()`, que injeta o `Bearer` do `localStorage` e, em caso de 401, limpa a sessão e manda pra `/login`.

Já falam com a API real:

- `auth.js` — login, cadastro, recuperação de senha
- `team.js` — CRUD de equipes, membros, papéis, convite por código, atividade, aprovação, importação de contas.
  Também concentra as constantes de autorização: `ROLES`, `ROLE_ORDER`, `PERMISSIONS`, `PERMISSION_MATRIX`,
  `PLAN_LIMITS`, `TEAM_COLORS`, `TEAM_TYPES`.
- `analytics.js` e `posts.js` — híbridos: já batem na API, mas mantêm alguns mocks (ex.: sugestões de IA).

Ainda 100% mock:

- `support.js` — base de conhecimento, artigos, status do sistema, chamados, FAQ
- `settings.js` — sessões ativas, histórico de faturas, uso do plano

### Componentes reutilizáveis

- `Button` — variants: `primary | outline | ghost | danger | secondary`. Props: `size`, `fullWidth`, `loading`, `icon`.
- `Modal` — wrapper animado com overlay. Props: `isOpen`, `onClose`, `title`, `size`.
- `PostModal` — modal de 3 etapas para agendamento de post (Conteúdo → Agendamento → Confirmar).
- `Sidebar` — colapsável, com dark mode toggle e logout. Props: `isCollapsed`, `onToggle`, `onNewPost`.
- `OAuthIcons` — exporta `GoogleIcon` e `FacebookIcon` (SVGs inline com cores oficiais).
- `PasswordField` — exporta `AuthPasswordField` (telas auth), `RecoveryPasswordField` (telas recovery) e `StrengthMeter` (medidor de força reutilizável, prefix `auth` ou `recovery`).
- `SearchModal` — modal de busca global (Ctrl+K) com resultados categorizados e navegação por teclado. Acessada pelo botão "Pesquisar" da sidebar.
- `CalendarModal` — modal grande de calendário (botão "expandir" no `MiniCalendar`).
- `ShortcutsModal` — lista de atalhos de teclado (abre com `?`).
- `OnboardingTour` — modal de boas-vindas em 5 passos, exibido só na primeira visita (localStorage).
- `ContextSwitcher` — troca o contexto ativo (Pessoal ou uma equipe). Sempre visível, diferente do antigo
  `TeamSwitcher` que substituiu. Traz atalhos de criar equipe e entrar por código.
- `Toast` — notificações. `ToastProvider` monta a fila (`maxToasts`, default 4); `showToast({...})` pode ser
  chamado de qualquer lugar, sem hook, e `useToast()` dá acesso ao contexto. Tipos: success, error, warning, info.
- `ProtectedRoute` — guarda das rotas do dashboard; redireciona quem não está autenticado.
- `Navbar` e `Footer` — usados apenas na Landing.

### Estrutura da página de Equipes

`Equipes.jsx` é composição, com 5 abas. Sub-componentes em `src/pages/Dashboard/Equipes/components/`:

- `EquipesHeader.jsx` — cabeçalho da equipe ativa (membros, posts pendentes) + criar equipe / entrar por código.
- `EquipesTabs.jsx` — navegação das abas: Membros, Papéis, Aprovação, Atividade e Configurações.
  A aba de Configurações é gated por permissão (`gate: 'accountSettings'`).
- `MembrosTab.jsx` — lista de membros, com `MemberRow.jsx` por linha (trocar papel, remover).
- `PapeisTab.jsx` — referência visual da `PERMISSION_MATRIX` (o que cada papel pode fazer).
- `AprovacaoTab.jsx` — fluxo de aprovação de posts e quem são os aprovadores.
- `AtividadeTab.jsx` — log de eventos da equipe.
- `ConfiguracoesTab.jsx` — editar equipe, excluir e sair.
- `ConvitesTab.jsx` — convites pendentes (reenviar/cancelar).
- `RoleBadge.jsx` e `RolePicker.jsx` — exibição e seleção de papel, reutilizados nas abas.
- `InviteModal.jsx` — convidar por e-mail. `ShareCodeModal.jsx` — convidar por código.
- `CreateTeamModal.jsx` — criação de equipe.
- `ImportAccountsModal.jsx` — montado no `DashboardLayout` e aberto via `TeamContext.pendingImport`, quando
  o usuário cria ou entra numa equipe sem contas. Aceitar **move** as contas pessoais para a equipe (elas
  deixam de ser pessoais); recusar não altera nada.

### Estrutura da página de Suporte

`Suporte.jsx` é composição. Sub-componentes em `src/pages/Dashboard/Suporte/components/`:

- `SupportHero.jsx` — saudação + busca na base de conhecimento (dropdown de resultados ao digitar).
- `SupportChannels.jsx` — 4 cards de canais (Chat ao vivo, Abrir chamado, E-mail, WhatsApp) com SLA/status.
- `KnowledgeBase.jsx` — grid de categorias + lista de artigos populares.
- `SupportFaq.jsx` — accordion de perguntas frequentes (auto-contido, classes `sup-faq`).
- `MyTickets.jsx` — lista de chamados com status/prioridade + botão abrir novo.
- `NewTicketModal.jsx` — formulário de chamado (assunto, categoria, prioridade, descrição) via `Modal`.
- `SystemStatus.jsx` — painel de status dos componentes do sistema (operacional/instável/fora do ar).
- `SupportPlanCard.jsx` — tier de suporte do plano atual + upsell para o Elite.
- `LiveChatWidget.jsx` — chat flutuante mock (FAB → painel com auto-resposta da "Deb").

### Estrutura da página de Configurações

`Configuracoes.jsx` é composição com navegação lateral de 7 abas. Sub-componentes em `src/pages/Dashboard/Configuracoes/components/`:

- `Toggle.jsx` — switch reutilizável (classes `set-toggle`).
- `PerfilTab.jsx` — avatar (upload base64), nome, @usuário, e-mail, bio, fuso, idioma.
- `RedesTab.jsx` — vincular redes (conectado/expirado/desconectado) + permissões + segurança. Substituiu a antiga página órfã `Redes/`.
- `SegurancaTab.jsx` — trocar senha, 2FA (toggle), sessões ativas (encerrar dispositivos).
- `NotificacoesTab.jsx` — matriz de notificações por canal (e-mail/push/no app).
- `AparenciaTab.jsx` — seletor de tema (claro/escuro/sistema via `setTheme`), idioma, formato de data.
- `CobrancaTab.jsx` — plano atual, medidores de uso, método de pagamento, histórico de faturas.
- `PrivacidadeTab.jsx` — exportar dados (LGPD) + zona de perigo (excluir conta com confirmação por digitação).

### Hooks

- `src/hooks/useKeyboardShortcuts.js` — registra atalhos globais (`mod+k`, `n`, `?`, etc). Atalhos de tecla única só disparam quando o foco não está num input.

### Utils

- `src/utils/password.js` — `calcStrength(pwd)` e `STRENGTH_LABELS`.
- `src/utils/string.js` — `getInitials(name)`.
- `src/utils/export.js` — `exportDashboardReport(stats, engagement)` gera CSV e dispara download.
- `src/styles/animations.js` — `formContainerVariants`, `fieldVariants` (auth) e `dashFadeUp` (dashboard).

### Estrutura do Dashboard Home

`DashboardHome.jsx` é apenas composição. Sub-componentes em `src/pages/Dashboard/Home/components/`:

- `DashboardHeader.jsx` — título de boas-vindas + filtros (período, rede) + ações (Novo post, Exportar).
- `KpiGrid.jsx` — 3 KPI cards (views/likes/comments) com skeleton fallback.
- `FollowersCard.jsx` — soma seguidores/inscritos de Instagram+TikTok+YouTube; detalha por rede só quando há mais de uma no total (filtro de rede reduz pra 1).
- `AudienceCard.jsx` — demografia da audiência: faixa etária (barras), gênero (barra dividida) e top localizações.
- `BestTimeCard.jsx` — destaque do pico de engajamento + lista das 3 alternativas + CTA de agendamento.
- `EngagementChart.jsx` — area chart com gradiente + seletor de métrica (Visualizações/Curtidas/Comentários) e toggle Diário/Semanal/Mensal.
- `NetworkComparison.jsx` — mini-cards comparando crescimento por rede (cores via `networkColor`).
- `ContentReachCard.jsx` — barras de progresso por tipo de conteúdo.
- `TopPostsCard.jsx` — top 5 publicações.
- `AIInsightsBar.jsx` — barra de insights da IA no topo do dashboard.
- `AISuggestionsCard.jsx` — sugestões da IA (gerar/copiar).
- `AccountScoreCard.jsx` — nota/score geral da conta.
- `UpcomingPosts.jsx` — fila dos próximos agendamentos (cores via `networkColor`).
- `ActivityFeed.jsx` — feed de atividade recente.
- `RecentPostsCard.jsx` — publicações recentes com `PostMenu` (editar/duplicar/excluir).
- `PostMenu.jsx` — dropdown de ações para um post.
- `ScheduleCTA.jsx` — banner CTA que abre o `PostModal`.
- `MiniCalendar.jsx` — calendário com navegação entre meses e 3 status (agendado/publicado/rascunho).

### Acesso ao PostModal pelas páginas filhas

`DashboardLayout` expõe `openPostModal(prefill?)` via `Outlet context`. Páginas filhas usam:

```js
const { openPostModal } = useOutletContext()
openPostModal({ text: '...', networks: [...] })  // prefill opcional
```

`PostModal` aceita a prop `prefill` para pré-preencher campos quando aberto via sugestão de IA / edição / duplicação.

### Estrutura do Landing

Para evitar inchaço do `Landing.jsx`, os sub-componentes e dados ficam separados:

- `src/pages/Landing/Landing.jsx` — composição da página (apenas JSX das seções).
- `src/pages/Landing/data.js` — `FEATURES`, `STEPS`, `PLANS`, `FAQS`, `MOCKUP_BARS`, variants `fadeUp`.
- `src/pages/Landing/components/`:
  - `HeroMockup.jsx` — dashboard mockup + badges flutuantes do hero.
  - `Counter.jsx` — contador animado dos stats.
  - `FaqItem.jsx` — item de FAQ com accordion.
  - `FeaturePreviews.jsx` — `FeatureCalendarPreview`, `FeatureChartPreview`, `FeatureHashtagsPreview`, `FeaturePlatformsPreview`.

### Imagens da Deb (persona)

Salvar em `src/assets/images/` com os nomes:
- `deb-phone.png` — Deb segurando celular (usada no hero da landing)
- `deb-tablet.png` — Deb apontando para tela (usada na seção "Sobre")
- `deb-laptop.png` — Deb sentada com laptop
- `deb-standing.png` — Deb em pé

As imagens têm fundo branco — usar `mix-blend-mode: multiply` no CSS quando necessário.

### CSS

- Variáveis em `src/styles/variables.css` (cores, tipografia, espaçamentos, transições).
- Estilos globais em `src/styles/global.css` (reset, animações, skeleton loader).
- `src/styles/auth.css` — estilos compartilhados pelas telas de autenticação (Login + Cadastro).
- Cada componente/página tem seu próprio `.css` na mesma pasta.
- Dark mode via `[data-theme='dark']` nas variáveis CSS.
- Cor primária: `--color-primary: #4F35E8`.

## Auto-sync

Um hook Stop (`settings.local.json`) faz `git add -A && git commit && git push origin main` automaticamente ao fim de cada resposta que tiver mudanças.

**Instrução para Claude:** ao criar ou remover componentes, rotas, serviços ou contextos, atualizar as seções de Architecture acima para refletir o estado atual do projeto.
