import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Mail, Lock, User, ArrowRight, CheckCircle2, BarChart2, BookOpen, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import ThemeToggle from '../components/layout/ThemeToggle'
import PageWrapper from '../components/common/PageWrapper'

const FEATURES = [
  { icon: BarChart2, label: 'Track scores & progress in real time' },
  { icon: BookOpen, label: 'Personalized courses for skill gaps' },
  { icon: MapPin, label: 'Applied job tracking & follow-ups' },
]

const STEPS = [
  { step: '01', label: 'Create your account' },
  { step: '02', label: 'Build your profile' },
  { step: '03', label: 'Get your placement score' },
]

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address'
    if (!password) e.password = 'Password is required'
    else if (password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/profile')
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Registration failed. Please try again.' })
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
                Start your<br />placement<br />journey.
              </h1>
              <p className="text-[15px] leading-relaxed max-w-xs" style={{ color: '#5C8A80' }}>
                Everything you need to go from resume to offer — in one platform.
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

            {/* Steps card — 2D, no blur */}
            <div className="rounded-2xl p-5 space-y-4 max-w-[260px]" style={{ border: '1px solid #162C2A' }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#5C8A80' }}>
                Get started in 3 steps
              </p>
              <div className="space-y-3">
                {STEPS.map(({ step, label }) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-brand w-5 tabular-nums flex-shrink-0">{step}</span>
                    <span className="text-sm" style={{ color: '#8ABFB8' }}>{label}</span>
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
                  Create account
                </h2>
                <p className="text-sm text-light-muted dark:text-dark-muted">
                  Start your placement journey today.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  icon={<User size={14} />}
                  error={errors.name}
                  autoComplete="name"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  icon={<Mail size={14} />}
                  error={errors.email}
                  autoComplete="email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  icon={<Lock size={14} />}
                  error={errors.password}
                  autoComplete="new-password"
                />

                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-3.5 py-2.5 rounded-xl bg-error/10 border border-error/20 text-xs text-error"
                  >
                    {errors.form}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full mt-1"
                  size="lg"
                  icon={!loading ? <ArrowRight size={14} /> : null}
                >
                  Create account
                </Button>
              </form>

              <p className="mt-6 text-sm text-light-muted dark:text-dark-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-brand hover:text-brand-hover font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
