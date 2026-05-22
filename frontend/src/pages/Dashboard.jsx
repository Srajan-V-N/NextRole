import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, FileText, Target, User, TrendingUp, AlertCircle,
  ArrowRight, ChevronRight, CheckCircle2, Clock, Zap, Flame,
  BookOpen, Kanban, MapPin, Star, BarChart2, Trophy
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { dashboardAPI, trackerAPI, jobsAPI } from '../services/api'
import { useCountUp } from '../hooks/useCountUp'
import ProgressBar from '../components/common/ProgressBar'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import { SkeletonLine } from '../components/common/SkeletonCard'

// Circular placement score gauge
function PlacementGauge({ score }) {
  const displayed = useCountUp(score, 1400)
  const r = 72
  const circumference = 2 * Math.PI * r
  const color = score >= 70 ? '#00D756' : score >= 40 ? '#00D5B9' : '#FFC822'
  const label = score >= 70 ? 'Strong' : score >= 40 ? 'Building Up' : 'Getting Started'

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 160 160" className="w-52 h-52 -rotate-90">
          <circle cx="80" cy="80" r={r} fill="none"
            className="stroke-light-border dark:stroke-dark-border" strokeWidth="10" />
          <motion.circle
            cx="80" cy="80" r={r} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[2.8rem] font-bold text-light-text dark:text-dark-text leading-none tracking-tight">
            {displayed}
          </span>
          <span className="text-xs text-light-muted dark:text-dark-muted mt-0.5 font-medium">/ 100</span>
        </div>
      </div>
      <p className="text-base font-bold text-light-text dark:text-dark-text mt-3 tracking-tight">Placement Score</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full animate-pulse-slow" style={{ backgroundColor: color }} />
        <p className="text-xs text-light-muted dark:text-dark-muted">{label} · Resume + Readiness + Profile</p>
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon: Icon, color = 'brand', to, description }) {
  const displayed = useCountUp(value, 1200)
  const colorMap = {
    brand: { bg: 'bg-brand/10 dark:bg-brand/15', text: 'text-brand', bar: 'brand' },
    success: { bg: 'bg-success/10 dark:bg-success/15', text: 'text-success', bar: 'success' },
    warning: { bg: 'bg-warning/10 dark:bg-warning/15', text: 'text-warning', bar: 'warning' },
  }
  const c = colorMap[color] || colorMap.brand

  return (
    <Card className="flex items-center gap-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon size={17} className={c.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5 mb-1.5">
          <span className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">{displayed}</span>
          <span className="text-xs text-light-muted dark:text-dark-muted">/ 100</span>
        </div>
        <ProgressBar value={value} color={c.bar} height="xs" />
        {description && <p className="text-[10px] text-light-muted dark:text-dark-muted mt-1">{description}</p>}
      </div>
      {to && (
        <Link to={to} className="flex-shrink-0 text-light-muted dark:text-dark-muted hover:text-brand transition-colors p-1">
          <ChevronRight size={15} />
        </Link>
      )}
    </Card>
  )
}

function ActivityIcon({ type }) {
  const config = {
    job: { bg: 'bg-brand/10 dark:bg-brand/15', icon: <Briefcase size={11} className="text-brand" /> },
    resume: { bg: 'bg-success/10 dark:bg-success/15', icon: <FileText size={11} className="text-success" /> },
    readiness: { bg: 'bg-warning/10 dark:bg-warning/15', icon: <Target size={11} className="text-warning" /> },
  }
  const c = config[type] || { bg: 'bg-light-subtle dark:bg-dark-subtle', icon: <Clock size={11} className="text-light-muted" /> }
  return (
    <div className={`w-6 h-6 rounded-lg ${c.bg} border border-light-border dark:border-dark-border flex items-center justify-center flex-shrink-0`}>
      {c.icon}
    </div>
  )
}

function MiniJobCard({ job }) {
  return (
    <Link to="/jobs" className="flex items-center gap-3 p-3 rounded-2xl border border-light-border dark:border-dark-border hover:border-brand/30 hover:bg-light-subtle dark:hover:bg-dark-subtle transition-all duration-200 group">
      <div className="w-8 h-8 rounded-xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: job.logo_color || '#00D5B9' }}>
        {job.logo_url ? (
          <img src={job.logo_url} alt={job.company} className="w-full h-full object-contain p-0.5" onError={e => e.target.style.display = 'none'} />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{job.logo || job.company?.[0]}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-light-text dark:text-dark-text truncate leading-tight">{job.title}</p>
        <p className="text-[11px] text-light-muted dark:text-dark-muted truncate leading-tight mt-0.5">{job.company} · {job.location}</p>
      </div>
      <div className={`flex-shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-lg
        ${(job.match_score || 0) >= 70 ? 'bg-success/10 text-success' : (job.match_score || 0) >= 40 ? 'bg-brand/10 text-brand' : 'bg-warning/10 text-warning'}`}>
        {job.match_score || 0}%
      </div>
    </Link>
  )
}

function StreakDots({ streak = 0 }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="flex items-center gap-2">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
            ${i < streak
              ? 'bg-brand text-white shadow-glow'
              : 'bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border'
            }`}>
            {d}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { refreshDashboard } = useApp()
  const [data, setData] = useState(null)
  const [trackerData, setTrackerData] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [streak] = useState(3) // TODO: persisted streak tracking

  useEffect(() => {
    ;(async () => {
      try {
        const [dashRes, trackerRes, jobsRes] = await Promise.allSettled([
          dashboardAPI.get(),
          trackerAPI.get(),
          jobsAPI.search('software engineer', ''),
        ])
        if (dashRes.status === 'fulfilled') setData(dashRes.value.data)
        if (trackerRes.status === 'fulfilled') setTrackerData(trackerRes.value.data.pipeline || [])
        if (jobsRes.status === 'fulfilled') {
          setRecommendedJobs((jobsRes.value.data.jobs || []).slice(0, 3))
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLine width="1/3" height="h-7" />
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 h-80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    )
  }

  const placementScore = data?.placement_score || 0
  const atsScore = data?.ats_score || 0
  const readinessScore = data?.readiness_score || 0
  const profileCompleteness = data?.profile_completeness || 0
  const activeJob = data?.active_job
  const skillGaps = data?.skill_gaps || []
  const activity = data?.activity || []
  const savedCount = data?.saved_jobs_count || 0
  const completedTasks = data?.completed_tasks || 0
  const totalTasks = data?.total_tasks || 0

  const pipelineStages = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected']
  const pipelineCounts = pipelineStages.reduce((acc, stage) => {
    acc[stage] = trackerData.filter(e => e.stage === stage).length
    return acc
  }, {})
  const totalPipeline = trackerData.length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">Dashboard</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Your career progress at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-warning/10 border border-warning/20">
          <Flame size={14} className="text-warning" />
          <span className="text-xs font-bold text-warning">{streak} day streak</span>
        </div>
      </div>

      {/* Active job banner */}
      {activeJob && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand/8 border border-brand/25"
        >
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse-slow flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-brand">Active role: </span>
            <span className="text-xs text-light-text dark:text-dark-text">{activeJob.title} at {activeJob.company}</span>
          </div>
          <Link to="/jobs" className="text-xs text-brand hover:text-brand-hover font-semibold flex-shrink-0">
            Change →
          </Link>
        </motion.div>
      )}

      {/* Hero row: Placement Score + Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Placement gauge */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center">
          <PlacementGauge score={placementScore} />
        </Card>

        {/* Score breakdown */}
        <div className="lg:col-span-3 grid grid-cols-1 gap-3">
          <MetricCard label="Resume ATS Score" value={atsScore} icon={FileText} color="brand" to="/resume" description="Keyword match against active job description" />
          <MetricCard label="Interview Readiness" value={readinessScore} icon={Target} color="warning" to="/readiness" description="Preparation task completion rate" />
          <MetricCard label="Profile Strength" value={profileCompleteness} icon={User} color="success" to="/profile" description="How complete your career profile is" />
        </div>
      </div>

      {/* Score formula strip */}
      <Card padding={false} className="overflow-hidden">
        <div className="px-5 py-3 border-b border-light-border dark:border-dark-border flex items-center gap-2">
          <Zap size={13} className="text-brand" />
          <p className="text-xs font-bold text-light-text dark:text-dark-text">Placement Score Formula</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-light-border dark:divide-dark-border">
          {[
            { label: 'Resume ATS', weight: '40%', value: atsScore, color: 'text-brand' },
            { label: 'Readiness',  weight: '40%', value: readinessScore, color: 'text-warning' },
            { label: 'Profile',    weight: '20%', value: profileCompleteness, color: 'text-success' },
          ].map(({ label, weight, value, color }) => (
            <div key={label} className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-[11px] text-light-muted dark:text-dark-muted">{label}</p>
                <span className={`text-[11px] font-bold ${color}`}>{weight}</span>
              </div>
              <p className="text-xl font-bold text-light-text dark:text-dark-text">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 3-column grid: Pipeline, Streak, Skill Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Applications Pipeline */}
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Kanban size={13} className="text-brand" />
              <p className="text-xs font-bold text-light-text dark:text-dark-text">Pipeline</p>
            </div>
            <Link to="/tracker" className="text-[11px] text-brand hover:text-brand-hover font-semibold">View all →</Link>
          </div>
          <div className="p-4 space-y-2">
            {totalPipeline === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-light-muted dark:text-dark-muted mb-2">No applications tracked yet</p>
                <Link to="/tracker" className="text-xs text-brand font-semibold">Start tracking →</Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-3">
                  <span className="text-2xl font-bold text-light-text dark:text-dark-text">{totalPipeline}</span>
                  <span className="text-xs text-light-muted dark:text-dark-muted ml-1">applications</span>
                </div>
                {pipelineStages.filter(s => pipelineCounts[s] > 0).map(stage => (
                  <div key={stage} className="flex items-center gap-2">
                    <span className="text-[11px] text-light-muted dark:text-dark-muted w-16">{stage}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-light-subtle dark:bg-dark-subtle overflow-hidden">
                      <div className="h-full bg-brand rounded-full" style={{ width: `${(pipelineCounts[stage] / totalPipeline) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-light-text dark:text-dark-text w-4 text-right">{pipelineCounts[stage]}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>

        {/* Weekly Streak */}
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border flex items-center gap-2">
            <Flame size={13} className="text-warning" />
            <p className="text-xs font-bold text-light-text dark:text-dark-text">Weekly Streak</p>
          </div>
          <div className="p-5 flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-light-text dark:text-dark-text">{streak}</span>
              <span className="text-xs text-light-muted dark:text-dark-muted">consecutive days</span>
            </div>
            <StreakDots streak={streak} />
            <div className="w-full space-y-2 text-xs">
              {[
                { label: 'Tasks completed', value: completedTasks },
                { label: 'Jobs saved', value: savedCount },
                { label: 'Applications', value: totalPipeline },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-light-muted dark:text-dark-muted">{label}</span>
                  <span className="font-semibold text-light-text dark:text-dark-text">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Skill Gaps */}
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={13} className="text-warning" />
              <p className="text-xs font-bold text-light-text dark:text-dark-text">Skill Gaps</p>
            </div>
            {activeJob && <span className="text-[10px] text-light-muted dark:text-dark-muted truncate max-w-[80px]">{activeJob.title}</span>}
          </div>
          <div className="p-5">
            {!activeJob ? (
              <div className="text-center py-4">
                <p className="text-xs text-light-muted dark:text-dark-muted mb-2">Select an active job to see gaps</p>
                <Link to="/jobs" className="text-xs text-brand font-semibold">Browse jobs →</Link>
              </div>
            ) : skillGaps.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-3">
                <CheckCircle2 size={20} className="text-success" />
                <p className="text-xs text-success font-semibold">All skills matched!</p>
                <p className="text-[11px] text-light-muted dark:text-dark-muted text-center">No major gaps for this role</p>
              </div>
            ) : (
              <div className="space-y-2">
                {skillGaps.slice(0, 6).map(skill => (
                  <div key={skill} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                    <span className="text-xs text-light-text dark:text-dark-text capitalize">{skill}</span>
                    <Link to="/courses" className="ml-auto text-[10px] text-brand hover:underline">Learn →</Link>
                  </div>
                ))}
                {skillGaps.length > 6 && (
                  <Link to="/courses" className="text-[11px] text-brand hover:text-brand-hover font-semibold">
                    +{skillGaps.length - 6} more → View courses
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Career Gap Roadmap Snapshot */}
      {activeJob && skillGaps.length > 0 && (
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-brand" />
              <p className="text-xs font-bold text-light-text dark:text-dark-text">Career Gap Roadmap</p>
            </div>
            <Link to="/courses" className="text-[11px] text-brand hover:text-brand-hover font-semibold">View courses →</Link>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-light-muted dark:text-dark-muted">Target Role</p>
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">{activeJob.title} at {activeJob.company}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-light-muted dark:text-dark-muted">Current Readiness</p>
                <p className="text-2xl font-bold text-brand">{placementScore}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Resume ATS', current: atsScore, target: 85, icon: FileText, color: 'brand' },
                { label: 'Readiness', current: readinessScore, target: 80, icon: Target, color: 'warning' },
                { label: 'Profile', current: profileCompleteness, target: 90, icon: User, color: 'success' },
                { label: 'Skills Gap', current: Math.max(0, 100 - skillGaps.length * 10), target: 100, icon: BookOpen, color: 'brand' },
              ].map(({ label, current, target, icon: Icon, color }) => (
                <div key={label} className="p-3 rounded-2xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon size={12} className={`text-${color}`} />
                    <span className="text-[11px] font-medium text-light-muted dark:text-dark-muted">{label}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1.5">
                    <span className="text-lg font-bold text-light-text dark:text-dark-text">{current}</span>
                    <span className="text-[11px] text-light-muted dark:text-dark-muted">/ {target}</span>
                  </div>
                  <div className="h-1 rounded-full bg-light-border dark:bg-dark-border overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${Math.min((current / target) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Recommended Jobs + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recommended Jobs */}
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={13} className="text-brand" />
              <p className="text-xs font-bold text-light-text dark:text-dark-text">Recommended Jobs</p>
            </div>
            <Link to="/jobs" className="text-[11px] text-brand hover:text-brand-hover font-semibold">Browse all →</Link>
          </div>
          <div className="p-3 space-y-2">
            {recommendedJobs.length === 0 ? (
              <div className="text-center py-4">
                <Link to="/jobs" className="text-xs text-brand font-semibold">Browse jobs →</Link>
              </div>
            ) : (
              recommendedJobs.map(job => <MiniJobCard key={job.id} job={job} />)
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <BarChart2 size={13} className="text-brand" />
              <p className="text-xs font-bold text-light-text dark:text-dark-text">Quick Stats</p>
            </div>
          </div>
          <div className="divide-y divide-light-border dark:divide-dark-border">
            {[
              { label: 'Saved jobs', value: savedCount, icon: Briefcase, to: '/jobs' },
              { label: 'Tasks completed', value: `${completedTasks} / ${totalTasks}`, icon: CheckCircle2, to: '/readiness' },
              { label: 'Applications tracked', value: totalPipeline, icon: Kanban, to: '/tracker' },
              { label: 'Active role', value: activeJob ? activeJob.title : 'None set', icon: Target, to: '/jobs' },
            ].map(({ label, value, icon: Icon, to }) => (
              <Link key={label} to={to} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-light-subtle dark:hover:bg-dark-subtle transition-colors">
                <div className="w-7 h-7 rounded-xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-light-muted dark:text-dark-muted" />
                </div>
                <span className="text-xs text-light-muted dark:text-dark-muted flex-1">{label}</span>
                <span className="text-xs font-semibold text-light-text dark:text-dark-text truncate max-w-[120px]">{value}</span>
                <ChevronRight size={13} className="text-light-muted dark:text-dark-muted group-hover:text-brand transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <Card padding={false} className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border">
            <p className="text-xs font-bold text-light-text dark:text-dark-text">Recent Activity</p>
          </div>
          <div className="divide-y divide-light-border dark:divide-dark-border">
            {activity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <ActivityIcon type={item.type} />
                <span className="text-xs text-light-text dark:text-dark-text flex-1">{item.text}</span>
                <span className="text-[10px] text-light-muted dark:text-dark-muted flex-shrink-0">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state CTA */}
      {!activeJob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-light-border dark:border-dark-border rounded-3xl p-10 text-center"
        >
          <div className="w-12 h-12 rounded-3xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
            <Trophy size={20} className="text-brand" />
          </div>
          <h3 className="text-sm font-bold text-light-text dark:text-dark-text mb-1.5">Set your target role to unlock everything</h3>
          <p className="text-xs text-light-muted dark:text-dark-muted mb-5 max-w-sm mx-auto">
            Select a job to activate AI resume tailoring, interview readiness, skill gap analysis, and career roadmap.
          </p>
          <Link to="/jobs">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors shadow-sm"
            >
              Browse jobs <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      )}
    </div>
  )
}
