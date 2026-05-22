import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban, Plus, X, Trash2, ChevronRight,
  Calendar, BarChart2, CheckCircle2, ChevronLeft,
} from 'lucide-react'
import { trackerAPI } from '../services/api'
import Card from '../components/common/Card'

const STAGES = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected']

const STAGE_STYLES = {
  Saved:      { dot: 'bg-light-muted dark:bg-dark-muted',            header: 'border-light-muted/30',                  badge: 'bg-light-subtle dark:bg-dark-subtle text-light-muted dark:text-dark-muted' },
  Applied:    { dot: 'bg-brand',                                      header: 'border-brand/30',                         badge: 'bg-brand/10 text-brand' },
  Assessment: { dot: 'bg-blue-500',                                   header: 'border-blue-500/30',                      badge: 'bg-blue-500/10 text-blue-500' },
  Interview:  { dot: 'bg-warning',                                    header: 'border-warning/30',                       badge: 'bg-warning/10 text-warning' },
  Offer:      { dot: 'bg-success',                                    header: 'border-success/30',                       badge: 'bg-success/10 text-success' },
  Rejected:   { dot: 'bg-red-400/70 dark:bg-red-500/50',             header: 'border-red-300/30 dark:border-red-500/20', badge: 'bg-red-100/60 dark:bg-red-500/10 text-red-400' },
}

const EVENT_COLORS = {
  interview:  { dot: 'bg-warning',    border: 'border-warning',    text: 'text-warning',    label: 'Interview'   },
  assessment: { dot: 'bg-blue-500',   border: 'border-blue-500',   text: 'text-blue-500',   label: 'Assessment'  },
  offer:      { dot: 'bg-success',    border: 'border-success',    text: 'text-success',    label: 'Offer'       },
  followup:   { dot: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500', label: 'Follow-up'   },
}

const STAGES_NEEDING_DATE = {
  Interview:  'interview_date',
  Assessment: 'assessment_deadline',
  Offer:      'offer_deadline',
}

// ── Calendar helpers ─────────────────────────────────────────────────────────

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay()
}

function formatEventDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function buildEventMap(pipeline) {
  const events = []
  pipeline.forEach(entry => {
    if (entry.interview_date)
      events.push({ date: entry.interview_date, type: 'interview', company: entry.company, job_title: entry.job_title, entryId: entry.id })
    if (entry.assessment_deadline)
      events.push({ date: entry.assessment_deadline, type: 'assessment', company: entry.company, job_title: entry.job_title, entryId: entry.id })
    if (entry.offer_deadline)
      events.push({ date: entry.offer_deadline, type: 'offer', company: entry.company, job_title: entry.job_title, entryId: entry.id })
    if (entry.followup_date)
      events.push({ date: entry.followup_date, type: 'followup', company: entry.company, job_title: entry.job_title, entryId: entry.id })
  })
  return events
}

// ── PipelineCard ──────────────────────────────────────────────────────────────

function PipelineCard({ entry, onMove, onDelete, onSetDate }) {
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const availableStages = STAGES.filter(s => s !== entry.stage)

  const handleOpen = (e) => {
    e.stopPropagation()
    const rect = btnRef.current.getBoundingClientRect()
    const left = Math.max(4, Math.min(rect.right - 140, window.innerWidth - 144))
    setMenuPos({ top: rect.bottom + 4, left })
    setShowMenu(true)
  }

  useEffect(() => {
    if (!showMenu) return
    const handler = () => setShowMenu(false)
    const id = setTimeout(() => document.addEventListener('click', handler), 0)
    return () => {
      clearTimeout(id)
      document.removeEventListener('click', handler)
    }
  }, [showMenu])

  // Determine which date field to show as the event date on the card
  const eventDate = entry.interview_date || entry.assessment_deadline || entry.offer_deadline || entry.followup_date
  const dateableField = STAGES_NEEDING_DATE[entry.stage]
  const missingDate = dateableField && !entry[dateableField]

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="p-2.5 rounded-xl bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-brand/30 hover:shadow-card transition-all duration-200 group"
      >
        <div className="flex items-start gap-2 mb-1.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
            style={{ backgroundColor: entry.logo_color || '#00D5B9' }}
          >
            {entry.logo || entry.company?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-light-text dark:text-dark-text truncate leading-tight">{entry.job_title}</p>
            <p className="text-[11px] text-light-muted dark:text-dark-muted truncate leading-tight mt-0.5">{entry.company}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {missingDate && (
              <button
                onClick={() => onSetDate(entry.id, entry.stage)}
                className="w-6 h-6 flex items-center justify-center rounded-lg text-light-muted hover:text-brand hover:bg-brand/10 transition-colors"
                title="Set date"
              >
                <Calendar size={11} />
              </button>
            )}
            <button
              ref={btnRef}
              onClick={handleOpen}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-light-muted hover:text-brand hover:bg-brand/10 transition-colors"
            >
              <ChevronRight size={12} />
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-light-muted hover:text-error hover:bg-error/10 transition-colors"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {(entry.applied_date || eventDate) && (
          <div className="flex items-center gap-1 text-[10px] text-light-muted dark:text-dark-muted">
            <Calendar size={9} />
            {eventDate || entry.applied_date}
          </div>
        )}

        {entry.notes && (
          <p className="text-[11px] text-light-muted dark:text-dark-muted mt-1.5 line-clamp-2 italic">"{entry.notes}"</p>
        )}

        {missingDate && (
          <button
            onClick={(e) => { e.stopPropagation(); onSetDate(entry.id, entry.stage) }}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-brand/60 hover:text-brand transition-colors"
          >
            <Calendar size={9} />
            <span>Set date to add to calendar</span>
          </button>
        )}
      </motion.div>

      {showMenu && createPortal(
        <div
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
          className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-dropdown p-1 min-w-[140px]"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-[10px] font-semibold text-light-muted dark:text-dark-muted px-2 py-1">Move to stage</p>
          {availableStages.map(s => (
            <button
              key={s}
              onClick={() => { onMove(entry.id, s); setShowMenu(false) }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium hover:bg-light-subtle dark:hover:bg-dark-subtle transition-colors text-left"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STAGE_STYLES[s]?.dot}`} />
              {s}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

// ── DateSetPopover ────────────────────────────────────────────────────────────

function DateSetPopover({ pending, onConfirm, onSkip }) {
  const [date, setDate] = useState('')
  const label =
    pending.targetStage === 'Interview'  ? 'Set interview date' :
    pending.targetStage === 'Assessment' ? 'Set assessment deadline' :
                                           'Set offer deadline'

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[9998]"
        onClick={onSkip}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999 }}
        className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-dropdown p-4 w-72"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-xs font-semibold text-light-text dark:text-dark-text mb-1">{label}</p>
        <p className="text-[11px] text-light-muted dark:text-dark-muted mb-3">Optional — you can skip and set it later.</p>
        <input
          type="date"
          className="input-base mb-3"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={onSkip} className="flex-1 btn-secondary text-xs py-2">Skip</button>
          <button onClick={() => onConfirm(date || null)} className="flex-1 btn-primary text-xs py-2">Save</button>
        </div>
      </motion.div>
    </>,
    document.body
  )
}

// ── AddJobModal ───────────────────────────────────────────────────────────────

function AddJobModal({ stage, onAdd, onClose }) {
  const [form, setForm] = useState({
    job_title: '',
    company: '',
    location: '',
    applied_date: new Date().toISOString().split('T')[0],
    interview_date: '',
    assessment_deadline: '',
    offer_deadline: '',
    notes: '',
    logo_color: '#00D5B9',
  })
  const [saving, setSaving] = useState(false)

  const dateConfig = STAGES_NEEDING_DATE[stage]
    ? {
        label: stage === 'Interview'  ? 'Interview Date'
             : stage === 'Assessment' ? 'Assessment Deadline'
                                      : 'Offer Deadline',
        field: STAGES_NEEDING_DATE[stage],
      }
    : { label: 'Applied Date', field: 'applied_date' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.job_title || !form.company) return
    setSaving(true)
    await onAdd({ ...form, stage })
    setSaving(false)
    onClose()
  }

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
        className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-6 w-full max-w-md shadow-dropdown"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-light-text dark:text-dark-text">Add to {stage}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-light-muted hover:text-light-text hover:bg-light-subtle transition-colors">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Job Title *</label>
            <input
              className="input-base"
              placeholder="e.g. Software Engineer"
              value={form.job_title}
              onChange={e => setForm(p => ({ ...p, job_title: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Company *</label>
            <input
              className="input-base"
              placeholder="e.g. Google"
              value={form.company}
              onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              className="input-base"
              placeholder="e.g. Bengaluru, Remote"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">{dateConfig.label}</label>
            <input
              type="date"
              className="input-base"
              value={form[dateConfig.field]}
              onChange={e => setForm(p => ({ ...p, [dateConfig.field]: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input-base resize-none"
              rows={2}
              placeholder="Any notes about this application..."
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-primary">
              {saving ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── MiniCalendar ──────────────────────────────────────────────────────────────

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function MiniCalendar({ events, selectedDay, todayStr, onDayClick }) {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [tooltip, setTooltip] = useState(null)

  const showTooltip = (e, dayEvents) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ events: dayEvents, x: rect.left + rect.width / 2, y: rect.top - 6 })
  }
  const hideTooltip = () => setTooltip(null)

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    })
    return map
  }, [events])

  const cells = useMemo(() => {
    const leading = firstDayOfWeek(viewYear, viewMonth)
    const total = daysInMonth(viewYear, viewMonth)
    const arr = []
    for (let i = 0; i < leading; i++) arr.push(null)
    for (let d = 1; d <= total; d++) arr.push(d)
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [viewYear, viewMonth])

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-light-muted hover:text-light-text hover:bg-light-subtle dark:hover:bg-dark-subtle transition-colors"
        >
          <ChevronLeft size={13} />
        </button>
        <span className="text-[11px] font-semibold text-light-text dark:text-dark-text">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-light-muted hover:text-light-text hover:bg-light-subtle dark:hover:bg-dark-subtle transition-colors"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-light-muted dark:text-dark-muted py-0.5">
            {d}
          </div>
        ))}
      </div>

      {tooltip && createPortal(
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}
          className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-dropdown p-2 min-w-[168px] max-w-[220px]"
        >
          {tooltip.events.map((ev, i) => (
            <div key={i} className={`flex items-start gap-1.5 py-0.5 pl-1.5 border-l-2 ${EVENT_COLORS[ev.type].border} ${i > 0 ? 'mt-1' : ''}`}>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-light-text dark:text-dark-text truncate leading-snug">{ev.job_title}</p>
                <p className="text-[10px] text-light-muted dark:text-dark-muted truncate">{ev.company} · {EVENT_COLORS[ev.type].label}</p>
              </div>
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="h-7" />

          const mm = String(viewMonth + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateStr = `${viewYear}-${mm}-${dd}`
          const dayEvents = eventsByDate[dateStr] || []
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDay

          return (
            <button
              key={idx}
              onClick={() => onDayClick(dateStr)}
              onMouseEnter={dayEvents.length ? (e) => showTooltip(e, dayEvents) : undefined}
              onMouseLeave={dayEvents.length ? hideTooltip : undefined}
              className={[
                'h-7 w-full rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors',
                isToday    ? 'bg-brand/15 text-brand font-bold' : '',
                isSelected && !isToday ? 'bg-light-subtle dark:bg-dark-subtle' : '',
                !isToday && !isSelected ? 'text-light-text dark:text-dark-text hover:bg-light-subtle dark:hover:bg-dark-subtle' : '',
              ].join(' ')}
            >
              <span className="text-[10px] leading-none">{day}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5">
                  {dayEvents.slice(0, 3).map((ev, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${EVENT_COLORS[ev.type].dot}`} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── UpcomingEvents ────────────────────────────────────────────────────────────

function UpcomingEvents({ events, todayStr }) {
  const upcoming = useMemo(() => (
    events
      .filter(ev => ev.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10)
  ), [events, todayStr])

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6 px-3 text-center">
        <Calendar size={18} className="text-light-muted dark:text-dark-muted opacity-40" />
        <p className="text-[11px] font-medium text-light-muted dark:text-dark-muted">No upcoming events</p>
        <p className="text-[10px] text-light-muted dark:text-dark-muted opacity-60 leading-relaxed">
          Move a card to Interview, Assessment, or Offer to schedule events
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-2 py-1.5">
      {upcoming.map((ev, i) => (
        <div key={i} className="flex items-stretch rounded-lg overflow-hidden">
          <div className={`w-0.5 flex-shrink-0 ${EVENT_COLORS[ev.type].dot}`} />
          <div className="flex flex-1 items-center gap-2.5 px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-light-text dark:text-dark-text truncate leading-tight">{ev.job_title}</p>
              <p className="text-[10px] text-light-muted dark:text-dark-muted truncate mt-0.5">{ev.company}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-[10px] font-semibold ${EVENT_COLORS[ev.type].text}`}>{EVENT_COLORS[ev.type].label}</p>
              <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5">{formatEventDate(ev.date)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── TrackerCalendarPanel ──────────────────────────────────────────────────────

function TrackerCalendarPanel({ pipeline }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const events = useMemo(() => buildEventMap(pipeline), [pipeline])

  const selectedDayEvents = useMemo(() => (
    selectedDay ? events.filter(ev => ev.date === selectedDay) : []
  ), [events, selectedDay])

  const handleDayClick = (dateStr) => {
    setSelectedDay(prev => prev === dateStr ? null : dateStr)
  }

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto">
      {/* Calendar card */}
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-3 shadow-card flex-shrink-0">
        <MiniCalendar
          events={events}
          selectedDay={selectedDay}
          todayStr={todayStr}
          onDayClick={handleDayClick}
        />

        {/* Day-detail section */}
        <AnimatePresence>
          {selectedDay && selectedDayEvents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 pt-2 border-t border-light-border dark:border-dark-border space-y-1.5 overflow-hidden"
            >
              {selectedDayEvents.map((ev, i) => (
                <div key={i} className={`flex items-center gap-2 pl-2 border-l-2 ${EVENT_COLORS[ev.type].border}`}>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-light-text dark:text-dark-text truncate">{ev.job_title}</p>
                    <p className="text-[9px] text-light-muted dark:text-dark-muted">{ev.company} · {EVENT_COLORS[ev.type].label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {selectedDay && selectedDayEvents.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 pt-2 border-t border-light-border dark:border-dark-border text-[10px] text-light-muted dark:text-dark-muted"
            >
              No events on this day
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming events card */}
      <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-card flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="px-3 py-2 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <p className="text-[11px] font-bold text-light-text dark:text-dark-text">Upcoming</p>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 pb-2">
          <UpcomingEvents events={events} todayStr={todayStr} />
        </div>
      </div>
    </div>
  )
}

// ── Tracker (main export) ─────────────────────────────────────────────────────

export default function Tracker() {
  const [pipeline, setPipeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingTo, setAddingTo] = useState(null)
  const [pendingDateSet, setPendingDateSet] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await trackerAPI.get()
        // Normalize legacy "OA" stage to "Assessment"
        setPipeline((res.data.pipeline || []).map(e =>
          e.stage === 'OA' ? { ...e, stage: 'Assessment' } : e
        ))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleAdd = async (entry) => {
    const res = await trackerAPI.add(entry)
    setPipeline(prev => [...prev, res.data.entry])
  }

  const handleMove = async (id, newStage, extraData = {}) => {
    setPipeline(prev => prev.map(e => e.id === id ? { ...e, stage: newStage, ...extraData } : e))
    await trackerAPI.update(id, { stage: newStage, ...extraData })
  }

  const handleMoveWithDatePrompt = (id, newStage) => {
    if (STAGES_NEEDING_DATE[newStage]) {
      setPendingDateSet({ id, targetStage: newStage })
    } else {
      handleMove(id, newStage)
    }
  }

  const confirmDateSet = (date) => {
    const fieldName = STAGES_NEEDING_DATE[pendingDateSet.targetStage]
    const extra = date ? { [fieldName]: date } : {}
    handleMove(pendingDateSet.id, pendingDateSet.targetStage, extra)
    setPendingDateSet(null)
  }

  const skipDateSet = () => {
    handleMove(pendingDateSet.id, pendingDateSet.targetStage)
    setPendingDateSet(null)
  }

  const handleSetDate = (id, stage) => {
    setPendingDateSet({ id, targetStage: stage })
  }

  const handleDelete = async (id) => {
    setPipeline(prev => prev.filter(e => e.id !== id))
    await trackerAPI.remove(id)
  }

  const getStageEntries = (stage) => pipeline.filter(e => e.stage === stage)

  const totalApps = pipeline.length
  const offers = getStageEntries('Offer').length
  const interviews = getStageEntries('Interview').length
  const offerRate = totalApps > 0 ? Math.round((offers / totalApps) * 100) : 0

  if (loading) {
    return (
      <div className="space-y-6 flex-1 min-h-0">
        <div className="h-8 w-48 bg-light-subtle dark:bg-dark-subtle rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-3xl bg-light-subtle dark:bg-dark-subtle animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0 pb-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight">Application Tracker</h1>
        <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Track your job applications through every stage</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Applications', value: totalApps,       icon: BarChart2,    color: 'text-brand',   bg: 'bg-brand/10' },
          { label: 'In Interview',        value: interviews,      icon: CheckCircle2, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Offers',              value: offers,          icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Offer Rate',          value: `${offerRate}%`, icon: BarChart2,    color: 'text-brand',   bg: 'bg-brand/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-light-text dark:text-dark-text leading-tight">{value}</p>
              <p className="text-[10px] text-light-muted dark:text-dark-muted leading-tight">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Split layout — kanban left, calendar right */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Left: Kanban — flex-1 min-w-0 so it shrinks below content width */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <div className="overflow-x-auto h-full">
            <div className="flex gap-2 h-full" style={{ minWidth: 'max-content' }}>
              {STAGES.map(stage => {
                const entries = getStageEntries(stage)
                const style = STAGE_STYLES[stage]
                return (
                  <div key={stage} className="w-64 flex flex-col gap-2 h-full">
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-2.5 py-2 rounded-2xl bg-white dark:bg-dark-surface border ${style.header} flex-shrink-0`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                        <span className="text-xs font-semibold text-light-text dark:text-dark-text">{stage}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${style.badge}`}>
                          {entries.length}
                        </span>
                      </div>
                      <button
                        onClick={() => setAddingTo(stage)}
                        className="w-6 h-6 flex items-center justify-center rounded-xl text-light-muted hover:text-brand hover:bg-brand/10 transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Cards — scrollable within column */}
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-1.5 pr-0.5">
                      <AnimatePresence>
                        {entries.map(entry => (
                          <PipelineCard
                            key={entry.id}
                            entry={entry}
                            onMove={handleMoveWithDatePrompt}
                            onDelete={handleDelete}
                            onSetDate={handleSetDate}
                          />
                        ))}
                      </AnimatePresence>

                      {entries.length === 0 && (
                        <button
                          onClick={() => setAddingTo(stage)}
                          className="w-full py-6 rounded-2xl border-2 border-dashed border-light-border dark:border-dark-border text-[11px] text-light-muted dark:text-dark-muted hover:border-brand/30 hover:text-brand transition-all duration-200 flex flex-col items-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>Add application</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Calendar panel — fixed 280px, hidden on mobile */}
        <div
          className="hidden lg:flex flex-col flex-shrink-0 min-h-0"
          style={{ width: '280px' }}
        >
          <TrackerCalendarPanel pipeline={pipeline} />
        </div>

      </div>

      {/* Date-set popover */}
      <AnimatePresence>
        {pendingDateSet && (
          <DateSetPopover
            pending={pendingDateSet}
            onConfirm={confirmDateSet}
            onSkip={skipDateSet}
          />
        )}
      </AnimatePresence>

      {/* Add modal */}
      <AnimatePresence>
        {addingTo && (
          <AddJobModal
            stage={addingTo}
            onAdd={handleAdd}
            onClose={() => setAddingTo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
