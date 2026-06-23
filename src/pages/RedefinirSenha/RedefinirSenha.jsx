import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LuArrowLeft, LuLockOpen } from 'react-icons/lu'
import { RecoveryPasswordField, StrengthMeter } from '../../components/PasswordField/PasswordField'
import { calcStrength } from '../../utils/password'
import { useTheme } from '../../contexts/ThemeContext'
import logoHub from '../../assets/images/logo-hub.png'
import logoHubDark from '../../assets/images/logo-hub-dark.png'
import '../EsqueciSenha/EsqueciSenha.css'

const viewVariants = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, scale: 0.97, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function RedefinirSenha() {
  const { theme } = useTheme()
  const logo = theme === 'dark' ? logoHubDark : logoHub
  const [view, setView] = useState('form')   // 'form' | 'success'
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const [searchParams] = useSearchParams()
  // Token lido da URL — incluído na "chamada de API". Não validado no front.
  const token = searchParams.get('token') || ''

  const navigate = useNavigate()

  const strength = useMemo(() => calcStrength(form.password), [form.password])

  const particles = useMemo(() => Array.from({ length: 14 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 4 + Math.random() * 6,
    opacity: 0.04 + Math.random() * 0.08,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 5,
  })), [])

  const validate = () => {
    const next = {}
    if (!form.password) next.password = 'Este campo é obrigatório'
    else if (form.password.length < 8) next.password = 'Mínimo 8 caracteres'

    if (!form.confirm) next.confirm = 'Confirme sua nova senha'
    else if (form.confirm !== form.password) next.confirm = 'As senhas não coincidem'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const updateField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Simula chamada de API com o token + nova senha
    // (futuramente: await api.resetPassword({ token, password: form.password }))
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setView('success')
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
            {view === 'form' && (
              <motion.div
                key="form"
                className="recovery__view"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="recovery__icon" aria-hidden="true">
                  <LuLockOpen size={32} />
                </div>

                <header className="recovery__heading">
                  <h1>Criar nova senha</h1>
                  <p>Sua nova senha deve ter pelo menos 8 caracteres.</p>
                </header>

                <form onSubmit={handleSubmit} className="recovery__form" noValidate>
                  {/* Token oculto — incluído quando o backend for plugado */}
                  <input type="hidden" name="token" value={token} />

                  {/* Nova senha + strength */}
                  <RecoveryPasswordField
                    id="password"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={v => updateField('password', v)}
                    error={errors.password}
                    errorId="password-error"
                    autoComplete="new-password"
                    ariaLabel="Nova senha"
                    describedBy="password-strength"
                  >
                    {form.password && (
                      <StrengthMeter strength={strength} prefix="recovery" id="password-strength" />
                    )}
                  </RecoveryPasswordField>

                  {/* Confirmar nova senha */}
                  <RecoveryPasswordField
                    id="confirm"
                    placeholder="Confirme sua nova senha"
                    value={form.confirm}
                    onChange={v => updateField('confirm', v)}
                    error={errors.confirm}
                    errorId="confirm-error"
                    autoComplete="new-password"
                    ariaLabel="Confirmar nova senha"
                  />

                  <button
                    type="submit"
                    className="recovery__submit"
                    disabled={loading}
                    aria-busy={loading}
                    aria-label="Redefinir senha"
                  >
                    {loading
                      ? <span className="recovery__spinner" aria-hidden="true" />
                      : 'Redefinir senha'}
                  </button>
                </form>
              </motion.div>
            )}

            {view === 'success' && (
              <motion.div
                key="success"
                className="recovery__view"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="recovery__icon recovery__icon--success" aria-hidden="true">
                  <svg viewBox="0 0 64 64" className="recovery__success-svg">
                    <circle
                      cx="32" cy="32" r="28"
                      className="recovery__success-circle"
                    />
                    <path
                      d="M20 32 L28 40 L44 24"
                      className="recovery__success-check"
                    />
                  </svg>
                </div>

                <header className="recovery__heading">
                  <h1>Senha redefinida!</h1>
                  <p>Sua senha foi alterada com sucesso.</p>
                </header>

                <button
                  type="button"
                  className="recovery__submit"
                  onClick={() => navigate('/entrar')}
                  aria-label="Ir para a página de login"
                >
                  Ir para o login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
