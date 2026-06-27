import { useState } from 'react'
import { Link } from 'react-router-dom'
import './DevYouTube.css'

const DEFAULT_API = 'https://hubstudio.onrender.com'

export default function DevYouTube() {
  const [apiBase, setApiBase] = useState(DEFAULT_API)
  const [jwt, setJwt] = useState('')
  const [step, setStep] = useState('idle')
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
    addLog(`GET → ${apiBase}/social/youtube/connect`)

    try {
      const res = await fetch(`${apiBase}/social/youtube/connect`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${jwt.trim()}` },
      })

      addLog(`Status: ${res.status}`)

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`${res.status} — ${text}`)
      }

      const data = await res.json()
      addLog('authorizationUrl recebida ✓', 'success')
      addLog(`state: ${data.state}`, 'success')

      setAuthUrl(data.authorizationUrl)
      setState(data.state)
      setStep('url_ready')
    } catch (err) {
      addLog(`Erro: ${err.message}`, 'error')
      setError(err.message)
      setStep('error')
    }
  }

  const handleReset = () => {
    setStep('idle')
    setAuthUrl('')
    setState('')
    setError('')
    setLog([])
  }

  return (
    <div className="devyt-root">
      <div className="devyt-card">
        <div className="devyt-header">
          <span className="devyt-badge">DEV</span>
          <h1>Teste OAuth — YouTube</h1>
          <p>Conecta a conta do Google/YouTube via OAuth 2.0.</p>
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
            placeholder="Cole aqui o token gerado pelo POST /auth/login"
            rows={4}
          />
        </section>

        <div className="devyt-steps">
          <Step num={1} active={['idle','loading','error'].includes(step)} done={['url_ready','waiting'].includes(step)}>
            Chamar <code>GET /social/youtube/connect</code>
          </Step>
          <Step num={2} active={step === 'url_ready'} done={step === 'waiting'}>
            Abrir URL de autorização do Google
          </Step>
          <Step num={3} active={step === 'waiting'} done={false}>
            Aguardar callback do Google
          </Step>
        </div>

        <div className="devyt-actions">
          {(step === 'idle' || step === 'error') && (
            <button className="devyt-btn youtube" onClick={handleConnect}>
              1. Iniciar OAuth Google
            </button>
          )}
          {step === 'loading' && (
            <button className="devyt-btn youtube" disabled>Chamando API…</button>
          )}
          {step === 'url_ready' && (
            <a
              className="devyt-btn youtube"
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { addLog('Abrindo Google para autorização...'); setStep('waiting') }}
            >
              2. Abrir Google para autorizar
            </a>
          )}
          {step === 'waiting' && (
            <p className="devyt-waiting">
              Aguardando redirecionamento do Google para o callback do backend.<br />
              Após autorizar, o backend redireciona para o frontend com <code>?platform=youtube</code>.
            </p>
          )}
          {step !== 'idle' && (
            <button className="devyt-btn ghost" onClick={handleReset}>Recomeçar</button>
          )}
          <Link to="/dev/youtube/post" className="devyt-btn ghost">
            Próximo: testar publicação →
          </Link>
        </div>

        {authUrl && (
          <section className="devyt-section">
            <label className="devyt-label">Auth URL gerada</label>
            <div className="devyt-url-box">
              <span>{authUrl}</span>
              <button className="devyt-copy" onClick={() => navigator.clipboard.writeText(authUrl)}>
                Copiar
              </button>
            </div>
            <label className="devyt-label" style={{ marginTop: 8 }}>State</label>
            <div className="devyt-url-box">
              <code>{state}</code>
            </div>
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
