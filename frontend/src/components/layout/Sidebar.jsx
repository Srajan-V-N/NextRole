import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Briefcase, FileText, Target, User, LogOut, X,
  BookOpen, Kanban, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_MAIN = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/readiness', label: 'Readiness', icon: Target },
  { path: '/courses', label: 'Courses', icon: BookOpen },
  { path: '/tracker', label: 'Tracker', icon: Kanban },
]

const NAV_ACCOUNT = [
  { path: '/profile', label: 'Profile', icon: User },
]

function NavItem({ path, label, icon: Icon, onClose }) {
  return (
    <NavLink
      to={path}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative
        ${isActive
          ? 'bg-brand/12 text-brand'
          : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-subtle dark:hover:bg-dark-subtle'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute inset-0 rounded-2xl bg-brand/10 dark:bg-brand/15"
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            />
          )}
          <Icon
            size={16}
            className={`flex-shrink-0 transition-colors relative z-10 ${
              isActive ? 'text-brand' : 'text-light-muted dark:text-dark-muted group-hover:text-light-text dark:group-hover:text-dark-text'
            }`}
            strokeWidth={isActive ? 2.5 : 2}
          />
          <span className="leading-none relative z-10">{label}</span>
          {isActive && (
            <ChevronRight size={12} className="ml-auto text-brand/60 relative z-10" />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <img src="/N_light_mode.jpg" alt="NextRole" className="w-9 h-9 rounded-xl object-contain flex-shrink-0 dark:hidden" />
          <img src="/N_dark_mode.jpg" alt="NextRole" className="w-9 h-9 rounded-xl object-contain flex-shrink-0 hidden dark:block" />
          <div>
            <span className="font-bold text-[15px] text-light-text dark:text-dark-text tracking-tight leading-none block">
              NextRole
            </span>
            <p className="text-[10px] text-brand/70 leading-none mt-0.5 font-medium">
              AI Career Platform
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-xl text-light-muted hover:text-light-text dark:text-dark-muted dark:hover:text-dark-text transition-colors hover:bg-light-subtle dark:hover:bg-dark-subtle"
        >
          <X size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">
            Main
          </p>
          <div className="space-y-0.5">
            {NAV_MAIN.map(item => (
              <NavItem key={item.path} {...item} onClose={onClose} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-1.5 text-[10px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider">
            Account
          </p>
          <div className="space-y-0.5">
            {NAV_ACCOUNT.map(item => (
              <NavItem key={item.path} {...item} onClose={onClose} />
            ))}
          </div>
        </div>
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-light-border dark:border-dark-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-light-subtle dark:bg-dark-subtle">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-light-text dark:text-dark-text truncate leading-tight">{user?.name}</p>
            <p className="text-[10px] text-light-muted dark:text-dark-muted truncate leading-tight mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-2xl text-sm text-light-muted dark:text-dark-muted hover:text-error hover:bg-error/8 dark:hover:bg-error/10 transition-all duration-150"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 w-64 h-screen bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border z-50 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
