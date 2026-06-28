import { useState } from 'react'
import './DevYouTube.css'

const DEFAULT_API = 'https://hubstudio.onrender.com'

export default function DevYouTubePost() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [jwt, setJwt] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [title, setTitle] = useState('')
  const [step, setStep] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [log, setLog] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)

  // Scheduling
  const [mode, setMode] = useState('now') // 'now' | 'schedule'
  const [scheduledAt, setScheduledAt] = useState('')
  const [accounts, setAccounts] = useState([])
  const [selectedAccounts, setSelectedAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      setError('Selecione um arquivo de vídeo válido.')
      return
    }
    setVideoFile(file)
    setError('')
    addLog(`Vídeo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'success')
  }

  const loadAccounts = async () => {
    if (!jwt.trim()) { setError('Cole um JWT válido antes de carregar contas.'); return }
    setLoadingAccounts(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/social/accounts`, {
        headers: { Authorization: `Bearer ${jwt.trim()}` }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAccounts(data)
      addLog(`${data.length} conta(s) carregada(s)`, 'success')
    } catch (err) {
      setError('Erro ao carregar contas: ' + err.message)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const toggleAccount = (id) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const handlePublish = async () => {
    if (!jwt.trim()) { setError('Cole um JWT válido.'); return }
    if (!videoFile) { setError('Selecione um arquivo de vídeo.'); return }
    if (mode === 'schedule') {
      if (!scheduledAt) { setError('Selecione a data e hora do agendamento.'); return }
      if (selectedAccounts.length === 0) { setError('Selecione ao menos uma conta social.'); return }
    }

    setStep('loading')
    setError('')
    setLog([])
    setResult(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('video', videoFile)
    formData.append('title', title.trim())

    let endpoint
    if (mode === 'schedule') {
      const isoDate = new Date(scheduledAt).toISOString().replace('Z', '')
      formData.append('scheduledAt', isoDate)
      selectedAccounts.forEach(id => formData.append('socialAccountIds', id))
      endpoint = `${apiBase}/posts/schedule/video`
      addLog(`POST → ${endpoint} (agendamento: ${scheduledAt})`)
    } else {
      endpoint = `${apiBase}/posts/publish/youtube/video`
      addLog(`POST → ${endpoint}`)
    }

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        setUploadProgress(pct)
        if (pct < 100) addLog(`Upload: ${pct}%`)
      }
    })

    xhr.upload.addEventListener('load', () => {
      setUploadProgress(100)
      setStep('processing')
      addLog(mode === 'schedule'
        ? 'Arquivo enviado — registrando agendamento…'
        : 'Arquivo enviado — backend fazendo upload para o YouTube…', 'info')
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          setResult(data)
          if (mode === 'schedule') {
            addLog(`Agendado com sucesso! scheduledAt: ${data.scheduledAt}`, 'success')
            setStep('scheduled')
          } else if (data.status === 'POSTED') {
            addLog(`Publicado no YouTube ✓ — videoId: ${data.externalPostId}`, 'success')
            setStep('done')
          } else if (data.status === 'ERROR') {
            addLog(`Erro YouTube: ${data.errorMessage}`, 'error')
            setError(data.errorMessage)
            setStep('error')
          } else {
            addLog(`Status: ${data.status}`, 'info')
            setStep('done')
          }
        } catch (_) {
          setError('Resposta inesperada do servidor')
          setStep('error')
        }
      } else {
        const raw = xhr.responseText?.slice(0, 300) ?? '(sem resposta)'
        let msg = `Erro HTTP ${xhr.status}`
        try {
          const data = JSON.parse(xhr.responseText)
          msg = data.message ?? data.error ?? JSON.stringify(data)
        } catch (_) {}
        addLog(`Erro ${xhr.status}: ${msg}`, 'error')
        addLog(`Resposta bruta: ${raw}`, 'error')
        setError(msg)
        setStep('error')
      }
    })

    xhr.addEventListener('error', () => {
      addLog('Erro de rede', 'error')
      setError('Erro ao conectar com o servidor')
      setStep('error')
    })

    xhr.open('POST', endpoint)
    xhr.setRequestHeader('Authorization', `Bearer ${jwt.trim()}`)
    xhr.send(formData)
  }

  const handleReset = () => {
    setStep('idle')
    setVideoFile(null)
    setTitle('')
    setResult(null)
    setError('')
    setLog([])
    setUploadProgress(0)
    setScheduledAt('')
    setSelectedAccounts([])
  }

  const isIdle = step === 'idle' || step === 'error'

  return (
    <div className="devyt-root">
      <div className="devyt-card">
        <div className="devyt-header">
          <span className="devyt-badge">DEV</span>
          <h1>Teste Publicação com Upload — YouTube</h1>
          <p>Faz upload do vídeo, envia para o S3 e publica no canal do YouTube conectado.</p>
        </div>

        <section className="devyt-section">
          <label className="devyt-label">URL do Backend</label>
          <input
            className="devyt-input"
            value={apiBase}
            onChange={e => setApiBase(e.target.value)}
          />
        </section>

        <section className="devyt-section">
          <label className="devyt-label">JWT Token</label>
          <textarea
            className="devyt-textarea"
            value={jwt}
            onChange={e => setJwt(e.target.value)}
            placeholder="Cole o token do POST /auth/login"
            rows={3}
          />
        </section>

        {/* Mode Toggle */}
        <section className="devyt-section">
          <label className="devyt-label">Modo</label>
          <div className="devyt-toggle-group">
            <button
              className={`devyt-toggle-btn ${mode === 'now' ? 'active' : ''}`}
              onClick={() => setMode('now')}
              disabled={!isIdle}
            >
              Publicar agora
            </button>
            <button
              className={`devyt-toggle-btn ${mode === 'schedule' ? 'active' : ''}`}
              onClick={() => setMode('schedule')}
              disabled={!isIdle}
            >
              Agendar
            </button>
          </div>
        </section>

        {/* Scheduling Fields */}
        {mode === 'schedule' && (
          <>
            <section className="devyt-section">
              <label className="devyt-label">Data e Hora do Agendamento</label>
              <input
                type="datetime-local"
                className="devyt-input"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                disabled={!isIdle}
                min={(() => { const d = new Date(Date.now() + 5 * 60_000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) })()}
              />
            </section>

            <section className="devyt-section">
              <label className="devyt-label">Contas Sociais</label>
              <button
                className="devyt-btn ghost"
                style={{ marginBottom: 10 }}
                onClick={loadAccounts}
                disabled={loadingAccounts || !isIdle}
              >
                {loadingAccounts ? 'Carregando…' : 'Carregar contas'}
              </button>
              {accounts.length > 0 && (
                <div className="devyt-accounts-list">
                  {accounts.map(acc => (
                    <label key={acc.id} className="devyt-account-item">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(acc.id)}
                        onChange={() => toggleAccount(acc.id)}
                        disabled={!isIdle}
                      />
                      <span>{acc.platform} — {acc.accountName ?? acc.id}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <section className="devyt-section">
          <label className="devyt-label">Selecionar Vídeo</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={!isIdle}
            className="devyt-file-input"
          />
          {videoFile && (
            <div className="devyt-file-info">
              ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </section>

        <section className="devyt-section">
          <label className="devyt-label">Título (opcional)</label>
          <input
            className="devyt-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título do vídeo no YouTube"
            disabled={!isIdle}
          />
        </section>

        <div className="devyt-steps">
          {mode === 'now' ? (
            <>
              <Step num={1} active={['idle','loading','error'].includes(step)} done={['processing','done'].includes(step)}>
                Upload do vídeo → S3
              </Step>
              <Step num={2} active={step === 'processing'} done={step === 'done'}>
                Backend publica no YouTube
              </Step>
            </>
          ) : (
            <>
              <Step num={1} active={['idle','loading','error'].includes(step)} done={['processing','scheduled'].includes(step)}>
                Upload do vídeo → S3
              </Step>
              <Step num={2} active={step === 'processing'} done={step === 'scheduled'}>
                Registrar agendamento
              </Step>
            </>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="devyt-progress">
            <div className="devyt-progress-bar">
              <div className="devyt-progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className="devyt-progress-text">{uploadProgress}%</span>
          </div>
        )}

        <div className="devyt-actions">
          {isIdle && (
            <button className="devyt-btn youtube" onClick={handlePublish}>
              {mode === 'schedule' ? 'Agendar publicação' : 'Publicar no YouTube'}
            </button>
          )}
          {step === 'loading' && (
            <button className="devyt-btn youtube" disabled>
              Enviando arquivo… {uploadProgress}%
            </button>
          )}
          {step === 'processing' && (
            <button className="devyt-btn youtube" disabled>
              {mode === 'schedule' ? 'Registrando agendamento…' : 'YouTube processando…'}
            </button>
          )}
          {step === 'scheduled' && (
            <div className="devyt-success-banner">
              Publicação agendada com sucesso!
            </div>
          )}
          {step === 'done' && (
            <div className="devyt-success-banner">✓ Vídeo publicado no YouTube com sucesso!</div>
          )}
          {step !== 'idle' && (
            <button className="devyt-btn ghost" onClick={handleReset}>Recomeçar</button>
          )}
        </div>

        {result && (
          <section className="devyt-section">
            <label className="devyt-label">Resultado</label>
            {mode === 'schedule' ? (
              <div className="devyt-result-grid">
                <ResultRow label="Post ID" value={result.postId} />
                <ResultRow label="Status" value={<StatusChip status="SCHEDULED" />} />
                <ResultRow label="Agendado para" value={result.scheduledAt ? new Date(result.scheduledAt).toLocaleString('pt-BR') : '—'} />
                <ResultRow label="Plataformas" value={result.platforms?.map(p => p.platform).join(', ') ?? '—'} />
              </div>
            ) : (
              <div className="devyt-result-grid">
                <ResultRow label="postPlatformId" value={result.postPlatformId} />
                <ResultRow label="YouTube Video ID" value={result.externalPostId ?? '—'} />
                <ResultRow label="Status" value={<StatusChip status={result.status} />} />
                {result.errorMessage && <ResultRow label="Erro" value={result.errorMessage} error />}
              </div>
            )}
            {result.externalPostId && (
              <a
                href={`https://studio.youtube.com/video/${result.externalPostId}/edit`}
                target="_blank"
                rel="noopener noreferrer"
                className="devyt-btn youtube"
                style={{ marginTop: 10, fontSize: 12 }}
              >
                Abrir no YouTube Studio →
              </a>
            )}
          </section>
        )}

        {error && (
          <div className="devyt-error"><strong>Erro:</strong> {error}</div>
        )}

        {log.length > 0 && (
          <section className="devyt-section">
            <label className="devyt-label">Log</label>
            <div className="devyt-log">
              {log.map((l, i) => (
                <div key={i} className={`devyt-log-line ${l.type}`}>
                  <span className="devyt-log-time">{l.time}</span>
                  <span>{l.msg}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="devyt-nav">
          <a href="/dev/youtube" className="devyt-btn ghost">← Voltar para OAuth</a>
        </div>
      </div>
    </div>
  )
}

function Step({ num, active, done, children }) {
  return (
    <div className={`devyt-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
      <div className="devyt-step-num">{done ? '✓' : num}</div>
      <div className="devyt-step-label">{children}</div>
    </div>
  )
}

function ResultRow({ label, value, error }) {
  return (
    <div className="devyt-result-row">
      <span className="devyt-result-label">{label}</span>
      <span className={`devyt-result-value ${error ? 'error' : ''}`}>{value}</span>
    </div>
  )
}

function StatusChip({ status }) {
  const map = {
    DRAFT:      { color: '#888', bg: '#1a1a1a' },
    SCHEDULED:  { color: '#60a5fa', bg: '#0a1628' },
    POSTING:    { color: '#f97316', bg: '#1c0f00' },
    POSTED:     { color: '#4ade80', bg: '#052e16' },
    ERROR:      { color: '#f87171', bg: '#1a0a0a' },
  }
  const s = map[status] ?? map.DRAFT
  return (
    <span style={{ color: s.color, background: s.bg, padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      {status ?? '—'}
    </span>
  )
}
