import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getGoogleConfig, beginGoogleSignIn } from '../../services/auth'
import { loadGoogleIdentity } from '../../services/googleIdentity'
import './GoogleSignIn.css'

export default function GoogleSignIn({ onSuccess, disabled = false, signup = false }) {
  const { loginGoogle, linkGoogle, verifyGoogleEmail, completeTwoFactor } = useAuth()
  const container = useRef(null)
  const callback = useRef(null)
  const busy = useRef(false)
  const mounted = useRef(false)
  const [step, setStep] = useState('loading')
  const [challengeId, setChallengeId] = useState(null)
  const [proof, setProof] = useState('')
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [restart, setRestart] = useState(0)

  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const result = async (response) => {
    if (!mounted.current) return
    if (response.requiresAccountLink || response.requiresEmailVerification || response.requiresTwoFactor) {
      setChallengeId(response.challengeId); setProof('')
      setStep(response.requiresAccountLink ? 'link' : response.requiresEmailVerification ? 'email' : 'two-factor')
    } else await onSuccess(response)
  }
  callback.current = async (credential, id) => {
    if (busy.current || disabled || !mounted.current) return
    busy.current = true; setWorking(true); setError('')
    try { await result(await loginGoogle(credential, id)) }
    catch (err) { if (mounted.current) setError(err.message) }
    finally { busy.current = false; if (mounted.current) setWorking(false) }
  }

  useEffect(() => {
    if (disabled) { setStep('disabled'); return }
    let cancelled = false
    const controller = new AbortController()
    setStep('loading'); setError('')
    const prepare = async () => {
      const config = await getGoogleConfig(controller.signal)
      if (!config.enabled) { if (!cancelled) setStep('unavailable'); return }
      const [google, challenge] = await Promise.all([loadGoogleIdentity(), beginGoogleSignIn(controller.signal)])
      if (cancelled || !container.current) return
      google.initialize({ client_id: challenge.clientId, nonce: challenge.nonce, auto_select: false,
        callback: response => { if (!cancelled) callback.current(response.credential, challenge.challengeId) }, ux_mode: 'popup' })
      container.current.replaceChildren()
      google.renderButton(container.current, { type: 'standard', theme: 'outline', size: 'large', text: signup ? 'signup_with' : 'signin_with',
        shape: 'pill', locale: 'pt-BR', width: Math.max(120, Math.min(400, container.current.parentElement?.clientWidth || 220)) })
      setStep('ready')
    }
    prepare().catch(err => { if (!cancelled) { setError(err.message); setStep('unavailable') } })
    return () => { cancelled = true; controller.abort(); container.current?.replaceChildren() }
  }, [disabled, signup, restart])

  const confirm = async (e) => {
    e.preventDefault()
    if (busy.current || !proof.trim()) return
    busy.current = true; setWorking(true); setError('')
    try {
      if (step === 'link') await result(await linkGoogle(challengeId, proof))
      else if (step === 'email') await result(await verifyGoogleEmail(challengeId, proof))
      else await result(await completeTwoFactor(challengeId, proof))
    } catch (err) { if (mounted.current) setError(err.message) }
    finally { busy.current = false; if (mounted.current) setWorking(false) }
  }

  return <div className="google-signin">
    <div ref={container} className="google-signin__button" hidden={step !== 'ready' || working} />
    {step === 'loading' && <p role="status">Carregando Google…</p>}
    {step === 'disabled' && <p>{signup ? 'Aceite os termos abaixo para cadastrar-se com Google.' : 'Conclua o acesso em andamento para usar o Google.'}</p>}
    {step === 'unavailable' && <p>Login com Google indisponível no momento.</p>}
    {working && <p role="status">Confirmando seu acesso…</p>}
    {['link', 'email', 'two-factor'].includes(step) && <form onSubmit={confirm}>
      <p>{step === 'link' ? 'Este e-mail já tem uma conta HubStudio. Confirme a senha dessa conta para vincular o Google.' : step === 'email'
        ? 'Enviamos um código ao seu e-mail para confirmar o cadastro. Verifique também o spam.' : 'Sua conta usa verificação em duas etapas. Digite o código recebido por e-mail.'}</p>
      <input className="auth__input" aria-label={step === 'link' ? 'Senha da conta HubStudio' : 'Código recebido por e-mail'} type={step === 'link' ? 'password' : 'text'}
        autoComplete={step === 'link' ? 'current-password' : 'one-time-code'} inputMode={step === 'link' ? undefined : 'numeric'}
        maxLength={step === 'link' ? 200 : 6} value={proof} onChange={e => setProof(step === 'link' ? e.target.value : e.target.value.replace(/\D/g, ''))} disabled={working} />
      <button className="auth__oauth-btn" type="submit" disabled={working || !proof || (step !== 'link' && proof.length !== 6)}>Confirmar</button>
      {step === 'link' && <Link to="/esqueci-senha">Esqueci minha senha</Link>}
    </form>}
    {error && <p className="auth__field-error" role="alert">{error}</p>}
    {(error || ['link', 'email', 'two-factor'].includes(step)) && <button type="button" className="google-signin__retry" disabled={working} onClick={() => { setProof(''); setRestart(v => v + 1) }}>Reiniciar login com Google</button>}
    {!signup && step === 'ready' && <small>Ao continuar com Google, você aceita os <Link to="/terms">Termos</Link> e a <Link to="/privacy">Política de Privacidade</Link>.</small>}
  </div>
}
