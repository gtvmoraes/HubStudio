import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

const GRANULARITIES = [
  { label: 'Diário',  value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensal',  value: 'monthly' },
]

const METRICS = [
  { key: 'views',    label: 'Visualizações', color: '#4F35E8' },
  { key: 'likes',    label: 'Curtidas',      color: '#E84FA5' },
  { key: 'comments', label: 'Comentários',   color: '#10B981' },
]

const fmtCompact = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return `${Math.round(n)}`
}

const PERIOD_WORD = { daily: 'dia', weekly: 'semana', monthly: 'mês' }

function MetricTooltip({ active, payload, label, color, metricLabel }) {
  if (!active || !payload?.length) return null
  return (
    <div className="eng-tooltip">
      <span className="eng-tooltip__date">{label}</span>
      <span className="eng-tooltip__value" style={{ color }}>
        <span className="eng-tooltip__dot" style={{ background: color }} />
        {metricLabel}: <strong>{payload[0].value.toLocaleString('pt-BR')}</strong>
      </span>
    </div>
  )
}

export default function EngagementChart({ data, granularity, onGranularityChange }) {
  const [metricKey, setMetricKey] = useState('views')
  const isEmpty = !data || data.length === 0

  const totals = useMemo(() => {
    const acc = { views: 0, likes: 0, comments: 0 }
    data?.forEach(d => {
      acc.views += d.views || 0
      acc.likes += d.likes || 0
      acc.comments += d.comments || 0
    })
    return acc
  }, [data])

  const metric = METRICS.find(m => m.key === metricKey)

  // Contexto que reconcilia o total (no card) com a escala do gráfico (por período)
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null
    const vals = data.map(d => d[metricKey] || 0)
    return {
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      max: Math.max(...vals),
    }
  }, [data, metricKey])

  return (
    <motion.div
      className="chart-card eng-chart"
      variants={fadeUp} initial="hidden" animate="visible" custom={5}
    >
      <div className="chart-card__header">
        <h3>Engajamento ao longo do tempo</h3>
        <div className="chart-card__period">
          {GRANULARITIES.map(g => (
            <button
              key={g.value}
              type="button"
              className={`chart-card__period-btn ${granularity === g.value ? 'chart-card__period-btn--active' : ''}`}
              onClick={() => onGranularityChange(g.value)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seletor de métrica — funciona como legenda + resumo + filtro */}
      <div className="eng-metrics">
        {METRICS.map(m => (
          <button
            key={m.key}
            type="button"
            className={`eng-metric ${metricKey === m.key ? 'eng-metric--active' : ''}`}
            style={{ '--metric': m.color }}
            onClick={() => setMetricKey(m.key)}
          >
            <span className="eng-metric__top">
              <span className="eng-metric__dot" style={{ background: m.color }} />
              {m.label}
            </span>
            <span className="eng-metric__value">{fmtCompact(totals[m.key])}</span>
            <span className="eng-metric__caption">total no período</span>
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="chart-card__empty">Sem dados para o período selecionado.</div>
      ) : (
        <>
          {stats && (
            <div className="eng-summary">
              <span className="eng-summary__dot" style={{ background: metric.color }} />
              {metric.label} por {PERIOD_WORD[granularity]}:
              <strong>{fmtCompact(stats.avg)}</strong> em média
              <span className="eng-summary__sep">·</span>
              pico de <strong>{fmtCompact(stats.max)}</strong>
            </div>
          )}
          <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="engFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={metric.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              dy={6}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
              tickFormatter={fmtCompact}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<MetricTooltip color={metric.color} metricLabel={metric.label} />}
              cursor={{ stroke: metric.color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey={metricKey}
              stroke={metric.color}
              strokeWidth={2.5}
              fill="url(#engFill)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--color-card-bg)', fill: metric.color }}
            />
          </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </motion.div>
  )
}
