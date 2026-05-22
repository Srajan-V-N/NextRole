import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, color = 'brand', height = 'sm', label, showValue = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  const colors = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  }

  const autoColor = value >= 70 ? colors.success : value >= 40 ? colors.brand : colors.warning

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs text-light-muted dark:text-dark-muted">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-light-text dark:text-dark-text">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={`w-full ${heights[height]} bg-light-border dark:bg-dark-border rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          className={`h-full rounded-full ${color === 'auto' ? autoColor : (colors[color] || colors.brand)}`}
        />
      </div>
    </div>
  )
}
