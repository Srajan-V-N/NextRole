import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ExternalLink, Star, Clock, Zap, Code2, AlertCircle, ChevronRight } from 'lucide-react'
import { coursesAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import Card from '../components/common/Card'
import { Link } from 'react-router-dom'

const PLATFORM_COLORS = {
  'Coursera': '#0056D2',
  'Udemy': '#EC5252',
  'freeCodeCamp': '#006400',
  'YouTube': '#FF0000',
  'Great Learning': '#FF6B35',
  'Google': '#4285F4',
  'AWS Training (Free)': '#FF9900',
  'edX (Free Audit)': '#02262B',
  'The Odin Project': '#CBD5E0',
  'TechWorld with Nana': '#6B46C1',
  'Meta Front-End Developer Certificate': '#0866FF',
  'default': '#00D5B9',
}

function PlatformDot({ platform }) {
  const color = PLATFORM_COLORS[platform] || PLATFORM_COLORS.default
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={10}
          className={i <= Math.round(rating) ? 'text-warning fill-warning' : 'text-light-border dark:text-dark-border'}
        />
      ))}
      <span className="text-[11px] text-light-muted dark:text-dark-muted ml-0.5">{rating}</span>
    </div>
  )
}

function CourseCard({ course, show, isFree }) {
  if (!show) return null
  return (
    <motion.a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="block p-4 rounded-3xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface hover:border-brand/30 hover:shadow-card-hover transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <PlatformDot platform={course.platform} />
          <span className="text-[11px] font-semibold text-light-muted dark:text-dark-muted truncate">{course.platform}</span>
          {isFree && (
            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-success/15 text-success">
              FREE
            </span>
          )}
        </div>
        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg
          ${course.level === 'Beginner' ? 'bg-success/10 text-success' :
            course.level === 'Intermediate' ? 'bg-brand/10 text-brand' : 'bg-warning/10 text-warning'}`}>
          {course.level}
        </span>
      </div>
      <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-2 line-clamp-2 group-hover:text-brand transition-colors">{course.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StarRating rating={course.rating} />
          <span className="flex items-center gap-1 text-[11px] text-light-muted dark:text-dark-muted">
            <Clock size={10} />
            {course.duration}
          </span>
        </div>
        <ExternalLink size={13} className="text-light-muted dark:text-dark-muted group-hover:text-brand transition-colors" />
      </div>
    </motion.a>
  )
}

function LeetCodeSection({ roadmap, role }) {
  const totalEasy = roadmap.reduce((s, t) => s + t.easy, 0)
  const totalMedium = roadmap.reduce((s, t) => s + t.medium, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text tracking-tight">LeetCode Roadmap</h2>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">Curated for {role || 'your target role'}</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-success">{totalEasy}</p>
            <p className="text-[10px] text-light-muted dark:text-dark-muted">Easy</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-warning">{totalMedium}</p>
            <p className="text-[10px] text-light-muted dark:text-dark-muted">Medium</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roadmap.map((topic, i) => (
          <motion.a
            key={topic.topic}
            href={topic.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -1 }}
            className="flex items-center gap-4 p-4 rounded-3xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface hover:border-brand/30 hover:shadow-card-hover transition-all duration-300 group"
          >
            <div className="w-8 h-8 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
              <Code2 size={14} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-light-text dark:text-dark-text group-hover:text-brand transition-colors">{topic.topic}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-success font-medium">{topic.easy} Easy</span>
                <span className="text-[11px] text-warning font-medium">{topic.medium} Medium</span>
              </div>
            </div>
            <ExternalLink size={13} className="text-light-muted dark:text-dark-muted group-hover:text-brand transition-colors flex-shrink-0" />
          </motion.a>
        ))}
      </div>
    </div>
  )
}

export default function Courses() {
  const { activeJob } = useApp()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('both') // 'free' | 'paid' | 'both'

  useEffect(() => {
    ;(async () => {
      try {
        const role = activeJob?.title || ''
        const res = await coursesAPI.get(role)
        setData(res.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [activeJob])

  const allCourses = data?.courses || []
  const roadmap = data?.leetcode_roadmap || []
  const role = data?.role || activeJob?.title || 'General'
  const skillGaps = data?.skill_gaps || []

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-light-subtle dark:bg-dark-subtle rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-3xl bg-light-subtle dark:bg-dark-subtle animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">Courses & Learning</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">
            Skill up for {role} · {allCourses.length} skill areas covered
          </p>
        </div>
        {/* Free/Paid toggle */}
        <div className="flex gap-1 p-1 bg-light-subtle dark:bg-dark-subtle rounded-2xl border border-light-border dark:border-dark-border">
          {[
            { key: 'free', label: 'Free' },
            { key: 'paid', label: 'Paid' },
            { key: 'both', label: 'All' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150
                ${filter === key
                  ? 'bg-white dark:bg-dark-surface text-brand shadow-card border border-light-border dark:border-dark-border'
                  : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Active job context */}
      {activeJob ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand/8 border border-brand/25">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse-slow" />
          <p className="text-xs text-light-text dark:text-dark-text flex-1">
            <span className="font-semibold text-brand">Based on: </span>
            {activeJob.title} at {activeJob.company}
            {skillGaps.length > 0 && <span className="text-light-muted dark:text-dark-muted"> · {skillGaps.length} skill gaps found</span>}
          </p>
          <Link to="/jobs" className="text-xs text-brand hover:text-brand-hover font-semibold">Change role →</Link>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border">
          <AlertCircle size={14} className="text-warning flex-shrink-0" />
          <p className="text-xs text-light-muted dark:text-dark-muted">
            <Link to="/jobs" className="text-brand font-medium">Set an active job</Link>
            {' '}to get personalized course recommendations based on your skill gaps.
          </p>
        </div>
      )}

      {/* Course recommendations */}
      {allCourses.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text tracking-tight mb-1">Recommended Courses</h2>
            <p className="text-xs text-light-muted dark:text-dark-muted">
              {filter === 'free' ? 'Free courses only' : filter === 'paid' ? 'Paid courses only' : 'All courses'}
              {skillGaps.length > 0 && ` · Targeting: ${skillGaps.slice(0, 3).join(', ')}${skillGaps.length > 3 ? ` +${skillGaps.length - 3}` : ''}`}
            </p>
          </div>

          {allCourses.map((skillGroup, gi) => {
            const showFree = filter === 'free' || filter === 'both'
            const showPaid = filter === 'paid' || filter === 'both'
            const visibleFree = showFree ? skillGroup.free || [] : []
            const visiblePaid = showPaid ? skillGroup.paid || [] : []
            const allVisible = [...visibleFree, ...visiblePaid]
            if (allVisible.length === 0) return null

            return (
              <div key={gi}>
                <div className="flex items-center flex-wrap gap-x-2 gap-y-1.5 mb-3">
                  <div className="w-6 h-6 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                    <Zap size={12} className="text-brand" />
                  </div>
                  <h3 className="text-sm font-semibold text-light-text dark:text-dark-text capitalize flex-1 min-w-0">
                    {skillGroup.skill}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {showFree && visibleFree.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-success/10 text-success">{visibleFree.length} Free</span>
                    )}
                    {showPaid && visiblePaid.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-brand/10 text-brand">{visiblePaid.length} Paid</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleFree.map((c, i) => (
                    <CourseCard key={`free-${i}`} course={c} show isFree />
                  ))}
                  {visiblePaid.map((c, i) => (
                    <CourseCard key={`paid-${i}`} course={c} show />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LeetCode Roadmap */}
      {roadmap.length > 0 && (
        <div className="pt-2 border-t border-light-border dark:border-dark-border">
          <LeetCodeSection roadmap={roadmap} role={role} />
        </div>
      )}
    </div>
  )
}
