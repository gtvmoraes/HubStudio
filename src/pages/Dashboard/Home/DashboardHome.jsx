import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Reorder } from 'framer-motion'
import { LuLayoutGrid, LuGripVertical, LuRotateCcw, LuCheck, LuRefreshCw } from 'react-icons/lu'
import { useAuth } from '../../../contexts/AuthContext'
import { useTeam } from '../../../contexts/TeamContext'
import {
  getStats, getEngagementData, getNetworkComparison,
  getContentReach, getBestTimes, getAudience, getAccountScore, getAudienceTotal, getAiInsights, getActivityFeed,
} from '../../../services/analytics'
import {
  getTopPosts, getRecentPosts, getCalendarMarkers, getAiSuggestions, getUpcomingPosts,
  refreshAllMetrics,
} from '../../../services/posts'
import { dashFadeUp as fadeUp } from '../../../styles/animations'
import { exportDashboardReport } from '../../../utils/export'

import DashboardHeader from './components/DashboardHeader'
import AIInsightsBar from './components/AIInsightsBar'
import KpiGrid from './components/KpiGrid'
import AudienceCard from './components/AudienceCard'
import BestTimeCard from './components/BestTimeCard'
import CalendarModal from '../../../components/CalendarModal/CalendarModal'
import EngagementChart from './components/EngagementChart'
import NetworkComparison from './components/NetworkComparison'
import ContentReachCard from './components/ContentReachCard'
import TopPostsCard from './components/TopPostsCard'
import ScheduleCTA from './components/ScheduleCTA'
import MiniCalendar from './components/MiniCalendar'
import AccountScoreCard from './components/AccountScoreCard'
import FollowersCard from './components/FollowersCard'
import AISuggestionsCard from './components/AISuggestionsCard'
import RecentPostsCard from './components/RecentPostsCard'
import UpcomingPosts from './components/UpcomingPosts'
import ActivityFeed from './components/ActivityFeed'

import './DashboardHome.css'

// Ordem padrão dos blocos em cada coluna. Cada id é renderizado pelo registry
// abaixo. Persistido no localStorage para o usuário montar o dashboard à vontade.
const LEFT_DEFAULT  = ['kpis', 'followersTotal', 'insights', 'charts', 'audience', 'networks', 'bottom', 'cta']
const RIGHT_DEFAULT = ['calendar', 'upcoming', 'activity', 'suggestions', 'recent']

// Reconcilia a ordem salva com a padrão: mantém o que o usuário ordenou,
// descarta ids inexistentes e acrescenta blocos novos no fim (à prova de futuro).
const loadOrder = (key, def) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key))
    if (!Array.isArray(saved)) return def
    const known = saved.filter(id => def.includes(id))
    const missing = def.filter(id => !known.includes(id))
    return [...known, ...missing]
  } catch {
    return def
  }
}

export default function DashboardHome() {
  const { user } = useAuth()
  const { activeContext } = useTeam()
  const companyId = activeContext.personal ? null : activeContext.id
  const navigate = useNavigate()
  // Abre o compositor já com uma intenção. `ai` dispara a ferramenta de IA
  // correspondente lá dentro ('caption' | 'hashtags'); `date` pré-preenche o
  // agendamento (usado pelo card de melhor horário).
  const openComposer = (prefill) => {
    const params = new URLSearchParams()
    if (prefill?.ai) params.set('ai', prefill.ai)
    if (prefill?.date) params.set('date', prefill.date)
    const qs = params.toString()
    navigate(`/dashboard/posts/novo${qs ? `?${qs}` : ''}`)
  }

  // Convenção de carregamento em todo o dashboard:
  //   undefined = ainda carregando  → o card mostra skeleton
  //   null / []  = carregou sem dado → o card mostra o estado vazio
  // Nada é resetado pra undefined depois do primeiro load: ao trocar de filtro
  // os dados antigos ficam na tela até os novos chegarem (sem piscar).
  const [stats, setStats] = useState(undefined)
  const [engagement, setEngagement] = useState(undefined)
  const [networkComparison, setNetworkComparison] = useState(undefined)
  const [contentReach, setContentReach] = useState(undefined)
  const [bestTimes, setBestTimes] = useState(undefined)
  const [audience, setAudience] = useState(undefined)
  const [accountScore, setAccountScore] = useState(undefined)
  const [audienceTotal, setAudienceTotal] = useState(undefined)
  // Crescimento de seguidores em 7d / 30d / total — preenche o card quando há
  // uma única rede (sem detalhamento por rede pra mostrar).
  const [followerGrowth, setFollowerGrowth] = useState(undefined)
  const [topPosts, setTopPosts] = useState(undefined)
  const [recentPosts, setRecentPosts] = useState(undefined)
  const [calendarMarkers, setCalendarMarkers] = useState({})
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [upcomingPosts, setUpcomingPosts] = useState(undefined)
  const [activity, setActivity] = useState(undefined)

  const [period, setPeriod] = useState('30d')
  const [network, setNetwork] = useState('all')
  const [granularity, setGranularity] = useState('daily')

  const [feedback, setFeedback] = useState({})
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Layout modular
  const [editMode, setEditMode] = useState(false)
  const [leftOrder, setLeftOrder] = useState(() => loadOrder('hs-dash-left', LEFT_DEFAULT))
  const [rightOrder, setRightOrder] = useState(() => loadOrder('hs-dash-right', RIGHT_DEFAULT))

  useEffect(() => { localStorage.setItem('hs-dash-left', JSON.stringify(leftOrder)) }, [leftOrder])
  useEffect(() => { localStorage.setItem('hs-dash-right', JSON.stringify(rightOrder)) }, [rightOrder])

  const resetLayout = () => { setLeftOrder(LEFT_DEFAULT); setRightOrder(RIGHT_DEFAULT) }

  // Dados estáticos (não dependem dos filtros de período/rede, mas dependem
  // do contexto ativo — Pessoal ou uma equipe).
  const loadStaticData = () => Promise.all([
    getAudience(companyId),
    getAccountScore(companyId),
    getRecentPosts(companyId),
    getCalendarMarkers(companyId),
    getAiSuggestions(),
    getUpcomingPosts(companyId),
    getActivityFeed(),
  ]).then(([
    audienceRes, accountScoreRes,
    recentPostsRes, markersRes, aiSuggestionsRes,
    upcomingRes, activityRes,
  ]) => {
    setAudience(audienceRes)
    setAccountScore(accountScoreRes)
    setRecentPosts(recentPostsRes)
    setCalendarMarkers(markersRes)
    setAiSuggestions(aiSuggestionsRes)
    setUpcomingPosts(upcomingRes)
    setActivity(activityRes)
  })

  useEffect(() => { loadStaticData() }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Top posts, alcance por tipo de conteúdo e melhores horários dependem tanto
  // de período quanto de rede — antes ignoravam os dois filtros por completo.
  const loadFilteredData = () => Promise.all([
    getStats(period, network, companyId).then(setStats),
    getEngagementData(granularity, network, companyId).then(setEngagement),
    getTopPosts(period, network, companyId).then(setTopPosts),
    getContentReach(period, network, companyId).then(setContentReach),
    getBestTimes(period, network, companyId).then(setBestTimes),
    getNetworkComparison(period, companyId).then(setNetworkComparison),
    getAudienceTotal(period, network, companyId).then(setAudienceTotal),
    getAiInsights(period, companyId).then(setAiInsights),
  ])

  useEffect(() => {
    getStats(period, network, companyId).then(setStats)
  }, [period, network, companyId])

  useEffect(() => {
    getTopPosts(period, network, companyId).then(setTopPosts)
  }, [period, network, companyId])

  useEffect(() => {
    getAudienceTotal(period, network, companyId).then(setAudienceTotal)
  }, [period, network, companyId])

  // Não depende do filtro de período: são sempre os mesmos 3 recortes.
  useEffect(() => {
    let cancelled = false
    Promise.all([
      getAudienceTotal('7d', network, companyId),
      getAudienceTotal('30d', network, companyId),
      getAudienceTotal('all', network, companyId),
    ]).then(([week, month, all]) => {
      if (cancelled) return
      setFollowerGrowth((week || month || all) ? { week, month, all } : null)
    })
    return () => { cancelled = true }
  }, [network, companyId])

  useEffect(() => {
    getAiInsights(period, companyId).then(setAiInsights)
  }, [period, companyId])

  useEffect(() => {
    getEngagementData(granularity, network, companyId).then(setEngagement)
  }, [granularity, network, companyId])

  useEffect(() => {
    getContentReach(period, network, companyId).then(setContentReach)
  }, [period, network, companyId])

  useEffect(() => {
    getBestTimes(period, network, companyId).then(setBestTimes)
  }, [period, network, companyId])

  useEffect(() => {
    getNetworkComparison(period, companyId).then(setNetworkComparison)
  }, [period, companyId])

  const firstName = user?.name?.split(' ')[0] || 'usuário'

  const flashFeedback = (key, msg, ms = 1800) => {
    setFeedback(f => ({ ...f, [key]: msg }))
    setTimeout(() => setFeedback(f => {
      const { [key]: _omit, ...rest } = f
      return rest
    }), ms)
  }

  const handleExport = () => {
    exportDashboardReport(stats, engagement)
    flashFeedback('export', 'Baixado!')
  }

  // Força a coleta de métricas direto nas redes (em vez de esperar o job
  // automático do backend, que roda a cada 6h) e recarrega o dashboard.
  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      if (localStorage.getItem('hs-token')) {
        await refreshAllMetrics(companyId)
      }
      await Promise.all([loadStaticData(), loadFilteredData()])
      flashFeedback('refresh', 'Atualizado!')
    } catch {
      flashFeedback('refresh', 'Erro ao atualizar')
    } finally {
      setRefreshing(false)
    }
  }

  // Cada sugestão declara sua intenção (`ai`): abre o compositor já com a
  // ferramenta de IA correspondente pronta, em vez de só navegar pra lista.
  const handleAiAction = (suggestion) => {
    openComposer({ ai: suggestion.ai || 'caption' })
  }

  const duplicatePost = (post) => {
    setRecentPosts(prev => [
      { ...post, id: Date.now(), title: `${post.title} (cópia)`, status: 'draft', date: '—', time: '—' },
      ...prev,
    ])
  }

  const deletePost = (id) => {
    setRecentPosts(prev => prev.filter(p => p.id !== id))
  }

  const editPost = (post) => {
    navigate(`/dashboard/posts/${post.id}/editar`)
  }

  // ─── Registry de blocos: cada id → conteúdo. Mantém os pares lado a lado
  //     como uma unidade arrastável (charts, audience, bottom). ───
  const LEFT_BLOCKS = {
    kpis: <KpiGrid stats={stats} />,
    followersTotal: <FollowersCard data={audienceTotal} growth={followerGrowth} />,
    insights: <AIInsightsBar insights={aiInsights} />,
    charts: (
      <div className="dash-home__charts">
        <EngagementChart
          data={engagement}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <AccountScoreCard data={accountScore} />
      </div>
    ),
    audience: (
      <div className="dash-home__row dash-home__row--2">
        <motion.div
          className="chart-card chart-card--audience"
          variants={fadeUp} initial="hidden" animate="visible" custom={4}
        >
          <AudienceCard data={audience} />
        </motion.div>
        <motion.div
          className="chart-card chart-card--best-time"
          variants={fadeUp} initial="hidden" animate="visible" custom={5}
        >
          <BestTimeCard data={bestTimes} onSchedule={openComposer} />
        </motion.div>
      </div>
    ),
    networks: <NetworkComparison period={period} data={networkComparison} />,
    bottom: (
      <div className="dash-home__bottom">
        <ContentReachCard data={contentReach} />
        <TopPostsCard posts={topPosts} />
      </div>
    ),
    cta: <ScheduleCTA onSchedule={openComposer} />,
  }

  const RIGHT_BLOCKS = {
    calendar: (
      <motion.div
        className="chart-card chart-card--calendar"
        variants={fadeUp} initial="hidden" animate="visible" custom={1}
      >
        <h3>Calendário de publicações</h3>
        <MiniCalendar
          markers={calendarMarkers}
          onExpand={() => setShowCalendarModal(true)}
        />
      </motion.div>
    ),
    upcoming: <UpcomingPosts posts={upcomingPosts} onSeeAll={() => navigate('/dashboard/posts')} />,
    activity: <ActivityFeed items={activity} />,
    suggestions: (
      <AISuggestionsCard
        suggestions={aiSuggestions}
        feedback={feedback}
        onAction={handleAiAction}
      />
    ),
    recent: (
      <RecentPostsCard
        posts={recentPosts}
        onEdit={editPost}
        onDuplicate={duplicatePost}
        onDelete={deletePost}
      />
    ),
  }

  const renderColumn = (order, setOrder, blocks, columnClass) => (
    <Reorder.Group
      as="div"
      axis="y"
      values={order}
      onReorder={setOrder}
      className={columnClass}
    >
      {order.map(id => (
        <Reorder.Item
          key={id}
          value={id}
          as="div"
          className="dash-block"
          dragListener={editMode}
          whileDrag={{ scale: 1.015, zIndex: 20 }}
        >
          {editMode && (
            <span className="dash-block__handle" aria-hidden="true">
              <LuGripVertical size={16} />
            </span>
          )}
          {blocks[id]}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )

  return (
    <div className="dash-home">
      <DashboardHeader
        greeting={`Bem-vindo de volta, ${firstName}!`}
        period={period}
        network={network}
        exportFeedback={feedback.export}
        onPeriodChange={setPeriod}
        onNetworkChange={setNetwork}
        onNewPost={openComposer}
        onExport={handleExport}
      />

      <div className="dash-home__toolbar">
        {editMode ? (
          <>
            <span className="dash-home__toolbar-hint">
              <LuGripVertical size={15} /> Arraste os cards para reordenar
            </span>
            <button type="button" className="dash-home__toolbar-btn" onClick={resetLayout}>
              <LuRotateCcw size={14} /> Restaurar padrão
            </button>
            <button
              type="button"
              className="dash-home__toolbar-btn dash-home__toolbar-btn--primary"
              onClick={() => setEditMode(false)}
            >
              <LuCheck size={14} /> Concluir
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="dash-home__toolbar-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <LuRefreshCw size={14} className={refreshing ? 'dash-home__spin' : ''} />
              {' '}{feedback.refresh || (refreshing ? 'Atualizando...' : 'Atualizar')}
            </button>
            <button
              type="button"
              className="dash-home__toolbar-btn"
              onClick={() => setEditMode(true)}
            >
              <LuLayoutGrid size={14} /> Personalizar
            </button>
          </>
        )}
      </div>

      <div className={`dash-home__grid ${editMode ? 'dash-home__grid--editing' : ''}`}>
        {renderColumn(leftOrder, setLeftOrder, LEFT_BLOCKS, 'dash-home__left')}
        {renderColumn(rightOrder, setRightOrder, RIGHT_BLOCKS, 'dash-home__right')}
      </div>

      <CalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        markers={calendarMarkers}
      />
    </div>
  )
}
