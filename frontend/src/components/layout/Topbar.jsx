import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs',
  '/resume': 'Resume',
  '/readiness': 'Readiness',
  '/profile': 'Profile',
}

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const location = useLocation()

  const pageTitle = PAGE_TITLES[location.pathname] || 'NextRole'

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="h-14 flex items-center justify-between px-4 lg:px-8 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-0 z-20">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-subtle dark:hover:bg-dark-subtle transition-colors"
        >
          <Menu size={18} />
        </button>
        <span className="hidden lg:block text-sm font-semibold text-light-text dark:text-dark-text">
          {pageTitle}
        </span>
      </div>

      {/* Right: theme + user */}
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 ml-1 pl-2.5 border-l border-light-border dark:border-dark-border">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-light-text dark:text-dark-text leading-tight">{user?.name}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
