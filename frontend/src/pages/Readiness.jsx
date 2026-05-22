import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, CheckCircle2, Circle, ChevronDown, ChevronUp,
  AlertCircle, Briefcase, MessageSquare, X, Lightbulb, Flame
} from 'lucide-react'
import { readinessAPI, interviewAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import ProgressBar from '../components/common/ProgressBar'
import { SkeletonTaskRow } from '../components/common/SkeletonCard'
import { useCountUp } from '../hooks/useCountUp'
import { Link } from 'react-router-dom'

const ROUND_CONFIG = {
  aptitude:  { label: 'Aptitude',  color: 'text-blue-500',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20' },
  coding:    { label: 'Coding',    color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  technical: { label: 'Technical', color: 'text-brand',      bg: 'bg-brand/10',      border: 'border-brand/20' },
  hr:        { label: 'HR',        color: 'text-success',    bg: 'bg-success/10',    border: 'border-success/20' },
}
const ROUND_ORDER = ['aptitude', 'coding', 'technical', 'hr']

function RoundSection({ roundKey, tasks, onToggle }) {
  const [expanded, setExpanded] = useState(true)
  const config = ROUND_CONFIG[roundKey]
  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const pct = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-light-subtle dark:hover:bg-dark-subtle transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-2xl flex items-center justify-center ${config.bg} border ${config.border}`}>
            <Target size={14} className={config.color} />
          </div>
          <div>
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">{config.label}</p>
            <p className="text-[10px] text-light-muted dark:text-dark-muted">{completed}/{total} tasks · {pct}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28 hidden sm:block">
            <ProgressBar value={pct} height="xs" color={pct === 100 ? 'success' : 'brand'} />
          </div>
          <span className={`text-xs font-bold ${pct === 100 ? 'text-success' : 'text-light-text dark:text-dark-text'}`}>
            {pct === 100 ? '✓ Done' : `${pct}%`}
          </span>
          {expanded ? <ChevronUp size={14} className="text-light-muted" /> : <ChevronDown size={14} className="text-light-muted" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-1 border-t border-light-border dark:border-dark-border pt-3">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 py-2.5 group hover:bg-light-subtle dark:hover:bg-dark-subtle rounded-xl px-2 -mx-2 transition-colors"
                >
                  <button
                    onClick={() => onToggle(task.id, !task.completed)}
                    className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={16} className="text-success" />
                    ) : (
                      <Circle size={16} className="text-light-border dark:text-dark-border group-hover:text-brand transition-colors" />
                    )}
                  </button>
                  <span className={`text-sm leading-relaxed flex-1 transition-all ${
                    task.completed ? 'text-light-muted dark:text-dark-muted line-through' : 'text-light-text dark:text-dark-text'
                  }`}>
                    {task.task}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MockInterviewModal({ onClose, activeJob }) {
  const [questions, setQuestions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('technical')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await interviewAPI.generate()
        setQuestions(res.data.questions)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const TABS = [
    { key: 'technical', label: 'Technical' },
    { key: 'behavioral', label: 'Behavioral' },
    { key: 'hr', label: 'HR' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl w-full max-w-2xl shadow-dropdown max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h3 className="text-sm font-bold text-light-text dark:text-dark-text flex items-center gap-2">
              <MessageSquare size={15} className="text-brand" />
              Mock Interview
            </h3>
            {activeJob && (
              <p className="text-[11px] text-light-muted dark:text-dark-muted mt-0.5">{activeJob.title} at {activeJob.company}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-light-muted hover:text-light-text hover:bg-light-subtle transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-light-border dark:border-dark-border">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-2xl text-xs font-semibold transition-all
                ${activeTab === key ? 'bg-brand text-white shadow-sm' : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-subtle dark:hover:bg-dark-subtle'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="flex gap-1">
                {[0, 0.15, 0.3].map(d => (
                  <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: d, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-brand" />
                ))}
              </div>
              <p className="text-xs text-light-muted dark:text-dark-muted">Generating interview questions...</p>
            </div>
          ) : questions ? (
            (questions[activeTab] || []).map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="p-4 rounded-2xl border border-light-border dark:border-dark-border bg-light-subtle dark:bg-dark-subtle"
              >
                <div className="flex items-start gap-2 mb-2">
                  <span className="w-5 h-5 rounded-lg bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text leading-relaxed">{q.question}</p>
                </div>
                {q.tip && (
                  <div className="flex items-start gap-2 mt-2 pl-7">
                    <Lightbulb size={12} className="text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-light-muted dark:text-dark-muted leading-relaxed">{q.tip}</p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-xs text-light-muted dark:text-dark-muted text-center py-8">Failed to generate questions. Please try again.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Readiness() {
  const { activeJob } = useApp()
  const [checklist, setChecklist] = useState({})
  const [score, setScore] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)
  const [completedTasks, setCompletedTasks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showInterview, setShowInterview] = useState(false)
  const displayedScore = useCountUp(score, 1200)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await readinessAPI.get()
        setChecklist(res.data.checklist || {})
        setScore(res.data.score || 0)
        setTotalTasks(res.data.total_tasks || 0)
        setCompletedTasks(res.data.completed_tasks || 0)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await readinessAPI.generate()
      setChecklist(res.data.checklist || {})
      setScore(0)
      setTotalTasks(res.data.total_tasks || 0)
      setCompletedTasks(0)
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (taskId, completed) => {
    const newChecklist = {}
    for (const round of ROUND_ORDER) {
      newChecklist[round] = (checklist[round] || []).map(t =>
        t.id === taskId ? { ...t, completed } : t
      )
    }
    setChecklist(newChecklist)
    const allTasks = ROUND_ORDER.flatMap(r => newChecklist[r] || [])
    const completedCount = allTasks.filter(t => t.completed).length
    setCompletedTasks(completedCount)
    setScore(totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0)
    try {
      const res = await readinessAPI.updateTask(taskId, completed)
      setScore(res.data.score || 0)
      setCompletedTasks(res.data.completed_tasks || 0)
    } catch {
      const reverted = {}
      for (const round of ROUND_ORDER) {
        reverted[round] = (checklist[round] || []).map(t =>
          t.id === taskId ? { ...t, completed: !completed } : t
        )
      }
      setChecklist(reverted)
    }
  }

  const hasChecklist = ROUND_ORDER.some(r => (checklist[r] || []).length > 0)
  const readinessLabel = score >= 80 ? 'Interview Ready' : score >= 50 ? 'Getting There' : 'Just Started'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">Interview Readiness</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Round-by-round preparation checklist</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInterview(true)}
            disabled={!activeJob}
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border border-light-border dark:border-dark-border text-xs font-semibold text-light-muted dark:text-dark-muted hover:border-brand/30 hover:text-brand transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageSquare size={13} />
            Mock Interview
          </button>
          <Button
            onClick={handleGenerate}
            loading={generating}
            icon={generating ? undefined : <Sparkles size={13} />}
            disabled={!activeJob}
          >
            {generating ? 'Analyzing...' : hasChecklist ? 'Regenerate' : 'Generate Checklist'}
          </Button>
        </div>
      </div>

      {/* Active job context */}
      {activeJob ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand/8 border border-brand/25"
        >
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse-slow" />
          <p className="text-xs text-light-text dark:text-dark-text flex-1">
            <span className="font-semibold text-brand">Preparing for: </span>
            {activeJob.title} at {activeJob.company}
          </p>
          <Link to="/jobs" className="text-xs text-brand font-medium flex-shrink-0">Change</Link>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border">
          <AlertCircle size={14} className="text-warning flex-shrink-0" />
          <p className="text-xs text-light-muted dark:text-dark-muted">
            <Link to="/jobs" className="text-brand hover:text-brand-hover font-medium">Select an active job</Link>
            {' '}to generate a tailored preparation checklist.
          </p>
        </div>
      )}

      {/* Score overview */}
      {hasChecklist && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4 sm:col-span-1">
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" className="stroke-light-border dark:stroke-dark-border" strokeWidth="5" />
                <motion.circle
                  cx="32" cy="32" r="26" fill="none"
                  stroke={score >= 70 ? '#00D756' : '#00D5B9'} strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  initial={{ strokeDashoffset: `${2 * Math.PI * 26}` }}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 26 * (1 - score / 100)}` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-light-text dark:text-dark-text">
                {displayedScore}%
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-light-text dark:text-dark-text">{readinessLabel}</p>
              <p className="text-xs text-light-muted dark:text-dark-muted">{completedTasks} / {totalTasks} tasks</p>
              {score > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Flame size={10} className="text-warning" />
                  <span className="text-[10px] text-warning font-medium">Keep going!</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="sm:col-span-2 space-y-2.5">
            {ROUND_ORDER.map(rk => {
              const tasks = checklist[rk] || []
              const done = tasks.filter(t => t.completed).length
              const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
              const config = ROUND_CONFIG[rk]
              return (
                <div key={rk} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${config.bg} flex-shrink-0`}>
                    <Target size={10} className={config.color} />
                  </div>
                  <span className="text-xs text-light-muted dark:text-dark-muted w-16 flex-shrink-0">{config.label}</span>
                  <div className="flex-1">
                    <ProgressBar value={pct} height="sm" color={pct === 100 ? 'success' : 'brand'} />
                  </div>
                  <span className="text-xs font-semibold text-light-text dark:text-dark-text w-12 text-right flex-shrink-0">
                    {pct === 100 ? '✓' : `${done}/${tasks.length}`}
                  </span>
                </div>
              )
            })}
          </Card>
        </div>
      )}

      {/* Checklist */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-5 space-y-2">
              <div className="h-5 w-24 bg-light-border dark:bg-dark-border rounded animate-pulse" />
              {[...Array(3)].map((_, j) => <SkeletonTaskRow key={j} />)}
            </div>
          ))}
        </div>
      ) : generating ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-brand/5 border border-brand/20">
            <div className="flex gap-0.5">
              {[0, 0.15, 0.3].map(d => (
                <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, delay: d, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-brand" />
              ))}
            </div>
            <span className="text-xs text-brand font-medium">Analyzing job and generating personalized checklist...</span>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-5 space-y-2">
              <div className="h-5 w-24 bg-light-border dark:bg-dark-border rounded animate-pulse" />
              {[...Array(3)].map((_, j) => <SkeletonTaskRow key={j} />)}
            </div>
          ))}
        </div>
      ) : !hasChecklist ? (
        <div className="border-2 border-dashed border-light-border dark:border-dark-border rounded-3xl p-12 text-center">
          <div className="w-10 h-10 rounded-3xl bg-brand/10 flex items-center justify-center mx-auto mb-3">
            <Target size={18} className="text-brand" />
          </div>
          <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1">No checklist yet</h3>
          <p className="text-xs text-light-muted dark:text-dark-muted mb-4 max-w-xs mx-auto">
            {activeJob
              ? 'Generate a personalized round-by-round interview preparation plan.'
              : 'Select an active job first, then generate your checklist.'}
          </p>
          {activeJob && (
            <Button onClick={handleGenerate} loading={generating} size="sm" icon={<Sparkles size={12} />}>
              Generate Checklist
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {ROUND_ORDER.map(rk => {
            const tasks = checklist[rk] || []
            if (tasks.length === 0) return null
            return <RoundSection key={rk} roundKey={rk} tasks={tasks} onToggle={handleToggle} />
          })}
        </div>
      )}

      {/* Mock Interview Modal */}
      <AnimatePresence>
        {showInterview && (
          <MockInterviewModal
            onClose={() => setShowInterview(false)}
            activeJob={activeJob}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
