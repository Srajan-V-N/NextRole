import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Briefcase, Bookmark, BookmarkCheck,
  CheckCircle2, ExternalLink, X, SlidersHorizontal,
  Clock, DollarSign, Zap, AlertTriangle, Building2,
  Layers, Globe, ChevronDown, ListPlus
} from 'lucide-react'
import { jobsAPI, trackerAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { SkeletonJobCard } from '../components/common/SkeletonCard'
import EmptyState from '../components/common/EmptyState'

function CompanyLogo({ job }) {
  const [imgFailed, setImgFailed] = useState(false)
  const letter = job.logo || job.company?.[0]?.toUpperCase() || '?'
  const color = job.logo_color || '#00D5B9'
  const showImg = job.logo_url && !imgFailed

  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 select-none overflow-hidden shadow-sm"
      style={showImg ? { backgroundColor: '#f8f9fa' } : { backgroundColor: color }}
      title={job.company}
    >
      {showImg ? (
        <img
          src={job.logo_url}
          alt={job.company}
          className="w-9 h-9 object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="text-white text-base font-bold">{letter}</span>
      )}
    </div>
  )
}

function WorkModeBadge({ mode }) {
  const styles = {
    'Remote': 'bg-success/10 text-success border-success/20',
    'Hybrid': 'bg-brand/10 text-brand border-brand/20',
    'On-site': 'bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted border-light-border dark:border-dark-border',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${styles[mode] || styles['On-site']}`}>
      {mode}
    </span>
  )
}

function JobCard({ job, isActive, isSaved, isTracked, onSave, onSetActive, onTrack }) {
  const [saving, setSaving] = useState(false)
  const [activating, setActivating] = useState(false)
  const [tracking, setTracking] = useState(false)

  const handleSave = async (e) => {
    e.stopPropagation()
    setSaving(true)
    await onSave(job)
    setSaving(false)
  }

  const handleSetActive = async (e) => {
    e.stopPropagation()
    setActivating(true)
    await onSetActive(job)
    setActivating(false)
  }

  const handleTrack = async (e) => {
    e.stopPropagation()
    setTracking(true)
    await onTrack(job)
    setTracking(false)
  }

  const matchScore = job.match_score || 0
  const matchBg = matchScore >= 70
    ? 'bg-success/12 text-success border-success/25'
    : matchScore >= 40
    ? 'bg-brand/12 text-brand border-brand/25'
    : 'bg-warning/12 text-warning border-warning/25'

  const isIndian = job.location?.toLowerCase().includes('india') ||
    ['bengaluru', 'hyderabad', 'pune', 'chennai', 'mumbai', 'delhi', 'gurugram', 'noida'].some(
      c => job.location?.toLowerCase().includes(c)
    )

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-dark-surface border rounded-3xl flex flex-col transition-all duration-300 overflow-hidden group
        ${isActive
          ? 'border-brand shadow-card-active ring-1 ring-brand/20'
          : 'border-light-border dark:border-dark-border hover:border-brand/30 hover:shadow-card-hover'
        }`}
    >
      {isActive && <div className="h-0.5 bg-gradient-to-r from-brand to-brand-hover w-full" />}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <CompanyLogo job={job} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-semibold text-light-text dark:text-dark-text leading-snug line-clamp-2 flex-1">
                {job.title}
              </h3>
              <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${matchBg}`}>
                <Zap size={10} strokeWidth={2.5} />
                {matchScore}%
              </span>
            </div>
            <p className="text-xs font-medium text-light-muted dark:text-dark-muted truncate">{job.company}</p>
          </div>
        </div>

        {/* Location + Mode */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <span className="flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted">
            <MapPin size={11} className="flex-shrink-0 text-brand/60" />
            <span className="truncate max-w-[140px]">{job.location}</span>
          </span>
          {job.work_mode && <WorkModeBadge mode={job.work_mode} />}
          {isIndian && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900">
              🇮🇳 India
            </span>
          )}
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3.5 text-xs text-light-muted dark:text-dark-muted">
          {job.experience_level && (
            <span className="flex items-center gap-1">
              <Layers size={11} />
              {job.experience_level}
            </span>
          )}
          {job.salary && job.salary !== 'Competitive' && (
            <span className="flex items-center gap-1 font-medium text-light-text dark:text-dark-text">
              <DollarSign size={11} />
              {job.salary}
            </span>
          )}
          {job.posted && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {job.posted}
            </span>
          )}
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3.5">
            {job.skills.slice(0, 4).map(skill => (
              <span
                key={skill}
                className={`inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-medium border
                  ${job.skill_gaps?.includes(skill)
                    ? 'bg-warning/10 text-warning border-warning/25 dark:bg-warning/15'
                    : 'bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted border-light-border dark:border-dark-border'
                  }`}
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-xl text-[11px] font-medium bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Skill gap hint */}
        {job.skill_gaps?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3 px-3 py-2 rounded-xl bg-warning/8 border border-warning/15">
            <AlertTriangle size={11} className="text-warning flex-shrink-0" />
            <p className="text-[11px] text-warning/90">
              {job.skill_gaps.length} gap{job.skill_gaps.length > 1 ? 's' : ''}: {job.skill_gaps.slice(0, 2).join(', ')}
              {job.skill_gaps.length > 2 && ` +${job.skill_gaps.length - 2}`}
            </p>
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3.5 border-t border-light-border dark:border-dark-border mt-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? 'Unsave' : 'Save job'}
            className={`w-9 h-9 flex items-center justify-center rounded-2xl border transition-all duration-200 flex-shrink-0
              ${isSaved
                ? 'border-brand/30 bg-brand/10 text-brand'
                : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-brand/40 hover:text-brand hover:bg-brand/5'
              }`}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>

          <button
            onClick={handleTrack}
            disabled={tracking || isTracked}
            title={isTracked ? 'Added to tracker' : 'Add to tracker'}
            className={`w-9 h-9 flex items-center justify-center rounded-2xl border transition-all duration-200 flex-shrink-0
              ${isTracked
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-success/40 hover:text-success hover:bg-success/5'
              }`}
          >
            {isTracked ? <CheckCircle2 size={15} /> : <ListPlus size={15} />}
          </button>

          <button
            onClick={handleSetActive}
            disabled={activating}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-200
              ${isActive
                ? 'bg-brand/10 text-brand border border-brand/25 hover:bg-brand/15'
                : 'bg-brand text-white hover:bg-brand-hover shadow-sm'
              }`}
          >
            {activating ? (
              <span className="opacity-60">Setting...</span>
            ) : isActive ? (
              <><CheckCircle2 size={13} strokeWidth={2.5} /> Active Role</>
            ) : (
              'Set Active Role'
            )}
          </button>

          {job.apply_url && (
            <a
              href={job.apply_url !== '#' ? job.apply_url : undefined}
              target="_blank"
              rel="noopener noreferrer"
              title="View Job"
              className="w-9 h-9 flex items-center justify-center rounded-2xl border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:text-brand hover:border-brand/30 hover:bg-brand/5 transition-all flex-shrink-0"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const INDIAN_LOCATIONS = ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Gurugram', 'Remote India']
const GLOBAL_LOCATIONS = ['Remote', 'San Francisco', 'New York', 'London', 'Berlin', 'Amsterdam']

export default function Jobs() {
  const { activeJob, setActiveJob } = useApp()
  const [jobs, setJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [tab, setTab] = useState('search')
  const [searching, setSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filterExpLevel, setFilterExpLevel] = useState('')
  const [filterJobType, setFilterJobType] = useState('')
  const [filterWorkMode, setFilterWorkMode] = useState('')
  const [filterSalaryRange, setFilterSalaryRange] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [filterRegion, setFilterRegion] = useState('') // 'india' | 'global' | ''

  const [trackedJobIds, setTrackedJobIds] = useState(new Set())

  const handleTrackJob = async (job) => {
    try {
      await trackerAPI.add({
        job_title: job.title,
        company: job.company,
        location: job.location || '',
        stage: 'Saved',
        logo_color: job.logo_color || '#00D5B9',
        logo_url: job.logo_url || '',
        applied_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      setTrackedJobIds(prev => new Set([...prev, job.id]))
    } catch (err) {
      console.error('Failed to track job:', err)
    }
  }

  const loadSaved = useCallback(async () => {
    const res = await jobsAPI.getSaved()
    setSavedJobs(res.data.jobs || [])
  }, [])

  const searchJobs = useCallback(async (q = query, loc = location) => {
    setSearching(true)
    try {
      const res = await jobsAPI.search(q, loc)
      setJobs(res.data.jobs || [])
    } finally {
      setSearching(false)
    }
  }, [query, location])

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      await Promise.all([searchJobs('software engineer', ''), loadSaved()])
      setLoading(false)
    })()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    searchJobs()
  }

  const handleLocationClick = (loc) => {
    setLocation(loc)
    searchJobs(query, loc)
  }

  const handleSave = async (job) => {
    const isSaved = savedJobs.some(j => j.id === job.id)
    if (isSaved) {
      await jobsAPI.unsave(job.id)
      setSavedJobs(prev => prev.filter(j => j.id !== job.id))
    } else {
      await jobsAPI.save(job)
      setSavedJobs(prev => [...prev, job])
    }
  }

  const handleSetActive = async (job) => {
    await setActiveJob(job)
  }

  const applyFilters = (list) => {
    if (filterExpLevel) list = list.filter(j => j.experience_level?.toLowerCase() === filterExpLevel.toLowerCase())
    if (filterJobType) list = list.filter(j => j.type?.toLowerCase().includes(filterJobType.toLowerCase()))
    if (filterWorkMode) {
      list = list.filter(j => {
        const wm = j.work_mode?.toLowerCase() || ''
        const loc = j.location?.toLowerCase() || ''
        const t = filterWorkMode.toLowerCase()
        if (t === 'remote') return wm === 'remote' || loc.includes('remote')
        if (t === 'hybrid') return wm === 'hybrid'
        if (t === 'on-site') return wm === 'on-site'
        return true
      })
    }
    if (filterSalaryRange) list = list.filter(j => j.salary && j.salary !== 'Competitive')
    if (filterCompany) list = list.filter(j => j.company?.toLowerCase().includes(filterCompany.toLowerCase()))
    if (filterRegion === 'india') {
      list = list.filter(j =>
        ['bengaluru', 'hyderabad', 'pune', 'chennai', 'mumbai', 'delhi', 'gurugram', 'noida', 'india'].some(
          c => j.location?.toLowerCase().includes(c)
        )
      )
    } else if (filterRegion === 'global') {
      list = list.filter(j =>
        !['bengaluru', 'hyderabad', 'pune', 'chennai', 'mumbai', 'delhi', 'gurugram', 'noida', 'india'].some(
          c => j.location?.toLowerCase().includes(c)
        )
      )
    }
    return list
  }

  const filteredResults = useMemo(() => applyFilters([...jobs]),
    [jobs, filterExpLevel, filterJobType, filterWorkMode, filterSalaryRange, filterCompany, filterRegion])
  const filteredSaved = useMemo(() => applyFilters([...savedJobs]),
    [savedJobs, filterExpLevel, filterJobType, filterWorkMode, filterSalaryRange, filterCompany, filterRegion])
  const filteredDisplayed = tab === 'saved' ? filteredSaved : filteredResults

  const hasActiveFilters = filterExpLevel || filterJobType || filterWorkMode || filterSalaryRange || filterCompany || filterRegion

  const clearFilters = () => {
    setFilterExpLevel('')
    setFilterJobType('')
    setFilterWorkMode('')
    setFilterSalaryRange('')
    setFilterCompany('')
    setFilterRegion('')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">Job Opportunities</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">India + Global · matched to your skills</p>
        </div>
        {!loading && jobs.length > 0 && (
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-light-text dark:text-dark-text leading-tight">{jobs.length}</p>
            <p className="text-[11px] text-light-muted dark:text-dark-muted leading-tight">roles found</p>
          </div>
        )}
      </div>

      {/* Active job banner */}
      <AnimatePresence>
        {activeJob && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand/8 border border-brand/25"
          >
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse-slow flex-shrink-0" />
            <p className="text-xs text-light-text dark:text-dark-text flex-1 min-w-0 truncate">
              <span className="font-semibold text-brand">Active: </span>
              {activeJob.title} at {activeJob.company} — resume &amp; readiness tailored to this role
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2.5">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Job title, role, or keyword..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <div className="hidden sm:flex relative w-44">
          <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Location..."
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <Button type="submit" loading={searching} size="md">Search</Button>
        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border text-sm font-medium transition-all duration-150
            ${showFilters || hasActiveFilters
              ? 'border-brand bg-brand/8 text-brand'
              : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-brand/30 hover:text-brand'
            }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-brand" />}
        </button>
      </form>

      {/* Location shortcuts */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-light-muted dark:text-dark-muted self-center font-medium">Quick:</span>
        {INDIAN_LOCATIONS.slice(0, 5).map(loc => (
          <button key={loc} onClick={() => handleLocationClick(loc)}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all
              ${location === loc ? 'border-brand bg-brand/10 text-brand' : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-brand/30 hover:text-brand'}`}>
            🇮🇳 {loc}
          </button>
        ))}
        <button onClick={() => handleLocationClick('Remote')}
          className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all
            ${location === 'Remote' ? 'border-brand bg-brand/10 text-brand' : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-brand/30 hover:text-brand'}`}>
          🌍 Remote
        </button>
        {location && (
          <button onClick={() => { setLocation(''); searchJobs(query, '') }}
            className="px-2.5 py-1 rounded-xl text-xs font-medium border border-error/30 text-error hover:bg-error/8 transition-all flex items-center gap-1">
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-3xl border border-light-border dark:border-dark-border bg-light-subtle dark:bg-dark-subtle">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-light-text dark:text-dark-text">Advanced Filters</p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-error hover:text-error/80 font-medium flex items-center gap-1">
                    <X size={11} /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { label: 'Experience', value: filterExpLevel, set: setFilterExpLevel, options: ['Entry', 'Mid', 'Senior'] },
                  { label: 'Job Type', value: filterJobType, set: setFilterJobType, options: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
                  { label: 'Work Mode', value: filterWorkMode, set: setFilterWorkMode, options: ['Remote', 'Hybrid', 'On-site'] },
                  { label: 'Salary Info', value: filterSalaryRange, set: setFilterSalaryRange, options: ['Has salary'] },
                  { label: 'Region', value: filterRegion, set: setFilterRegion, options: [['India Jobs', 'india'], ['Global Jobs', 'global']], isMap: true },
                ].map(({ label, value, set, options, isMap }) => (
                  <select
                    key={label}
                    value={value}
                    onChange={e => set(e.target.value)}
                    className={`px-2.5 py-2 rounded-2xl text-xs border transition-all cursor-pointer appearance-none font-medium bg-white dark:bg-dark-surface
                      ${value ? 'border-brand text-brand bg-brand/5 dark:bg-brand/10' : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted'}`}
                  >
                    <option value="">{label}</option>
                    {(options || []).map(o =>
                      isMap
                        ? <option key={o[0]} value={o[1]}>{o[0]}</option>
                        : <option key={o} value={o}>{o}</option>
                    )}
                  </select>
                ))}
                <input
                  type="text"
                  placeholder="Company..."
                  value={filterCompany}
                  onChange={e => setFilterCompany(e.target.value)}
                  className="px-2.5 py-2 rounded-2xl text-xs border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-brand transition-all font-medium"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 p-1 bg-light-subtle dark:bg-dark-subtle rounded-2xl border border-light-border dark:border-dark-border w-fit">
          {[
            { key: 'search', label: 'Results', count: filteredResults.length },
            { key: 'saved', label: 'Saved', count: filteredSaved.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5
                ${tab === key
                  ? 'bg-white dark:bg-dark-surface text-light-text dark:text-dark-text shadow-card border border-light-border dark:border-dark-border'
                  : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
                }`}
            >
              {label}
              <span className={`min-w-[18px] h-[18px] px-1 rounded-md text-[10px] font-bold
                ${tab === key ? 'bg-brand/12 text-brand' : 'bg-light-border dark:bg-dark-border text-light-muted dark:text-dark-muted'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-wrap gap-1.5">
              {[
                filterExpLevel && { label: filterExpLevel, clear: () => setFilterExpLevel('') },
                filterJobType && { label: filterJobType, clear: () => setFilterJobType('') },
                filterWorkMode && { label: filterWorkMode, clear: () => setFilterWorkMode('') },
                filterSalaryRange && { label: 'Has salary', clear: () => setFilterSalaryRange('') },
                filterCompany && { label: `Co: ${filterCompany}`, clear: () => setFilterCompany('') },
                filterRegion && { label: filterRegion === 'india' ? '🇮🇳 India' : '🌍 Global', clear: () => setFilterRegion('') },
              ].filter(Boolean).map(pill => (
                <span key={pill.label} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20">
                  {pill.label}
                  <button onClick={pill.clear}><X size={9} /></button>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Job grid */}
      {loading || (searching && tab === 'search') ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonJobCard key={i} />)}
        </div>
      ) : filteredDisplayed.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={tab === 'saved' ? 'No saved jobs yet' : hasActiveFilters ? 'No jobs match filters' : 'No jobs found'}
          description={tab === 'saved' ? 'Save jobs from the Results tab' : hasActiveFilters ? 'Try adjusting your filters' : 'Try a different keyword'}
          action={tab === 'saved' ? () => setTab('search') : hasActiveFilters ? clearFilters : undefined}
          actionLabel={tab === 'saved' ? 'Browse results' : hasActiveFilters ? 'Clear filters' : undefined}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDisplayed.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: Math.min(i * 0.03, 0.25), duration: 0.18 }}
              >
                <JobCard
                  job={job}
                  isActive={activeJob?.id === job.id}
                  isSaved={savedJobs.some(j => j.id === job.id)}
                  isTracked={trackedJobIds.has(job.id)}
                  onSave={handleSave}
                  onSetActive={handleSetActive}
                  onTrack={handleTrackJob}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
