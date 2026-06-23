import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuEye, LuEyeOff, LuCircleAlert } from 'react-icons/lu'
import { fieldVariants } from '../../styles/animations'
import { STRENGTH_LABELS } from '../../utils/password'

/**
 * Medidor visual da força da senha (4 barras + label).
 * `prefix` controla o namespace das classes CSS ('auth' ou 'recovery').
 */
export function StrengthMeter({ strength, prefix = 'auth', id }) {
  return (
    <div className={`${prefix}__strength ${prefix}__strength--${strength}`} id={id}>
      <div className={`${prefix}__strength-bars`} aria-hidden="true">
        {[1, 2, 3, 4].map(i => (
          <span key={i} className={`${prefix}__strength-bar${i <= strength ? ` ${prefix}__strength-bar--on` : ''}`} />
        ))}
      </div>
      <span className={`${prefix}__strength-label`}>
        {STRENGTH_LABELS[strength] || 'Fraca'}
      </span>
    </div>
  )
}

/**
 * Campo de senha para telas de auth (Login, Cadastro).
 * Renderiza motion.div com fieldVariants, input + botão de mostrar/ocultar e mensagem de erro.
 *
 * Use `children` para renderizar conteúdo entre o input e a mensagem de erro
 * (ex.: medidor de força da senha).
 */
export function AuthPasswordField({
  id,
  placeholder,
  value,
  onChange,
  error,
  errorId,
  autoComplete = 'current-password',
  ariaLabel = 'Senha',
  describedBy,
  children,
}) {
  const [show, setShow] = useState(false)

  return (
    <motion.div className="auth__field" variants={fieldVariants}>
      <div className="auth__input-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`auth__input auth__input--with-action${error ? ' auth__input--error' : ''}`}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : describedBy}
        />
        <button
          type="button"
          className={`auth__action-btn${show ? ' auth__action-btn--active' : ''}`}
          onClick={() => setShow(v => !v)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={-1}
        >
          {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
        </button>
      </div>

      {children}

      {error && (
        <p id={errorId} className="auth__field-error" role="alert">
          <LuCircleAlert size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </motion.div>
  )
}

/**
 * Campo de senha para telas de recovery (RedefinirSenha).
 * Usa classes `recovery__*` e não envolve em motion.div.
 */
export function RecoveryPasswordField({
  id,
  placeholder,
  value,
  onChange,
  error,
  errorId,
  autoComplete = 'new-password',
  ariaLabel = 'Senha',
  describedBy,
  children,
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="recovery__field">
      <div className="recovery__input-wrap">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`recovery__input recovery__input--with-action${error ? ' recovery__input--error' : ''}`}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : describedBy}
        />
        <button
          type="button"
          className={`recovery__action-btn${show ? ' recovery__action-btn--active' : ''}`}
          onClick={() => setShow(v => !v)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          tabIndex={-1}
        >
          {show ? <LuEyeOff size={16} /> : <LuEye size={16} />}
        </button>
      </div>

      {children}

      {error && (
        <p id={errorId} className="recovery__field-error" role="alert">
          <LuCircleAlert size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
