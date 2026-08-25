import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, Reorder } from 'framer-motion'
import { LuLayoutGrid, LuGripVertical, LuRotateCcw, LuCheck, LuRefreshCw } from 'react-icons/lu'
import { useAuth } from '../../../contexts/AuthContext'
import { useTeam } from '../../../contexts/TeamContext'
import {
  getStats, getEngagementData, getSocialBreakdown, getNetworkComparison,
  getContentReach, getBestTimes, getAudience, getAiInsights, getActivityFeed,
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
import AISuggestionsCard from './components/AISuggestionsCard'
import RecentPostsCard from './components/RecentPostsCard'
import UpcomingPosts from './components/UpcomingPosts'
import ActivityFeed from './components/ActivityFeed'

import './DashboardHome.css'

// Ordem padrão dos blocos em cada coluna. Cada id é renderizado pelo registry
// abaixo. Persistido no localStorage para o usuário montar o dashboard à vontade.
const LEFT_DEFAULT  = ['kpis', 'insights', 'charts', 'audience', 'networks', 'bottom', 'cta']
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
  const openComposer = (prefill) => navigate('/dashboard/posts/novo')

  const [stats, setStats] = useState(null)
  const [engagement, setEngagement] = useState([])
  const [socialBreakdown, setSocialBreakdown] = useState([])
  const [networkComparison, setNetworkComparison] = useState([])
  const [contentReach, setContentReach] = useState([])
  const [bestTimes, setBestTimes] = useState([])
  const [audience, setAudience] = useState(null)
  const [topPosts, setTopPosts] = useState([])
  const [recentPosts, setRecentPosts] = useState([])
  const [calendarMarkers, setCalendarMarkers] = useState({})
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [upcomingPosts, setUpcomingPosts] = useState([])
  const [activity, setActivity] = useState([])

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
    getSocialBreakdown(),
    getAudience(companyId),
    getTopPosts(companyId),
    getRecentPosts(companyId),
    getCalendarMarkers(companyId),
    getAiSuggestions(),
    getUpcomingPosts(companyId),
    getActivityFeed(),
  ]).then(([
    socialBreakdownRes, audienceRes,
    topPostsRes, recentPostsRes, markersRes, aiSuggestionsRes,
    upcomingRes, activityRes,
  ]) => {
    setSocialBreakdown(socialBreakdownRes)
    setAudience(audienceRes)
    setTopPosts(topPostsRes)
    setRecentPosts(recentPostsRes)
    setCalendarMarkers(markersRes)
    setAiSuggestions(aiSuggestionsRes)
    setUpcomingPosts(upcomingRes)
    setActivity(activityRes)
  })

  useEffect(() => { loadStaticData() }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFilteredData = () => Promise.all([
    getStats(period, network, companyId).then(setStats),
    getEngagementData(granularity, network, companyId).then(setEngagement),
    getContentReach(network, companyId).then(setContentReach),
    getBestTimes(network, companyId).then(setBestTimes),
    getNetworkComparison(period, companyId).then(setNetworkComparison),
    getAiInsights(period, companyId).then(setAiInsights),
  ])

  useEffect(() => {
    getStats(period, network, companyId).then(setStats)
  }, [period, network, companyId])

  useEffect(() => {
    getAiInsights(period, companyId).then(setAiInsights)
  }, [period, companyId])

  useEffect(() => {
    getEngagementData(granularity, network, companyId).then(setEngagement)
  }, [granularity, network, companyId])

  useEffect(() => {
    getContentReach(network, companyId).then(setContentReach)
  }, [network, companyId])

  useEffect(() => {
    getBestTimes(network, companyId).then(setBestTimes)
  }, [network, companyId])

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

  const handleAiAction = async (suggestion) => {
    if (suggestion.action === 'Copiar') {
      try {
        await navigator.clipboard.writeText(suggestion.text)
        flashFeedback(`ai-${suggestion.id}`, 'Copiado!')
      } catch {
        flashFeedback(`ai-${suggestion.id}`, 'Erro')
      }
      return
    }
    openComposer()
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
    insights: <AIInsightsBar insights={aiInsights} onViewAll={() => {}} />,
    charts: (
      <div className="dash-home__charts">
        <EngagementChart
          data={engagement}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <AccountScoreCard />
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
