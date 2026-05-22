import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  TrendingUp, ArrowRight, Briefcase, FileText, Target,
  CheckCircle2, ChevronRight, Star, Zap, BarChart3, Sun, Moon
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import PageWrapper from '../components/common/PageWrapper'

// Fade-in animation for sections
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Mock dashboard preview component
function DashboardPreview() {
  return (
    <div className="relative">
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-card-hover w-full max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-light-muted dark:text-dark-muted">Placement Score</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-light-text dark:text-dark-text"
            >
              74
            </motion.p>
          </div>
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#E6F4F1" strokeWidth="5" />
              <motion.circle
                cx="28" cy="28" r="22" fill="none"
                stroke="#00D5B9" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                initial={{ strokeDashoffset: `${2 * Math.PI * 22}` }}
                animate={{ strokeDashoffset: `${2 * Math.PI * 22 * (1 - 0.74)}` }}
                transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-brand">74%</span>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-3 mb-4">
          {[
            { label: 'Resume ATS', value: 78, color: '#00D5B9' },
            { label: 'Readiness', value: 65, color: '#00D5B9' },
            { label: 'Profile', value: 90, color: '#00D756' },
          ].map(({ label, value, color }, i) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-light-muted dark:text-dark-muted">{label}</span>
                <span className="text-xs font-medium text-light-text dark:text-dark-text">{value}%</span>
              </div>
              <div className="h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: 'easeOut' }}
                  style={{ backgroundColor: color }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Active job chip */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand/8 border border-brand/20">
          <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
          <span className="text-xs text-brand font-medium truncate">Software Engineer — Stripe</span>
        </div>
      </div>

      {/* Floating job card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute -bottom-4 -right-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-3 shadow-card-hover w-44"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-lg bg-brand/15 flex items-center justify-center text-xs font-bold text-brand">V</div>
          <div>
            <p className="text-xs font-medium text-light-text dark:text-dark-text leading-none">Frontend Eng</p>
            <p className="text-[10px] text-light-muted dark:text-dark-muted">Vercel</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">92% match</span>
        </div>
      </motion.div>
    </div>
  )
}

// Interactive demo component
const DEMO_STEPS = [
  { id: 0, label: 'Select a job', desc: 'Choose a role that interests you' },
  { id: 1, label: 'Resume tailored', desc: 'AI generates targeted content' },
  { id: 2, label: 'Checklist ready', desc: 'Round-by-round prep plan appears' },
]

function InteractiveDemo() {
  const [step, setStep] = useState(0)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step tabs */}
      <div className="flex gap-2 mb-8 justify-center flex-wrap">
        {DEMO_STEPS.map((s) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${step === s.id
                ? 'bg-brand text-white shadow-sm'
                : 'bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
              }`}
          >
            {s.id + 1}. {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {[
              { title: 'Software Engineer', company: 'Stripe', match: 87, active: true },
              { title: 'Frontend Engineer', company: 'Vercel', match: 72, active: false },
              { title: 'Full Stack Dev', company: 'Linear', match: 65, active: false },
            ].map((job) => (
              <div
                key={job.company}
                onClick={() => setStep(1)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200
                  ${job.active
                    ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                    : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-brand/40'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-brand/15 flex items-center justify-center text-xs font-bold text-brand">
                    {job.company[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-light-text dark:text-dark-text">{job.title}</p>
                    <p className="text-[10px] text-light-muted dark:text-dark-muted">{job.company}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                  ${job.active ? 'bg-brand/15 text-brand' : 'bg-success/10 text-success'}`}>
                  {job.match}% match
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 max-w-lg mx-auto"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand" />
              <span className="text-xs font-medium text-brand">Tailored for: Software Engineer at Stripe</span>
            </div>
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-light-muted dark:text-dark-muted mb-1">Professional Summary</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-light-text dark:text-dark-text leading-relaxed"
                >
                  Results-driven software engineer with 3+ years of experience in distributed systems and payment infrastructure. Proven track record of building scalable Python services...
                </motion.p>
              </div>
              <div>
                <p className="text-xs text-light-muted dark:text-dark-muted mb-1">ATS Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '78%' }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full bg-brand rounded-full"
                    />
                  </div>
                  <span className="text-xs font-semibold text-brand">78</span>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="mt-4 text-xs text-brand flex items-center gap-1 hover:gap-2 transition-all">
              See readiness checklist <ChevronRight size={12} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">Interview Readiness</p>
                <p className="text-xs text-light-muted dark:text-dark-muted">Software Engineer at Stripe</p>
              </div>
              <span className="text-lg font-bold text-brand">45%</span>
            </div>
            <div className="space-y-2">
              {[
                { round: 'Aptitude', tasks: 5, done: 3 },
                { round: 'Coding', tasks: 5, done: 2 },
                { round: 'Technical', tasks: 6, done: 0 },
                { round: 'HR', tasks: 4, done: 4 },
              ].map(({ round, tasks, done }, i) => (
                <motion.div
                  key={round}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${done === tasks ? 'bg-success' : done > 0 ? 'bg-brand' : 'bg-light-border dark:bg-dark-border'}`} />
                  <span className="text-xs text-light-text dark:text-dark-text w-20 flex-shrink-0">{round}</span>
                  <div className="flex-1 h-1 bg-light-border dark:bg-dark-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(done / tasks) * 100}%` }}
                      transition={{ delay: 0.2 + 0.1 * i, duration: 0.6 }}
                      className={`h-full rounded-full ${done === tasks ? 'bg-success' : 'bg-brand'}`}
                    />
                  </div>
                  <span className="text-[10px] text-light-muted dark:text-dark-muted">{done}/{tasks}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Landing() {
  const { toggle, isDark } = useTheme()
  const demoRef = useRef(null)

  const scrollToDemo = () => demoRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <PageWrapper>
      <div className="min-h-screen">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
          <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                <TrendingUp size={14} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-light-text dark:text-dark-text">NextRole</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <Link to="/login" className="px-3.5 py-2 rounded-xl text-sm text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="px-3.5 py-2 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand-hover transition-colors">
                Get started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 border border-brand/20 mb-6">
                  <Zap size={12} className="text-brand" />
                  <span className="text-xs font-medium text-brand">AI-powered placement intelligence</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-light-text dark:text-dark-text tracking-tight mb-5 leading-[1.1]">
                  Land your next role with{' '}
                  <span className="text-brand">AI-powered</span>{' '}
                  precision
                </h1>
                <p className="text-base text-light-muted dark:text-dark-muted leading-relaxed mb-8 max-w-md">
                  From job discovery to offer — NextRole combines intelligent job matching, AI resume generation, and placement readiness tracking in one unified platform.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link to="/signup">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm"
                    >
                      Get started free
                      <ArrowRight size={14} />
                    </motion.button>
                  </Link>
                  <button
                    onClick={scrollToDemo}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-sm font-medium text-light-text dark:text-dark-text hover:bg-light-card dark:hover:bg-dark-card transition-colors"
                  >
                    View demo
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-light-border dark:border-dark-border">
                  {[
                    { value: '10k+', label: 'Placements' },
                    { value: '94%', label: 'Match rate' },
                    { value: '3x', label: 'Faster prep' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-lg font-bold text-light-text dark:text-dark-text">{value}</p>
                      <p className="text-xs text-light-muted dark:text-dark-muted">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end pr-8"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-light-border dark:border-dark-border py-20 bg-light-surface dark:bg-dark-surface">
          <div className="max-w-6xl mx-auto px-5">
            <FadeIn className="text-center mb-12">
              <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">Features</p>
              <h2 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight mb-4">
                Everything you need to land the role
              </h2>
              <p className="text-base text-light-muted dark:text-dark-muted max-w-xl mx-auto">
                Three powerful modules that work together — connected by context, driven by AI.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: Briefcase,
                  title: 'Job Intelligence',
                  desc: 'Discover relevant jobs ranked by your skill match. Instantly see your fit percentage, skill gaps, and what to work on — before applying.',
                  points: ['Skill-based match scoring', 'Real-time skill gap analysis', 'One-click job context activation'],
                  delay: 0,
                },
                {
                  icon: FileText,
                  title: 'AI Resume Builder',
                  desc: 'Generate ATS-optimized resumes tailored to your active job. Live preview, keyword scoring, and clean PDF export — all in one place.',
                  points: ['Gemini-powered generation', 'Live ATS keyword scoring', 'Print-quality PDF export'],
                  delay: 0.1,
                },
                {
                  icon: Target,
                  title: 'Placement Readiness',
                  desc: 'Get a round-by-round interview preparation checklist generated from the job description. Track your progress and know exactly where you stand.',
                  points: ['Aptitude, Coding, Technical, HR', 'Dynamic readiness score', 'Progress tracking'],
                  delay: 0.2,
                },
              ].map(({ icon: Icon, title, desc, points, delay }) => (
                <FadeIn key={title} delay={delay}>
                  <motion.div
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{ duration: 0.15 }}
                    className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-card h-full"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-brand" />
                    </div>
                    <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-2">{title}</h3>
                    <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed mb-4">{desc}</p>
                    <ul className="space-y-1.5">
                      {points.map(p => (
                        <li key={p} className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
                          <CheckCircle2 size={12} className="text-brand flex-shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section ref={demoRef} className="py-20 border-t border-light-border dark:border-dark-border">
          <div className="max-w-6xl mx-auto px-5">
            <FadeIn className="text-center mb-12">
              <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">Context Propagation</p>
              <h2 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight mb-4">
                One action, three modules updated
              </h2>
              <p className="text-base text-light-muted dark:text-dark-muted max-w-xl mx-auto">
                Select a job once and watch your resume, skill gaps, and readiness checklist automatically align to that role.
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <InteractiveDemo />
            </FadeIn>
          </div>
        </section>

        {/* Placement Score */}
        <section className="py-20 border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">Placement Score</p>
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight mb-4">
                  One number. Complete clarity.
                </h2>
                <p className="text-base text-light-muted dark:text-dark-muted leading-relaxed mb-6">
                  Your Placement Score combines resume quality, interview readiness, and profile completeness into a single, actionable metric that shows exactly how ready you are.
                </p>
                <div className="space-y-3">
                  {[
                    { label: 'Resume ATS Score', weight: '40%', color: 'bg-brand' },
                    { label: 'Readiness Score', weight: '40%', color: 'bg-brand' },
                    { label: 'Profile Completeness', weight: '20%', color: 'bg-success' },
                  ].map(({ label, weight, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                      <span className="text-sm text-light-text dark:text-dark-text flex-1">{label}</span>
                      <span className="text-sm font-semibold text-light-text dark:text-dark-text">{weight}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.15}>
                <div className="flex justify-center">
                  <div className="relative">
                    <svg viewBox="0 0 200 200" className="w-48 h-48">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="#E6F4F1" strokeWidth="16" className="dark:stroke-dark-border" />
                      <motion.circle
                        cx="100" cy="100" r="80"
                        fill="none" stroke="#00D5B9" strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 80}`}
                        initial={{ strokeDashoffset: `${2 * Math.PI * 80}` }}
                        whileInView={{ strokeDashoffset: `${2 * Math.PI * 80 * 0.26}` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
                        transform="rotate(-90 100 100)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-light-text dark:text-dark-text">74</span>
                      <span className="text-xs text-light-muted dark:text-dark-muted">/ 100</span>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 border-t border-light-border dark:border-dark-border">
          <div className="max-w-6xl mx-auto px-5">
            <FadeIn className="text-center mb-12">
              <p className="text-xs font-semibold text-brand uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight">
                Three steps to placement-ready
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Build your profile',
                  desc: 'Add your skills, experience, and education. The more you add, the more precise your matches and recommendations become.',
                  icon: User,
                  delay: 0,
                },
                {
                  step: '02',
                  title: 'Select your target job',
                  desc: 'Browse ranked job listings and set one as your active role. This single action instantly activates all AI-driven features across every module.',
                  icon: Briefcase,
                  delay: 0.1,
                },
                {
                  step: '03',
                  title: 'Let AI prepare you',
                  desc: 'Generate a tailored resume, get your ATS score, and receive a round-by-round interview checklist — all aligned to your chosen role.',
                  icon: Zap,
                  delay: 0.2,
                },
              ].map(({ step, title, desc, icon: Icon, delay }) => (
                <FadeIn key={step} delay={delay}>
                  <div className="relative">
                    <div className="text-5xl font-bold text-light-border dark:text-dark-border mb-4 leading-none">{step}</div>
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
                      <Icon size={16} className="text-brand" />
                    </div>
                    <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-2">{title}</h3>
                    <p className="text-sm text-light-muted dark:text-dark-muted leading-relaxed">{desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
          <div className="max-w-6xl mx-auto px-5 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-light-text dark:text-dark-text tracking-tight mb-4">
                Ready to accelerate your placement?
              </h2>
              <p className="text-base text-light-muted dark:text-dark-muted mb-8 max-w-md mx-auto">
                Join thousands of candidates who use NextRole to go from job search to job offer.
              </p>
              <Link to="/signup">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm"
                >
                  Get started for free
                  <ArrowRight size={14} />
                </motion.button>
              </Link>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-light-border dark:border-dark-border py-8">
          <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center">
                <TrendingUp size={12} className="text-white" />
              </div>
              <span className="font-semibold text-sm text-light-text dark:text-dark-text">NextRole</span>
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              AI-powered placement intelligence
            </p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-xs text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="text-xs text-brand hover:text-brand-hover transition-colors font-medium">
                Get started
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PageWrapper>
  )
}

// Import User for How it works section
function User(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
