import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Mail, Lock, ArrowRight, CheckCircle2, FileText, Briefcase, Target } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import ThemeToggle from '../components/layout/ThemeToggle'
import PageWrapper from '../components/common/PageWrapper'

const FEATURES = [
  { icon: FileText, label: 'Smart resume scoring & ATS analysis' },
  { icon: Briefcase, label: 'Curated job matches for your profile' },
  { icon: Target, label: 'Interview readiness assessment' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex">

        {/* ── Left: Brand panel ── */}
        <div
          className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 xl:p-14"
          style={{ background: '#00110F' }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center flex-shrink-0">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="text-base font-semibold text-white">NextRole</span>
          </Link>

          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-bold text-white leading-[1.05] tracking-tight">
                Land your<br />next role.
              </h1>
              <p className="text-[15px] leading-relaxed max-w-xs" style={{ color: '#5C8A80' }}>
                AI-powered platform built for placement-ready professionals.
              </p>
            </div>

            <ul className="space-y-3.5">
              {FEATURES.map(({ label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,213,185,0.15)' }}>
                    <CheckCircle2 size={11} className="text-brand" />
                  </div>
                  <span className="text-sm" style={{ color: '#8ABFB8' }}>{label}</span>
                </li>
              ))}
            </ul>

            {/* Minimal stat card — 2D, no blur */}
            <div className="rounded-2xl p-5 space-y-3.5 max-w-[260px]" style={{ border: '1px solid #162C2A' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#5C8A80' }}>
                Placement Score
              </p>
              <div className="flex items-end gap-2.5">
                <span className="text-5xl font-bold leading-none text-brand">87</span>
                <span className="text-sm mb-1" style={{ color: '#5C8A80' }}>/ 100</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#162C2A' }}>
                <div className="h-full rounded-full bg-brand" style={{ width: '87%' }} />
              </div>
              <div className="flex gap-5 pt-0.5">
                {[['Applied', '24'], ['Matched', '18'], ['Responses', '7']].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[11px]" style={{ color: '#5C8A80' }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: '#8ABFB8' }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs" style={{ color: '#2E5550' }}>© 2025 NextRole. All rights reserved.</p>
        </div>

        {/* ── Right: Form panel ── */}
        <div className="flex-1 flex flex-col bg-white dark:bg-dark-surface">
          <div className="flex items-center justify-between px-8 py-5">
            <Link to="/" className="flex items-center gap-2 lg:invisible">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                <TrendingUp size={13} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-light-text dark:text-dark-text">NextRole</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex-1 flex items-center justify-center px-8 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-sm"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight mb-1.5">
                  Sign in
                </h2>
                <p className="text-sm text-light-muted dark:text-dark-muted">
                  Welcome back to NextRole.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  icon={<Mail size={14} />}
                  autoComplete="email"
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    icon={<Lock size={14} />}
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      className="text-xs text-light-muted dark:text-dark-muted hover:text-brand dark:hover:text-brand transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3.5 py-2.5 rounded-xl bg-error/10 border border-error/20 text-xs text-error"
                  >
                    {error}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-1"
                  size="lg"
                  icon={!loading ? <ArrowRight size={14} /> : null}
                >
                  Sign in
                </Button>
              </form>

              <p className="mt-6 text-sm text-light-muted dark:text-dark-muted">
                No account?{' '}
                <Link to="/signup" className="text-brand hover:text-brand-hover font-medium transition-colors">
                  Create one
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
