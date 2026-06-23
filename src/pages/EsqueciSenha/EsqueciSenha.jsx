import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LuArrowLeft, LuMail, LuMailCheck, LuCircleAlert, LuCheck,
} from 'react-icons/lu'
import { useTheme } from '../../contexts/ThemeContext'
import logoHub from '../../assets/images/logo-hub.png'
import logoHubDark from '../../assets/images/logo-hub-dark.png'
import './EsqueciSenha.css'

const viewVariants = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function EsqueciSenha() {
  const { theme } = useTheme()
  const logo = theme === 'dark' ? logoHubDark : logoHub
  const [view, setView] = useState('request')   // 'request' | 'sent'
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendState, setResendState] = useState('idle')   // 'idle' | 'sent'
  const resendTimer = useRef(null)

  const particles = useMemo(() => Array.from({ length: 14 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 4 + Math.random() * 6,
    opacity: 0.04 + Math.random() * 0.08,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 5,
  })), [])

  useEffect(() => () => { if (resendTimer.current) clearTimeout(resendTimer.current) }, [])

  const validate = () => {
    if (!email.trim()) { setEmailError('Este campo é obrigatório'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('E-mail inválido'); return false }
    setEmailError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simula chamada de API
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setView('sent')
  }

  const handleResend = () => {
    setResendState('sent')
    if (resendTimer.current) clearTimeout(resendTimer.current)
    resendTimer.current = setTimeout(() => setResendState('idle'), 3000)
  }

  return (
    <div className="recovery">
      <div className="recovery__blob recovery__blob--1" aria-hidden="true" />
      <div className="recovery__blob recovery__blob--2" aria-hidden="true" />

      <div className="recovery__particles" aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={i}
            className="recovery__particle"
            style={{
              left: `${p.left}%`,
              top:  `${p.top}%`,
              width:  `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              '--delay': `${p.delay}s`,
              '--dur':   `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <Link to="/" className="recovery__back" aria-label="Voltar para a página inicial">
        <LuArrowLeft size={14} aria-hidden="true" />
        Voltar
      </Link>

      <div className="recovery__shell">
        <Link to="/" className="recovery__logo" aria-label="HubStudio — página inicial">
          <img src={logo} alt="HubStudio" className="recovery__logo-img" />
        </Link>

        <div className="recovery__card">
          <AnimatePresence mode="wait" initial={false}>
            {view === 'request' && (
              <motion.div
                key="request"
                className="recovery__view"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="recovery__icon" aria-hidden="true">
                  <LuMail size={32} />
                </div>

                <header className="recovery__heading">
                  <h1>Esqueceu sua senha?</h1>
                  <p>Digite seu e-mail e enviaremos um link para você criar uma nova senha.</p>
                </header>

                <form onSubmit={handleSubmit} className="recovery__form" noValidate>
                  <div className="recovery__field">
                    <div className="recovery__input-wrap">
                      <input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); if (emailError) setEmailError('') }}
                        className={`recovery__input${emailError ? ' recovery__input--error' : ''}`}
                        autoComplete="email"
                        aria-label="E-mail"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                      />
                    </div>
                    {emailError && (
                      <p id="email-error" className="recovery__field-error" role="alert">
                        <LuCircleAlert size={12} aria-hidden="true" />
                        {emailError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="recovery__submit"
                    disabled={loading}
                    aria-busy={loading}
                    aria-label="Enviar link de recuperação"
                  >
                    {loading
                      ? <span className="recovery__spinner" aria-hidden="true" />
                      : 'Enviar link de recuperação'}
                  </button>
                </form>

                <p className="recovery__switch">
                  Lembrou a senha? <Link to="/entrar">Entrar</Link>
                </p>
              </motion.div>
            )}

            {view === 'sent' && (
              <motion.div
                key="sent"
                className="recovery__view"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="recovery__icon recovery__icon--pulse" aria-hidden="true">
                  <LuMailCheck size={32} />
                </div>

                <header className="recovery__heading">
                  <h1>Verifique seu e-mail</h1>
                  <p>
                    Enviamos um link de recuperação para{' '}
                    <strong className="recovery__heading-email">{email}</strong>.
                    Verifique sua caixa de entrada e o spam.
                  </p>
                </header>

                <p className="recovery__resend" aria-live="polite">
                  {resendState === 'idle' ? (
                    <>
                      Não recebeu?{' '}
                      <button
                        type="button"
                        className="recovery__resend-link"
                        onClick={handleResend}
                        aria-label="Reenviar link de recuperação"
                      >
                        Reenviar link
                      </button>
                    </>
                  ) : (
                    <span className="recovery__resend-success">
                      Reenviado <LuCheck size={14} />
                    </span>
                  )}
                </p>

                <p className="recovery__switch">
                  <Link to="/entrar">← Voltar para o login</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
