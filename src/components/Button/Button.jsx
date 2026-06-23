import './Button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconRight,
  className = '',
  ...props
}) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="btn__spinner" />}
      {!loading && icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
      {!loading && iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
    </button>
  )
}
