import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import './IntegrationsCallback.css'

const PLATFORM_LABELS = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
}

export default function IntegrationsCallback() {
  const [params] = useSearchParams()
  const platform = params.get('platform')
  const username = params.get('username')
  const error = params.get('error')
  const [copied, setCopied] = useState(false)

  const allParams = Object.fromEntries(params.entries())
  const success = !error && platform

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(allParams, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    document.title = success
      ? `✓ ${PLATFORM_LABELS[platform] ?? platform} conectado`
      : '✗ Erro no callback'
  }, [success, platform])

  return (
    <div className="cb-root">
      <div className="cb-card">
        <div className={`cb-icon ${success ? 'success' : 'error'}`}>
          {success ? '✓' : '✗'}
        </div>

        {success ? (
          <>
            <h1 className="cb-title">Conta conectada!</h1>
            <p className="cb-subtitle">
              <strong>{PLATFORM_LABELS[platform] ?? platform}</strong> foi autorizado com sucesso.
            </p>
            {username && (
              <div className="cb-pill">
                @{username}
              </div>
            )}
          </>
        ) : (
          <>
            <h1 className="cb-title cb-title--error">Falha na autorização</h1>
            <p className="cb-subtitle">{error ?? 'Nenhum parâmetro recebido.'}</p>
          </>
        )}

        {/* Parâmetros recebidos */}
        <div className="cb-params">
          <div className="cb-params-header">
            <span className="cb-params-label">Parâmetros recebidos</span>
            <button className="cb-copy" onClick={handleCopy}>
              {copied ? 'Copiado!' : 'Copiar JSON'}
            </button>
          </div>
          <pre className="cb-params-body">
            {JSON.stringify(allParams, null, 2)}
          </pre>
        </div>

        <div className="cb-actions">
          <button className="cb-btn" onClick={() => window.close()}>
            Fechar aba
          </button>
          <button className="cb-btn ghost" onClick={() => window.location.href = '/dev/tiktok'}>
            Voltar ao teste
          </button>
        </div>
      </div>
    </div>
  )
}
