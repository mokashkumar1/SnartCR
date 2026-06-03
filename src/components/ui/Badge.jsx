export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-surface-muted text-dark-60',
    success: 'bg-status-success-light text-status-success',
    danger: 'bg-status-error-light text-status-error',
    warning: 'bg-status-warning-light text-status-warning',
    info: 'bg-surface-muted text-dark-60', // No info in specs, fallback to neutral
  }

  return (
    <span className={`inline-flex items-center px-3 py-[3px] rounded-full text-xs font-semibold tracking-[0.02em] ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}