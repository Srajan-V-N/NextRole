import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none'

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover shadow-sm',
    secondary: 'bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border border-light-border dark:border-dark-border hover:bg-light-subtle dark:hover:bg-dark-subtle',
    ghost: 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-subtle dark:hover:bg-dark-subtle',
    danger: 'bg-error text-white hover:bg-red-700 shadow-sm',
    outline: 'border border-brand text-brand hover:bg-brand/10',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
    xl: 'px-7 py-3.5 text-base',
  }

  const isDisabled = disabled || loading

  return (
    <motion.button
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${isDisabled ? 'opacity-55 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 size={13} className="animate-spin flex-shrink-0" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
