export default function Toggle({ value, onChange, ariaLabel }) {
  return (
    <button
      type="button"
      className={`set-toggle ${value ? 'set-toggle--on' : ''}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
    >
      <span className="set-toggle__thumb" />
    </button>
  )
}
