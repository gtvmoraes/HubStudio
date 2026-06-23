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

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  const checkStatus = async (postPlatformId, jwtToken, base) => {
    try {
      const res = await fetch(
        `${base}/posts/${postPlatformId}/publish/tiktok/status?postPlatformId=${postPlatformId}`,
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? JSON.stringify(data))

      addLog(`Polling status: ${data.status}`, data.status === 'POSTED' ? 'success' : 'info')
      setStatusResult(data)

      if (data.status === 'POSTED') {
        stopPolling()
        setStep('done')
      } else if (data.status === 'ERROR') {
        stopPolling()
        setError(data.errorMessage ?? 'Erro ao publicar no TikTok')
        setStep('error')
      }
    } catch (err) {
      addLog(`Erro no polling: ${err.message}`, 'error')
    }
  }

  useEffect(() => {
    if (step === 'posting' && result?.id) {
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

  const handlePublish = async () => {
    if (!jwt.trim()) { setError('Cole um JWT válido.'); return }
    if (!videoFile) { setError('Selecione um arquivo de vídeo.'); return }

    setError('')
    setLog([])
    setResult(null)
    setStatusResult(null)
    setStep('loading')
    setUploadProgress(0)

    addLog(`POST → ${apiBase}/posts/publish/tiktok/video`)

    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      formData.append('title', title.trim())

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percent)
          addLog(`Upload: ${percent}%`, 'info')
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            addLog(`Publicação iniciada ✓ — publishId: ${data.externalPostId ?? '(aguardando)'}`, 'success')
            setResult(data)
            setStep('posting')
          } catch (e) {
            setError('Erro ao processar resposta do servidor')
            setStep('error')
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText)
            addLog(`Erro ${xhr.status}: ${data.message}`, 'error')
            setError(data.message)
          } catch (e) {
            addLog(`Erro ${xhr.status}`, 'error')
            setError(`Erro HTTP ${xhr.status}`)
          }
          setStep('error')
        }
      })

      xhr.addEventListener('error', () => {
        addLog('Erro de rede', 'error')
        setError('Erro ao conectar com o servidor')
        setStep('error')
      })

      xhr.open('POST', `${apiBase}/posts/publish/tiktok/video`)
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
  }

  const currentStatus = statusResult?.status ?? result?.status

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

        <section className="devtk-section">
          <label className="devtk-label">Selecionar Vídeo</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={step !== 'idle' && step !== 'error'}
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
            disabled={step !== 'idle' && step !== 'error'}
          />
        </section>

        {/* Steps */}
        <div className="devtk-steps">
          <Step num={1} active={step === 'idle' || step === 'loading' || step === 'error'} done={['posting','checking','done'].includes(step)}>
            Upload → S3 → TikTok → Delete S3
          </Step>
          <Step num={2} active={['posting','checking'].includes(step)} done={step === 'done'}>
            Aguardar publicação no TikTok
          </Step>
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
          {(step === 'idle' || step === 'error') && (
            <button className="devtk-btn tiktok" onClick={handlePublish}>
              Publicar no TikTok
            </button>
          )}
          {step === 'loading' && (
            <button className="devtk-btn primary" disabled>Upload em andamento…</button>
          )}
          {step === 'posting' && (
            <button className="devtk-btn primary" disabled>
              ⏳ Aguardando TikTok processar… (polling automático)
            </button>
          )}
          {step === 'done' && (
            <div className="devtk-success-banner">✓ Vídeo publicado com sucesso no TikTok!</div>
          )}
          {step !== 'idle' && (
            <button className="devtk-btn ghost" onClick={handleReset}>Recomeçar</button>
          )}
        </div>

        {/* Result */}
        {(result || statusResult) && (
          <section className="devtk-section">
            <label className="devtk-label">Resultado</label>
            <div className="devtk-result-grid">
              <ResultRow label="postPlatformId" value={result?.id} />
              <ResultRow label="publishId (TikTok)" value={result?.externalPostId ?? '—'} />
              <ResultRow label="Status" value={<StatusChip status={currentStatus} />} />
              {result?.errorMessage && <ResultRow label="Erro TikTok" value={result.errorMessage} error />}
              {statusResult?.errorMessage && <ResultRow label="Erro status" value={statusResult.errorMessage} error />}
            </div>
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
