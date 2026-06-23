import { useState } from 'react'
import './DevTikTok.css'

const DEFAULT_API = 'http://localhost:8080'

export default function DevTikTok() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [jwt, setJwt] = useState('')
  const [step, setStep] = useState('idle') // idle | loading | url_ready | error
  const [authUrl, setAuthUrl] = useState('')
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const [log, setLog] = useState([])

  const addLog = (msg, type = 'info') =>
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }])

  const handleConnect = async () => {
    if (!jwt.trim()) {
      setError('Cole um JWT válido antes de continuar.')
      return
    }
    setStep('loading')
    setError('')
    setLog([])
    addLog(`POST → ${apiBase}/social/tiktok/connect`)

    try {
      const res = await fetch(`${apiBase}/social/tiktok/connect`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt.trim()}`,
          'Content-Type': 'application/json',
        },
      })

      addLog(`Status: ${res.status}`)

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} — ${text}`)
      }

      const data = await res.json()
      addLog(`authUrl recebida ✓`, 'success')
      addLog(`state: ${data.state}`, 'success')

      setAuthUrl(data.authUrl)
      setState(data.state)
      setStep('url_ready')
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
      setStep('error')
    }
  }

  const handleOpenTikTok = () => {
    addLog('Abrindo TikTok para autorização...')
    window.open(authUrl, '_blank')
    setStep('waiting')
  }

  const handleReset = () => {
    setStep('idle')
    setAuthUrl('')
    setState('')
    setError('')
    setLog([])
  }

  return (
    <div className="devtk-root">
      <div className="devtk-card">
        <div className="devtk-header">
          <span className="devtk-badge">DEV</span>
          <h1>Teste OAuth — TikTok</h1>
          <p>Página de desenvolvimento. Não aparece no menu.</p>
        </div>

        {/* Config */}
        <section className="devtk-section">
          <label className="devtk-label">URL do Backend</label>
          <input
            className="devtk-input"
            value={apiBase}
            onChange={e => setApiBase(e.target.value)}
            placeholder="http://localhost:8080"
          />
        </section>

        <section className="devtk-section">
          <label className="devtk-label">JWT Token</label>
          <textarea
            className="devtk-textarea"
            value={jwt}
            onChange={e => setJwt(e.target.value)}
            placeholder="Cole aqui o token gerado pelo POST /auth/login"
            rows={4}
          />
        </section>

        {/* Steps */}
        <div className="devtk-steps">
          <Step num={1} active={step === 'idle' || step === 'loading' || step === 'error'} done={['url_ready','waiting','done'].includes(step)}>
            Chamar <code>GET /social/tiktok/connect</code>
          </Step>
          <Step num={2} active={step === 'url_ready'} done={['waiting','done'].includes(step)}>
            Abrir URL de autorização no TikTok
          </Step>
          <Step num={3} active={step === 'waiting'} done={step === 'done'}>
            Aguardar callback do TikTok
          </Step>
        </div>

        {/* Actions */}
        <div className="devtk-actions">
          {(step === 'idle' || step === 'error') && (
            <button className="devtk-btn primary" onClick={handleConnect}>
              1. Iniciar OAuth
            </button>
          )}
          {step === 'loading' && (
            <button className="devtk-btn primary" disabled>
              Chamando API…
            </button>
          )}
          {step === 'url_ready' && (
            <button className="devtk-btn tiktok" onClick={handleOpenTikTok}>
              2. Abrir TikTok para autorizar
            </button>
          )}
          {step === 'waiting' && (
            <p className="devtk-waiting">
              Aguardando redirecionamento do TikTok para<br />
              <code>{apiBase.replace('8080','3000') + '/integrations/callback'}</code>
            </p>
          )}
          {step !== 'idle' && (
            <button className="devtk-btn ghost" onClick={handleReset}>
              Recomeçar
            </button>
          )}
        </div>

        {/* Auth URL preview */}
        {authUrl && (
          <section className="devtk-section">
            <label className="devtk-label">Auth URL gerada</label>
            <div className="devtk-url-box">
              <span>{authUrl}</span>
              <button className="devtk-copy" onClick={() => navigator.clipboard.writeText(authUrl)}>
                Copiar
              </button>
            </div>
            <label className="devtk-label" style={{ marginTop: 8 }}>State</label>
            <div className="devtk-url-box">
              <code>{state}</code>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="devtk-error">
            <strong>Erro:</strong> {error}
          </div>
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
