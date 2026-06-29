# Alterações do Frontend

> Período: 27/06/2026 (noite) → 28/06/2026 (fim do dia)

---

## 1. Campo de mídia unificado no Compositor

**Commit:** `3b7b056`  
**Arquivo:** `src/pages/Dashboard/Posts/Composer.jsx`

O campo de upload de mídia foi movido das abas individuais de cada rede social para um único campo compartilhado no passo 4 do Compositor. Agora todas as redes selecionadas utilizam o mesmo conjunto de arquivos de mídia.

- `form.media` substituiu `contentByNetwork[n].media`
- `emptyNetworkContent()` deixou de incluir `media`
- `copyToAllNetworks` não mais copia mídia
- `activeHasMedia` calculado a partir de `form.media.length > 0`
- Agendamento movido para o passo 5

---

## 2. Geração de legenda com IA (Groq) + modal de ideia

**Commits:** `8673059`, `4258c3b`  
**Arquivos novos:**
- `src/pages/Dashboard/Posts/components/CaptionIdeaModal.jsx`
- `src/pages/Dashboard/Posts/components/CaptionIdeaModal.css`

**Arquivo alterado:** `src/pages/Dashboard/Posts/Composer.jsx`

Ao clicar em "Gerar legenda", abre um modal onde o usuário digita uma breve ideia sobre o vídeo/post. Após confirmar, a ideia é enviada ao endpoint `POST /ai/generate-caption` (Groq via backend) e o resultado é inserido na caixa de legenda da rede ativa.

- Botão habilitado sempre que não há geração em andamento (`aiBusy === null`), sem exigir mídia ou título prévio
- `CaptionIdeaModal`: textarea com limite de 500 chars, atalho Ctrl+Enter, estado de loading com spinner, exibição de erros inline
- Estilo com backdrop blur, animação de entrada, compatível com tema claro/escuro via variáveis CSS

---

## 3. Hashtags via IA real (Groq)

**Commit:** `fa9e3dc`  
**Arquivo:** `src/pages/Dashboard/Posts/Composer.jsx`

O botão "Sugerir hashtags" foi ligado ao endpoint real `POST /ai/suggest-hashtags`. Anteriormente usava lógica mockada.

- Requisição enviada com `{ networkId, content, title }`
- Botão habilitado quando há conteúdo ou título preenchido (sem necessidade de mídia)
- Hashtags retornadas pelo backend são inseridas diretamente na caixa da rede ativa

---

## 4. Sessão JWT: expiração em 3 h + redirecionamento automático

**Commit:** `f05fca4`  
**Arquivos:**
- `src/contexts/AuthContext.jsx`
- `src/services/api.js`

Quando o token expira (3 horas configuradas no backend), o usuário é redirecionado automaticamente para `/login`.

- `AuthContext`: função `isTokenExpired(token)` decodifica o payload JWT e compara `exp * 1000` com `Date.now()`; ao inicializar, se o token salvo estiver expirado chama `clearSession()` e retorna `null`
- `clearSession()` remove `hs-user` e `hs-token` do `localStorage`
- `authFetch` em `api.js` tornou-se `async`; qualquer resposta `401` limpa o localStorage e redireciona via `window.location.href = '/login'`

---

## 5. Regra de 5 minutos no agendamento

**Commits:** `42a548c`, `5b5d9a9`, `4040da7`  
**Arquivos:**
- `src/pages/Dashboard/Posts/Composer.jsx`
- `src/pages/Dashboard/Posts/components/DateTimePicker.jsx`
- `src/pages/Dashboard/Posts/Composer.css`

O agendamento passou a exigir mínimo de 5 minutos no futuro e envia o horário no fuso local (sem converter para UTC).

- `DateTimePicker`: dias passados desabilitados visualmente; horário mínimo calculado com margem de 5 min a partir de `Date.now()`
- `Composer.jsx`: validação antes de salvar; horário local formatado como `YYYY-MM-DDTHH:mm:ss` sem sufixo `Z`
- `Composer.css`: estilos para dias desabilitados/passados no calendário de agendamento
- Correção de bug onde apenas a primeira rede recebia o agendamento (agora itera sobre todas as redes selecionadas)

---

## 6. Painel de status dos tokens na aba Redes

**Commit:** `8b839bc`  
**Arquivos:**
- `src/pages/Dashboard/Configuracoes/components/RedesTab.jsx`
- `src/pages/Dashboard/Configuracoes/Configuracoes.css`

Adicionado painel que exibe o estado de autenticação de cada conta conectada (token válido, expirado ou ausente), com botão para reconectar quando necessário.

---

## 7. Integração da aba Redes com a API real

**Commits:** `1d6f4cc`, `d225789`, `b65f7c1`  
**Arquivos:**
- `src/pages/Dashboard/Configuracoes/components/RedesTab.jsx`
- `src/pages/Dashboard/Configuracoes/Configuracoes.css`

A aba Redes passou a consumir a API real para listar, conectar e desconectar contas de redes sociais.

- Timeout de 12 segundos no carregamento inicial para evitar loading infinito
- Botão "Conectar" desbloqueado durante o carregamento inicial
- Correção de bug: `isBusy` ficava sempre `true` devido a comparação `null === null` no estado `disconnecting`

---

## 8. OAuth callback: redirecionamento imediato para Redes

**Commits:** `f3f30e1`, `8b1e7e5`  
**Arquivo:** `src/pages/IntegrationsCallback/IntegrationsCallback.jsx`

Após o usuário completar o fluxo OAuth de qualquer rede social, o app agora redireciona diretamente para a aba Redes (Configurações) sem exibir tela de confirmação intermediária.

---

## 9. Integração do compositor com APIs de agendamento TikTok/YouTube

**Commits:** `5d80acd`, `4040da7`  
**Arquivos:**
- `src/pages/Dashboard/Posts/Composer.jsx`
- `src/pages/Dashboard/Posts/Composer.css`
- `src/services/posts.js`

O Compositor passou a chamar os endpoints reais de agendamento para TikTok e YouTube. O calendário do Dashboard foi integrado com dados reais da API.

---

## 10. Dashboard: calendário e próximos agendamentos com dados reais

**Commit:** `4be9c96`  
**Arquivo:** `src/services/posts.js`

Funções de busca do calendário e lista de próximos posts agendados refatoradas para consumir dados reais da API em vez de dados mockados.

---

## 11. Páginas de desenvolvimento YouTube (OAuth + publicação)

**Commit:** `c5154de`  
**Arquivos novos:**
- `src/pages/DevYouTube/DevYouTube.jsx`
- `src/pages/DevYouTube/DevYouTube.css`
- `src/pages/DevYouTube/DevYouTubePost.jsx`

Página de teste para o fluxo completo YouTube: autenticação OAuth e publicação de vídeo com upload, espelhando a estrutura da página DevTikTok.

---

## 12. Toggle "Publicar agora / Agendar" nas páginas dev TikTok e YouTube

**Commit:** `9836a69`  
**Arquivos:**
- `src/pages/DevTikTok/DevTikTokPost.jsx`
- `src/pages/DevTikTok/DevTikTok.css`
- `src/pages/DevYouTube/DevYouTubePost.jsx`
- `src/pages/DevYouTube/DevYouTube.css`
- `src/services/api.js`
- `src/services/auth.js`
- `src/services/posts.js`

Adicionado controle para escolher entre publicação imediata e publicação agendada nas páginas de teste das integrações.

---

## 13. Página de Termos de Serviço + verificação de domínio TikTok

**Commits:** `3c78037`, `3580206`  
**Arquivos:**
- `src/pages/Legal/TermsOfService.jsx` (nova rota `/terms`)
- `public/tiktokvzJ2zpeVXmeakUhnyVEGKgfHVRB9mYW5.txt`

Página de Termos de Serviço criada e registrada na rota `/terms`. Arquivo de verificação de domínio TikTok adicionado em `public/`.

---

## 14. Tela de Equipes integrada com API real

**Commit:** `3479b3d`  
**Arquivos:**
- `src/services/team.js`
- `src/contexts/TeamContext.jsx`
- `src/pages/Dashboard/Equipes/Equipes.jsx`
- `src/pages/Dashboard/Equipes/Equipes.css`

A tela de Equipes era inteiramente mockada com dados hardcoded. Agora consome a API real do backend.

- `services/team.js`: todos os mocks removidos; funções substituídas por chamadas reais aos endpoints `/teams/**`. Constantes de UI (ROLES, TEAM_COLORS, TEAM_TYPES, PERMISSIONS) mantidas pois são apenas visuais
- `TeamContext.jsx`: `createTeam`, `updateTeam`, `deleteTeam` agora chamam a API; adicionado `joinTeam(code)` para entrar por código. Se o usuário não tiver equipes, `currentTeam` retorna `null` corretamente
- `Equipes.jsx`: estado vazio tratado — quando o usuário não pertence a nenhuma equipe, exibe tela com botão "Criar equipe" e campo de código para entrar em uma existente. Todas as ações (alterar cargo, remover membro, convidar, cancelar convite, configuração de aprovação) agora persistem via API com feedback de erro inline
- `Equipes.css`: estilos do estado vazio adicionados (`.eq-empty`, `.eq-empty__join`, `.eq-empty__error`)

---

## 15. Restrição de formatos de imagem por plataforma no Compositor

**Commits:** `636d3b2`, `880e979`
**Arquivos:**
- `src/pages/Dashboard/Posts/components/MediaUploader.jsx`
- `src/pages/Dashboard/Posts/Composer.jsx`
- `src/pages/Dashboard/Posts/Composer.css`
- `src/services/posts.js`

O `MediaUploader` agora valida os formatos de imagem em tempo real conforme as redes selecionadas.

- `PLATFORM_IMAGE_TYPES` adicionado em `posts.js`: tabela com os MIME types aceitos por plataforma/tipo (TikTok foto → JPEG/WebP; Instagram → JPEG/PNG; Facebook/LinkedIn → JPEG/PNG/GIF; Twitter → JPEG/PNG/GIF/WebP; YouTube → vídeo only)
- `MediaUploader` ganhou props `allowedImageMimeTypes` e `onRejected`; o `accept` do `<input>` e o hint de formatos se atualizam dinamicamente; drag-and-drop também bloqueia formatos inválidos
- `Composer.jsx` calcula `allowedImageMimeTypes` via interseção dos formatos aceitos por todas as redes selecionadas; arquivos rejeitados disparam mensagem com os formatos aceitos
- Incompatibilidade entre plataformas bloqueada com lógica baseada em orientação (vertical ↔ horizontal): ao adicionar uma nova rede, o sistema escolhe automaticamente o tipo mais compatível com a sessão atual (ex: YouTube entra como Shorts quando TikTok Vídeo está ativo)
- Pills de redes incompatíveis ficam desabilitados com opacidade reduzida e tooltip explicativo
- `Composer.css`: classe `.composer__network-pill--blocked` adicionada

---

## 16. Correção "Visto há undefined" na tela de Equipes

**Commit:** `8508951`
**Arquivos:**
- `src/utils/date.js` (novo)
- `src/pages/Dashboard/Equipes/components/MemberRow.jsx`

O campo "Visto há" exibia `undefined` porque usava `member.lastActive`, campo inexistente na resposta da API.

- Novo utilitário `timeAgo(dateStr)` em `src/utils/date.js`: converte data ISO para string legível ("agora", "3 horas", "ontem", "5 dias", "2 meses")
- `MemberRow.jsx` atualizado para usar `member.lastSeenAt` (novo campo da API) com `timeAgo()`; exibe `—` quando o campo é nulo (usuário nunca logou após a atualização)

---

## Resumo dos arquivos alterados

| Arquivo | Tipo de alteração |
|---|---|
| `Composer.jsx` | Mídia unificada, IA legenda/hashtags, agendamento real, fuso local |
| `components/CaptionIdeaModal.jsx` | Novo componente |
| `components/CaptionIdeaModal.css` | Novo estilo |
| `components/DateTimePicker.jsx` | Regra 5 min, dias passados desabilitados |
| `Composer.css` | Estilos calendário agendamento |
| `AuthContext.jsx` | Verificação expiração JWT, clearSession |
| `services/api.js` | `authFetch` async, interceptação 401 |
| `services/posts.js` | APIs reais agendamento e calendário |
| `services/auth.js` | Fluxo OAuth YouTube |
| `Configuracoes/RedesTab.jsx` | API real, painel tokens, bugs de loading/isBusy |
| `Configuracoes/Configuracoes.css` | Estilos painel tokens |
| `IntegrationsCallback.jsx` | Redirect imediato pós-OAuth |
| `DevTikTok/DevTikTokPost.jsx` | Toggle publicar/agendar |
| `DevYouTube/DevYouTube.jsx` | Nova página dev YouTube |
| `DevYouTube/DevYouTubePost.jsx` | Nova página dev YouTube |
| `Legal/TermsOfService.jsx` | Nova página Termos |
| `App.jsx` | Novas rotas `/terms`, `/dev/youtube` |
| `public/*.txt` | Verificação domínio TikTok |
| `services/team.js` | API real substituindo mocks de equipes |
| `contexts/TeamContext.jsx` | CRUD de equipes via API, `joinTeam` adicionado |
| `Equipes/Equipes.jsx` | Estado vazio, ações via API, erros inline |
| `Equipes/Equipes.css` | Estilos do estado vazio |
| `components/MediaUploader.jsx` | Restrição de formatos por plataforma, drag-and-drop bloqueado |
| `Composer.jsx` | Interseção de formatos, bloqueio de plataformas incompatíveis, auto-switch de tipo |
| `Composer.css` | Estilo `.composer__network-pill--blocked` |
| `services/posts.js` | `PLATFORM_IMAGE_TYPES` adicionado |
| `utils/date.js` | Novo utilitário `timeAgo()` |
| `Equipes/components/MemberRow.jsx` | Usa `lastSeenAt` + `timeAgo()` em vez de `lastActive` |
