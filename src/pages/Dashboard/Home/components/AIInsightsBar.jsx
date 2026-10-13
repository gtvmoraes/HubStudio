import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LuSparkles, LuArrowRight, LuTrendingUp, LuTrendingDown, LuLightbulb } from 'react-icons/lu'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const TYPE_META = {
  positive: { Icon: LuTrendingUp,   color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  negative: { Icon: LuTrendingDown, color: '#EF4444', bg: 'rgba(239,68,68,0.10)'  },
  tip:      { Icon: LuLightbulb,    color: '#4F35E8', bg: 'rgba(79,53,232,0.10)'  },
}

const PREVIEW_COUNT = 3

export default function AIInsightsBar({ insights = [], hasSocialAccounts = null, canConnect = false }) {
  const [expanded, setExpanded] = useState(false)
  if (hasSocialAccounts === false) {
    return (
      <motion.div className="ai-insights-bar" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
        <div className="ai-insights-bar__header">
          <span className="ai-insights-bar__title"><LuSparkles size={15} aria-hidden="true" />Insights da IA</span>
        </div>
        <div className="ai-insights-bar__empty">
          <div className="ai-insights-bar__empty-copy">
            <strong>Seus próximos insights começam com a primeira rede</strong>
            <p>Conecte uma rede social para reunir seus dados de desempenho e receber insights personalizados conforme houver métricas disponíveis.</p>
            {!canConnect && <p>Peça a alguém com permissão para gerenciar as redes da equipe para conectar uma conta.</p>}
          </div>
          {canConnect && <Link className="ai-insights-bar__connect" to="/dashboard/configuracoes?tab=redes">
            Conectar minha primeira rede <LuArrowRight size={16} aria-hidden="true" />
          </Link>}
        </div>
      </motion.div>
    )
  }
  if (!insights || !insights.length) return null

  // Antes o botão "Ver todos" não fazia nada porque a barra já mostrava tudo.
  // Agora ela resume em 3 e o botão expande de verdade (só aparece se houver mais).
  const hasMore = insights.length > PREVIEW_COUNT
  const visible = expanded || !hasMore ? insights : insights.slice(0, PREVIEW_COUNT)

  return (
    <motion.div
      className="ai-insights-bar"
      variants={fadeUp} initial="hidden" animate="visible" custom={1}
    >
      <div className="ai-insights-bar__header">
        <span className="ai-insights-bar__title">
          <LuSparkles size={15} aria-hidden="true" />
          Insights da IA
        </span>
        {hasMore && (
          <button
            type="button"
            className="ai-insights-bar__link"
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
          >
            {expanded ? 'Ver menos' : `Ver todos (${insights.length})`}
            <LuArrowRight size={13} />
          </button>
        )}
      </div>

      <div className="ai-insights-bar__items">
        {visible.map((insight, i) => {
          const { Icon, color, bg } = TYPE_META[insight.type] ?? TYPE_META.tip
          return (
            <div key={insight.id} className="ai-insight-pill">
              <span className="ai-insight-pill__icon" style={{ background: bg, color }}>
                <Icon size={14} aria-hidden="true" />
              </span>
              <p>
                <strong style={{ color }}>{insight.highlight}</strong>
                {' '}{insight.text}
              </p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
