import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, onClick, padding = true }) {
  const base = `bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl shadow-card`
  const hoverClass = hover ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand/25 transition-all duration-300' : ''
  const padClass = padding ? 'p-5' : ''

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.005, y: -1 }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
        className={`${base} ${hoverClass} ${padClass} ${className}`}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`${base} ${padClass} ${className}`}>
      {children}
    </div>
  )
}
