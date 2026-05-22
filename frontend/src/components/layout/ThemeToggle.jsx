import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../hooks/useTheme'

export default function ThemeToggle() {
  const { toggle, isDark } = useTheme()

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-bg dark:hover:bg-dark-card transition-colors duration-150"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  )
}
