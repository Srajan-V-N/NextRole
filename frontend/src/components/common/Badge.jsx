export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border',
    brand: 'bg-brand/10 text-brand border border-brand/25 dark:bg-brand/15',
    success: 'bg-success/10 text-success border border-success/25 dark:bg-success/15',
    warning: 'bg-warning/10 text-warning border border-warning/25 dark:bg-warning/15',
    error: 'bg-error/10 text-error border border-error/25 dark:bg-error/15',
    muted: 'bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted border border-transparent',
  }

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
