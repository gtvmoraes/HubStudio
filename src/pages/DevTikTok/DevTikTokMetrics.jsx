import { useState } from 'react'
import './DevTikTok.css'

const DEFAULT_API = 'https://hubstudio.onrender.com'

export default function DevTikTokMetrics() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [jwt, setJwt] = useState('')
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [log, setLog] = useState([])

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const loadPosts = async () => {
    if (!jwt.trim()) { setError('Cole um JWT válido.'); return }
    setError(''); setLoading(true)
    addLog('GET → /metrics/tiktok/posts')
    try {
      const res = await fetch(`${apiBase}/metrics/tiktok/posts`, {
        headers: { Authorization: `Bearer ${jwt.trim()}` }
      })
      addLog(`HTTP ${res.status}`, res.ok ? 'info' : 'error')
      const text = await res.text()
      addLog(`Resposta: ${text.slice(0, 200) || '(vazia)'}`, res.ok ? 'info' : 'error')
      if (!text) throw new Error(`Resposta vazia — HTTP ${res.status}`)
      const data = JSON.parse(text)
      if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))
      addLog(`${data.length} post(s) encontrado(s)`, 'success')
      setPosts(data)
      setSelected(null)
      setHistory([])
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
    } finally { setLoading(false) }
  }

  const selectPost = (post) => {
    setSelected(post)
    setHistory([])
    setError('')
    addLog(`Selecionado: ${post.postPlatformId}`)
  }

  const collect = async () => {
    if (!selected) return
    setError(''); setLoading(true)
    addLog(`POST → /posts/${selected.postPlatformId}/metrics/tiktok/collect`)
    try {
      const res = await fetch(`${apiBase}/posts/${selected.postPlatformId}/metrics/tiktok/collect`, {
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
    } finally { setLoading(false) }
  }

  const loadHistory = async () => {
    if (!selected) return
    setError(''); setLoading(true)
    addLog(`GET → /posts/${selected.postPlatformId}/metrics/tiktok`)
    try {
      const res = await fetch(`${apiBase}/posts/${selected.postPlatformId}/metrics/tiktok`, {
        headers: { Authorization: `Bearer ${jwt.trim()}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))
      addLog(`${data.length} coleta(s) carregadas`, 'success')
      setHistory(data)
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
    } finally { setLoading(false) }
  }

  const latest = history[0]

  return (
    <div className="devtk-root">
      <div className="devtk-card">
        <div className="devtk-header">
          <span className="devtk-badge">DEV</span>
          <h1>Métricas TikTok</h1>
          <p>Selecione um post publicado para coletar e visualizar o histórico de métricas.</p>
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

        <div className="devtk-actions">
          <button className="devtk-btn primary" onClick={loadPosts} disabled={loading}>
            {loading && !selected ? 'Carregando…' : '↓ Listar posts TikTok'}
          </button>
        </div>

        {posts.length > 0 && (
          <section className="devtk-section">
            <label className="devtk-label">Posts publicados ({posts.length})</label>
            <div className="posts-list">
              {posts.map(p => (
                <div
                  key={p.postPlatformId}
                  className={`post-item ${selected?.postPlatformId === p.postPlatformId ? 'selected' : ''}`}
                  onClick={() => selectPost(p)}
                >
                  <div className="post-item-header">
                    <StatusChip status={p.status} />
                    <span className="post-item-date">{fmt(p.postedAt)}</span>
                  </div>
                  <div className="post-item-content">{p.content || '(sem legenda)'}</div>
                  <div className="post-item-id">
                    <span className="id-label">postPlatformId</span>
                    <code>{p.postPlatformId}</code>
                  </div>
                  {p.publishId && (
                    <div className="post-item-id">
                      <span className="id-label">publishId</span>
                      <code>{p.publishId}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {selected && (
          <>
            <section className="devtk-section">
              <label className="devtk-label">Post selecionado</label>
              <div className="devtk-result-grid">
                <ResultRow label="postPlatformId" value={selected.postPlatformId} />
                <ResultRow label="publishId" value={selected.publishId ?? '—'} />
                <ResultRow label="videoId" value={selected.tiktokVideoId ?? '(ainda não resolvido)'} />
                <ResultRow label="Status" value={<StatusChip status={selected.status} />} />
              </div>
            </section>

            <div className="devtk-actions">
              <button className="devtk-btn tiktok" onClick={collect} disabled={loading}>
                {loading ? 'Coletando…' : '↓ Coletar métricas agora'}
              </button>
              <button className="devtk-btn primary" onClick={loadHistory} disabled={loading}>
                Ver histórico salvo
              </button>
            </div>
          </>
        )}

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

function ResultRow({ label, value }) {
  return (
    <div className="devtk-result-row">
      <span className="devtk-result-label">{label}</span>
      <span className="devtk-result-value">{value}</span>
    </div>
  )
}

function StatusChip({ status }) {
  const map = {
    DRAFT: { color: '#888', bg: '#1a1a1a' },
    POSTING: { color: '#f97316', bg: '#1c0f00' },
    POSTED: { color: '#4ade80', bg: '#052e16' },
    ERROR: { color: '#f87171', bg: '#1a0a0a' },
  }
  const s = map[status] ?? map.DRAFT
  return (
    <span style={{ color: s.color, background: s.bg, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      {status ?? '—'}
    </span>
  )
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR')
}
