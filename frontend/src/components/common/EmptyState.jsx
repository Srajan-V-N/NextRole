import { motion } from 'framer-motion'
import Button from './Button'

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed border-light-border dark:border-dark-border rounded-2xl"
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border flex items-center justify-center mb-4">
          <Icon size={20} className="text-light-muted dark:text-dark-muted" />
        </div>
      )}
      <h3 className="text-sm font-bold text-light-text dark:text-dark-text mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-light-muted dark:text-dark-muted max-w-xs mb-5 leading-relaxed">{description}</p>
      )}
      {action && actionLabel && (
        <Button onClick={action} size="sm">{actionLabel}</Button>
      )}
    </motion.div>
  )
}
