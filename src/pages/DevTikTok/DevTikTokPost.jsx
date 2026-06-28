import { useState, useEffect, useRef } from 'react'
import './DevTikTok.css'

const DEFAULT_API = 'https://hubstudio.onrender.com'
const POLL_INTERVAL_MS = 4000

export default function DevTikTokPost() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [jwt, setJwt] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [title, setTitle] = useState('')
  const [step, setStep] = useState('idle')
  const [result, setResult] = useState(null)
  const [statusResult, setStatusResult] = useState(null)
  const [error, setError] = useState('')
  const [log, setLog] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const pollingRef = useRef(null)
  const pollCountRef = useRef(0)

  // Scheduling
  const [mode, setMode] = useState('now') // 'now' | 'schedule'
  const [scheduledAt, setScheduledAt] = useState('')
  const [accounts, setAccounts] = useState([])
  const [selectedAccounts, setSelectedAccounts] = useState([])
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const checkStatus = async (postPlatformId, jwtToken, base) => {
    pollCountRef.current += 1
    try {
      const res = await fetch(
        `${base}/posts/${postPlatformId}/publish/tiktok/status?postPlatformId=${postPlatformId}`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))

      addLog(`Polling #${pollCountRef.current} → status: ${data.status}${data.errorMessage ? ' | erro: ' + data.errorMessage : ''}`, data.status === 'POSTED' ? 'success' : 'info')
      setStatusResult(data)

      if (data.status === 'POSTED') {
        stopPolling()
        setStep('done')
      } else if (data.status === 'ERROR') {
        stopPolling()
        setError(data.errorMessage ?? 'Erro ao publicar no TikTok')
        setStep('error')
      } else if (pollCountRef.current >= 15) {
        stopPolling()
        addLog('Timeout: TikTok não confirmou após 15 tentativas. Verifique manualmente.', 'error')
        setStep('error')
        setError('Timeout aguardando confirmação do TikTok')
      }
    } catch (err) {
      addLog(`Erro no polling #${pollCountRef.current}: ${err.message}`, 'error')
    }
  }

  useEffect(() => {
    if (step === 'posting' && result?.id) {
      pollCountRef.current = 0
      addLog('Iniciando polling automático a cada 4s…', 'info')
      checkStatus(result.id, jwt, apiBase)
      pollingRef.current = setInterval(() => checkStatus(result.id, jwt, apiBase), POLL_INTERVAL_MS)
    }
    return () => stopPolling()
  }, [step, result?.id])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Selecione um arquivo de vídeo válido')
        return
      }
      setVideoFile(file)
      setError('')
      addLog(`Vídeo selecionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`, 'success')
    }
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

    setError('')
    setLog([])
    setResult(null)
    setStatusResult(null)
    setStep('loading')
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
      endpoint = `${apiBase}/posts/publish/tiktok/video`
      addLog(`POST → ${endpoint}`)
    }

    try {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
          if (percent < 100) addLog(`Upload: ${percent}%`, 'info')
        }
      })

      xhr.upload.addEventListener('load', () => {
        setUploadProgress(100)
        setStep('processing')
        addLog(mode === 'schedule'
          ? 'Arquivo enviado — registrando agendamento…'
          : 'Arquivo enviado — servidor processando (S3 + TikTok)…', 'info')
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
              addLog(`Publicado no TikTok ✓ — publishId: ${data.publishId ?? '(aguardando)'}`, 'success')
              setStep('done')
            } else if (data.status === 'ERROR') {
              addLog(`Erro TikTok: ${data.errorMessage}`, 'error')
              setError(data.errorMessage)
              setStep('error')
            } else {
              addLog(`Status: ${data.status} — publishId: ${data.publishId ?? '(aguardando)'}`, 'info')
              setStep('posting')
            }
          } catch (e) {
            setError('Erro ao processar resposta do servidor')
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
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
      setStep('error')
    }
  }

  const handleReset = () => {
    stopPolling()
    setStep('idle')
    setVideoFile(null)
    setTitle('')
    setResult(null)
    setStatusResult(null)
    setError('')
    setLog([])
    setUploadProgress(0)
    setScheduledAt('')
    setSelectedAccounts([])
  }

  const isIdle = step === 'idle' || step === 'error'
  const currentStatus = result?.status

  return (
    <div className="devtk-root">
      <div className="devtk-card">
        <div className="devtk-header">
          <span className="devtk-badge">DEV</span>
          <h1>Teste Publicação com Upload — TikTok</h1>
          <p>Faz upload do vídeo, publica no TikTok e deleta do S3 automaticamente.</p>
        </div>

        <section className="devtk-section">
          <label className="devtk-label">URL do Backend</label>
          <input className="devtk-input" value={apiBase} onChange={e => setApiBase(e.target.value)} />
        </section>

        <section className="devtk-section">
          <label className="devtk-label">JWT Token</label>
          <textarea
            className="devtk-textarea"
            value={jwt}
            onChange={e => setJwt(e.target.value)}
            placeholder="Cole o token do POST /auth/login"
            rows={3}
          />
        </section>

        {/* Mode Toggle */}
        <section className="devtk-section">
          <label className="devtk-label">Modo</label>
          <div className="devtk-toggle-group">
            <button
              className={`devtk-toggle-btn ${mode === 'now' ? 'active' : ''}`}
              onClick={() => setMode('now')}
              disabled={!isIdle}
            >
              Publicar agora
            </button>
            <button
              className={`devtk-toggle-btn ${mode === 'schedule' ? 'active' : ''}`}
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
            <section className="devtk-section">
              <label className="devtk-label">Data e Hora do Agendamento</label>
              <input
                type="datetime-local"
                className="devtk-input"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                disabled={!isIdle}
                min={(() => { const d = new Date(Date.now() + 5 * 60_000); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) })()}
              />
            </section>

            <section className="devtk-section">
              <label className="devtk-label">Contas Sociais</label>
              <button
                className="devtk-btn ghost"
                style={{ marginBottom: 10 }}
                onClick={loadAccounts}
                disabled={loadingAccounts || !isIdle}
              >
                {loadingAccounts ? 'Carregando…' : 'Carregar contas'}
              </button>
              {accounts.length > 0 && (
                <div className="devtk-accounts-list">
                  {accounts.map(acc => (
                    <label key={acc.id} className="devtk-account-item">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(acc.id)}
                        onChange={() => toggleAccount(acc.id)}
                        disabled={!isIdle}
                      />
                      <span>{acc.platform} — {acc.username ?? acc.id}</span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        <section className="devtk-section">
          <label className="devtk-label">Selecionar Vídeo</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={!isIdle}
            className="devtk-file-input"
          />
          {videoFile && (
            <div className="devtk-file-info">
              ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)}MB)
            </div>
          )}
        </section>

        <section className="devtk-section">
          <label className="devtk-label">Título / Legenda (opcional)</label>
          <input
            className="devtk-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Meu vídeo no TikTok"
            disabled={!isIdle}
          />
        </section>

        {/* Steps */}
        <div className="devtk-steps">
          {mode === 'now' ? (
            <>
              <Step num={1} active={['idle','loading','processing','error'].includes(step)} done={['posting','done'].includes(step)}>
                Upload → S3 → TikTok
              </Step>
              <Step num={2} active={step === 'posting'} done={step === 'done'}>
                Aguardar publicação no TikTok
              </Step>
            </>
          ) : (
            <>
              <Step num={1} active={['idle','loading','error'].includes(step)} done={['processing','scheduled'].includes(step)}>
                Upload → S3
              </Step>
              <Step num={2} active={step === 'processing'} done={step === 'scheduled'}>
                Registrar agendamento
              </Step>
            </>
          )}
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="devtk-progress">
            <div className="devtk-progress-bar">
              <div className="devtk-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <span className="devtk-progress-text">{uploadProgress}%</span>
          </div>
        )}

        {/* Actions */}
        <div className="devtk-actions">
          {isIdle && (
            <button className="devtk-btn tiktok" onClick={handlePublish}>
              {mode === 'schedule' ? 'Agendar publicação' : 'Publicar no TikTok'}
            </button>
          )}
          {step === 'loading' && (
            <button className="devtk-btn primary" disabled>Enviando arquivo… {uploadProgress}%</button>
          )}
          {step === 'processing' && (
            <button className="devtk-btn primary" disabled>Processando no servidor…</button>
          )}
          {step === 'posting' && (
            <button className="devtk-btn primary" disabled>
              Aguardando TikTok processar… (polling automático)
            </button>
          )}
          {step === 'scheduled' && (
            <div className="devtk-success-banner">
              Publicação agendada com sucesso!
            </div>
          )}
          {step === 'done' && (
            <>
              <div className="devtk-success-banner">✓ Vídeo publicado com sucesso no TikTok!</div>
              <a href="/dev/tiktok/metrics" className="devtk-btn primary">Ver métricas →</a>
            </>
          )}
          {step !== 'idle' && (
            <button className="devtk-btn ghost" onClick={handleReset}>Recomeçar</button>
          )}
        </div>

        {/* Result */}
        {result && (
          <section className="devtk-section">
            <label className="devtk-label">Resultado</label>
            {mode === 'schedule' ? (
              <div className="devtk-result-grid">
                <ResultRow label="Post ID" value={result.postId} />
                <ResultRow label="Status" value={<StatusChip status="SCHEDULED" />} />
                <ResultRow label="Agendado para" value={result.scheduledAt ? new Date(result.scheduledAt).toLocaleString('pt-BR') : '—'} />
                <ResultRow label="Plataformas" value={result.platforms?.map(p => p.platform).join(', ') ?? '—'} />
              </div>
            ) : (
              <div className="devtk-result-grid">
                <ResultRow label="postPlatformId" value={result.postPlatformId} />
                <ResultRow label="publishId (TikTok)" value={result.publishId ?? '—'} />
                <ResultRow label="Status" value={<StatusChip status={currentStatus} />} />
                {result.errorMessage && <ResultRow label="Erro" value={result.errorMessage} error />}
              </div>
            )}
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="devtk-error"><strong>Erro:</strong> {error}</div>
        )}

        {/* Log */}
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
          <a href="/dev/tiktok" className="devtk-btn ghost">← Voltar para OAuth</a>
        </div>
      </div>
    </div>
  )
}

function Step({ num, active, done, children }) {
  return (
    <div className={`devtk-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
      <div className="devtk-step-num">{done ? '✓' : num}</div>
      <div className="devtk-step-label">{children}</div>
    </div>
  )
}

function ResultRow({ label, value, error }) {
  return (
    <div className="devtk-result-row">
      <span className="devtk-result-label">{label}</span>
      <span className={`devtk-result-value ${error ? 'error' : ''}`}>{value}</span>
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
