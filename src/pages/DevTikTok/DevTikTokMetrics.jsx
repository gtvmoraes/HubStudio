import { useState } from 'react'
import './DevTikTok.css'

const DEFAULT_API = 'https://hubstudio.onrender.com'

export default function DevTikTokMetrics() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [jwt, setJwt] = useState('')
  const [postPlatformId, setPostPlatformId] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [log, setLog] = useState([])

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const collect = async () => {
    if (!jwt.trim()) { setError('Cole um JWT válido.'); return }
    if (!postPlatformId.trim()) { setError('Informe o postPlatformId.'); return }
    setError(''); setLoading(true)
    addLog(`POST → /posts/${postPlatformId}/metrics/tiktok/collect`)
    try {
      const res = await fetch(`${apiBase}/posts/${postPlatformId}/metrics/tiktok/collect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt.trim()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))
      addLog(`${data.length} coleta(s) no histórico`, 'success')
      setHistory(data)
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    if (!jwt.trim()) { setError('Cole um JWT válido.'); return }
    if (!postPlatformId.trim()) { setError('Informe o postPlatformId.'); return }
    setError(''); setLoading(true)
    addLog(`GET → /posts/${postPlatformId}/metrics/tiktok`)
    try {
      const res = await fetch(`${apiBase}/posts/${postPlatformId}/metrics/tiktok`, {
        headers: { Authorization: `Bearer ${jwt.trim()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))
      addLog(`${data.length} coleta(s) carregadas`, 'success')
      setHistory(data)
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const latest = history[0]

  return (
    <div className="devtk-root">
      <div className="devtk-card">
        <div className="devtk-header">
          <span className="devtk-badge">DEV</span>
          <h1>Métricas TikTok</h1>
          <p>Coleta e exibe o histórico de métricas de um vídeo publicado no TikTok.</p>
        </div>

        <section className="devtk-section">
          <label className="devtk-label">URL do Backend</label>
          <input className="devtk-input" value={apiBase} onChange={e => setApiBase(e.target.value)} />
        </section>

        <section className="devtk-section">
          <label className="devtk-label">JWT Token</label>
          <textarea className="devtk-textarea" value={jwt} onChange={e => setJwt(e.target.value)}
            placeholder="Cole o token do POST /auth/login" rows={3} />
        </section>

        <section className="devtk-section">
          <label className="devtk-label">postPlatformId</label>
          <input className="devtk-input" value={postPlatformId} onChange={e => setPostPlatformId(e.target.value)}
            placeholder="UUID retornado após publicar o vídeo" />
        </section>

        <div className="devtk-actions">
          <button className="devtk-btn tiktok" onClick={collect} disabled={loading}>
            {loading ? 'Coletando…' : '↓ Coletar métricas agora'}
          </button>
          <button className="devtk-btn primary" onClick={loadHistory} disabled={loading}>
            {loading ? 'Carregando…' : 'Ver histórico salvo'}
          </button>
        </div>

        {error && <div className="devtk-error"><strong>Erro:</strong> {error}</div>}

        {latest && (
          <section className="devtk-section">
            <label className="devtk-label">Última coleta — {fmt(latest.collectedAt)}</label>
            <div className="metrics-grid">
              <MetricCard label="Views" value={latest.views} icon="👁" />
              <MetricCard label="Likes" value={latest.likes} icon="❤️" />
              <MetricCard label="Comentários" value={latest.comments} icon="💬" />
              <MetricCard label="Compartilhamentos" value={latest.shares} icon="↗" />
            </div>
          </section>
        )}

        {history.length > 1 && (
          <section className="devtk-section">
            <label className="devtk-label">Histórico ({history.length} coletas)</label>
            <div className="devtk-log" style={{ maxHeight: 300 }}>
              <div className="metrics-history-header">
                <span>Data</span><span>Views</span><span>Likes</span><span>Coments.</span><span>Shares</span>
              </div>
              {history.map(h => (
                <div key={h.id} className="metrics-history-row">
                  <span>{fmt(h.collectedAt)}</span>
                  <span>{h.views ?? 0}</span>
                  <span>{h.likes ?? 0}</span>
                  <span>{h.comments ?? 0}</span>
                  <span>{h.shares ?? 0}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {log.length > 0 && (
          <section className="devtk-section">
            <label className="devtk-label">Log</label>
            <div className="devtk-log">
              {log.map((l, i) => (
                <div key={i} className={`devtk-log-line ${l.type}`}>
                  <span className="devtk-log-time">{l.time}</span>
                  <span>{l.msg}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="devtk-nav">
          <a href="/dev/tiktok/post" className="devtk-btn ghost">← Voltar para Publicação</a>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="metric-card">
      <span className="metric-icon">{icon}</span>
      <span className="metric-value">{value ?? 0}</span>
      <span className="metric-label">{label}</span>
    </div>
  )
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}
