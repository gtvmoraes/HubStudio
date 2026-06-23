import {
  LuCalendarClock, LuChartBar, LuShare2, LuBrain, LuTrendingUp,
  LuRotateCcw, LuUser, LuGift, LuMessageCircle,
} from 'react-icons/lu'

export const FEATURES = [
  {
    slot: 'wide',
    icon: LuCalendarClock,
    color: '#7C5FE8',
    preview: 'calendar',
    title: 'Agendamento Inteligente',
    desc: 'Planeje e publique em todas as redes num calendário visual. A IA sugere os horários de maior engajamento automaticamente.',
  },
  {
    slot: 'tall',
    icon: LuChartBar,
    color: '#E84FA5',
    preview: 'chart',
    title: 'Analytics em Tempo Real',
    desc: 'Dashboards lindos com alcance, engajamento, crescimento de seguidores e muito mais — atualizados ao vivo.',
  },
  {
    slot: 'sm',
    icon: LuBrain,
    color: '#4F35E8',
    preview: 'hashtags',
    title: 'IA Insights',
    desc: 'Sugestões de conteúdo, hashtags e tendências geradas por inteligência artificial.',
  },
  {
    slot: 'sm',
    icon: LuShare2,
    color: '#B44FE8',
    preview: 'platforms',
    title: 'Multi-plataforma',
    desc: 'Instagram, TikTok, LinkedIn, YouTube e mais em uma única tela.',
  },
]

export const STEPS = [
  { icon: LuShare2,        num: '01', title: 'Conecte suas redes',   desc: 'Vincule todas as suas contas sociais em segundos. Instagram, TikTok, YouTube e mais — tudo em um só lugar.' },
  { icon: LuCalendarClock, num: '02', title: 'Crie e agende',        desc: 'Crie conteúdo incrível com ajuda da IA, agende para o melhor horário e deixe a plataforma trabalhar por você.' },
  { icon: LuTrendingUp,    num: '03', title: 'Analise e cresça',     desc: 'Acompanhe métricas em tempo real, entenda o que funciona e tome decisões baseadas em dados reais.' },
]

export const PLANS = [
  {
    name: 'Lite',
    tagline: 'INDIVIDUAL',
    monthly: 0,
    annual: 0,
    desc: 'Ferramentas essenciais para criadores emergentes.',
    cta: 'Começar grátis',
    features: ['Até 3 perfis sociais', '30 posts/mês', 'Analytics básico', 'Calendário visual', 'Suporte por e-mail'],
    highlight: false,
  },
  {
    name: 'Pro',
    tagline: 'CRIADOR PRO',
    monthly: 39.90,
    annual: 31.90,
    desc: 'Para criadores prontos para dominar o algoritmo.',
    cta: 'Assinar o Pro',
    features: ['Até 10 perfis sociais', 'Posts ilimitados', 'Analytics avançado', 'Agendamento com IA', 'Calendário editorial', 'Sugestões de hashtags', 'Suporte prioritário'],
    highlight: true,
  },
  {
    name: 'Elite',
    tagline: 'AGÊNCIAS & TIMES',
    monthly: 99.90,
    annual: 79.90,
    desc: 'Acesso ilimitado para agências e times.',
    cta: 'Assinar o Elite',
    features: ['Perfis ilimitados', 'Posts ilimitados', 'Analytics premium', 'IA completa', 'Calendário avançado', 'Multi-usuário', 'Gerente dedicado', 'Suporte 24/7'],
    highlight: false,
  },
]

export const FAQS = [
  { icon: LuRotateCcw,     q: 'Posso cancelar quando quiser?',            a: 'Sim! Não há fidelidade. Cancele a qualquer momento, sem burocracia ou taxas adicionais.' },
  { icon: LuUser,          q: 'Funciona com conta pessoal do Instagram?', a: 'O agendamento requer conta Profissional (Criador ou Empresa). A conversão é gratuita e leva menos de 1 minuto nas configurações do Instagram.' },
  { icon: LuGift,          q: 'Tem período de teste gratuito?',           a: 'Sim, 14 dias gratuitos em qualquer plano, sem precisar cadastrar cartão de crédito.' },
  { icon: LuShare2,        q: 'Quantas plataformas posso conectar?',      a: 'Lite: até 3 perfis. Pro: até 10. Elite: ilimitado. Suportamos Instagram, TikTok, YouTube, Facebook, LinkedIn e Pinterest.' },
  { icon: LuBrain,         q: 'A IA gera conteúdo automaticamente?',     a: 'A IA sugere horários ideais, hashtags relevantes e tendências. A criação final é sempre sua — autenticidade vem de você.' },
  { icon: LuMessageCircle, q: 'Como funciona o suporte?',                 a: 'Lite: e-mail. Pro: suporte prioritário com resposta em até 4h. Elite: 24/7 com gerente de conta dedicado.' },
]

export const MOCKUP_BARS = [40, 65, 50, 80, 60, 90, 70]

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  }),
}
