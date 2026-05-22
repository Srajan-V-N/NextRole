import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, User, Briefcase, GraduationCap, Link2, X, Linkedin, Copy, Check, Sparkles } from 'lucide-react'
import { profileAPI, linkedinAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import ProgressBar from '../components/common/ProgressBar'
import { SkeletonLine } from '../components/common/SkeletonCard'
import { useCountUp } from '../hooks/useCountUp'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle} className="flex items-center gap-1 text-[11px] text-light-muted dark:text-dark-muted hover:text-brand transition-colors">
      {copied ? <Check size={11} className="text-success" /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function LinkedInOptimizer({ profile, activeJob }) {
  const [targetRole, setTargetRole] = useState(activeJob?.title || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await linkedinAPI.optimize(targetRole || activeJob?.title || 'Software Engineer')
      setResult(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
          <Linkedin size={14} className="text-[#0A66C2]" />
        </div>
        <div>
          <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">LinkedIn Optimizer</h2>
          <p className="text-[10px] text-light-muted dark:text-dark-muted">AI-powered profile optimization</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="input-base flex-1"
          placeholder="Target role (e.g. Software Engineer)"
          value={targetRole}
          onChange={e => setTargetRole(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0A66C2] text-white text-xs font-semibold hover:bg-[#004182] transition-colors disabled:opacity-60 flex-shrink-0"
        >
          {loading ? (
            <div className="flex gap-0.5">
              {[0, 0.1, 0.2].map(d => (
                <motion.div key={d} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, delay: d, repeat: Infinity }}
                  className="w-1 h-1 rounded-full bg-white" />
              ))}
            </div>
          ) : <Sparkles size={12} />}
          Optimize
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-4 rounded-2xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wide">Headline</p>
              <CopyButton text={result.headline} />
            </div>
            <p className="text-sm text-light-text dark:text-dark-text font-medium">{result.headline}</p>
          </div>

          <div className="p-4 rounded-2xl bg-light-subtle dark:bg-dark-subtle border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wide">About / Summary</p>
              <CopyButton text={result.summary} />
            </div>
            <p className="text-xs text-light-text dark:text-dark-text leading-relaxed whitespace-pre-line">{result.summary}</p>
          </div>

          {result.keywords?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-2">Top Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map(k => (
                  <span key={k} className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20">{k}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </Card>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const { activeJob } = useApp()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  const completeness = useCountUp(profile?.completeness || 0, 1200)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await profileAPI.get()
        setProfile(res.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await profileAPI.update(profile)
      setProfile(res.data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field, value) => setProfile(prev => ({ ...prev, [field]: value }))

  const addSkill = () => {
    const val = skillInput.trim()
    if (val && !profile.skills.includes(val)) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, val] }))
    }
    setSkillInput('')
  }

  const removeSkill = (skill) => setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))

  const handleSkillKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  const addExperience = () => setProfile(prev => ({
    ...prev, experience: [...prev.experience, { company: '', role: '', duration: '', description: '' }]
  }))

  const updateExp = (i, field, val) => setProfile(prev => {
    const exp = [...prev.experience]
    exp[i] = { ...exp[i], [field]: val }
    return { ...prev, experience: exp }
  })

  const removeExp = (i) => setProfile(prev => ({
    ...prev, experience: prev.experience.filter((_, idx) => idx !== i)
  }))

  const addEducation = () => setProfile(prev => ({
    ...prev, education: [...prev.education, { degree: '', institution: '', year: '' }]
  }))

  const updateEdu = (i, field, val) => setProfile(prev => {
    const edu = [...prev.education]
    edu[i] = { ...edu[i], [field]: val }
    return { ...prev, education: edu }
  })

  const removeEdu = (i) => setProfile(prev => ({
    ...prev, education: prev.education.filter((_, idx) => idx !== i)
  }))

  if (loading) {
    return (
      <div className="space-y-5">
        <SkeletonLine width="1/3" height="h-7" />
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonLine key={i} height="h-10" />)}
        </div>
      </div>
    )
  }

  const completenessColor = profile.completeness >= 80 ? 'success' : profile.completeness >= 50 ? 'brand' : 'warning'

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">Profile</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Your information drives all AI features</p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-success flex items-center gap-1"
              >
                <CheckCircle2 size={12} /> Saved
              </motion.span>
            )}
          </AnimatePresence>
          <Button onClick={handleSave} loading={saving} size="md">Save changes</Button>
        </div>
      </div>

      {/* Completeness */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">Profile Completeness</p>
            <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">A complete profile improves your Placement Score</p>
          </div>
          <span className={`text-2xl font-bold ${completenessColor === 'success' ? 'text-success' : completenessColor === 'brand' ? 'text-brand' : 'text-warning'}`}>
            {completeness}%
          </span>
        </div>
        <ProgressBar value={profile.completeness} color={completenessColor} height="md" />
        <p className="text-xs text-light-muted dark:text-dark-muted mt-2">
          {profile.completeness < 50
            ? 'Add skills, experience, and education to reach 80%+'
            : profile.completeness < 80
            ? 'Add more details to maximize your Placement Score'
            : 'Great — your profile is well-filled.'}
        </p>
      </Card>

      {/* Personal info */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User size={14} className="text-light-muted dark:text-dark-muted" />
          <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Personal Info</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Full Name" value={profile.name || ''} onChange={e => updateField('name', e.target.value)} placeholder="Jane Smith" />
          <Input label="Email" value={profile.email || ''} disabled placeholder="your@email.com" className="opacity-70" />
          <Input label="Phone" value={profile.phone || ''} onChange={e => updateField('phone', e.target.value)} placeholder="+1 234 567 8900" />
          <Input label="Location" value={profile.location || ''} onChange={e => updateField('location', e.target.value)} placeholder="City, Country" />
          <Input label="Bio" textarea rows={2} value={profile.bio || ''} onChange={e => updateField('bio', e.target.value)} placeholder="A short professional bio..." className="col-span-2" />
        </div>
      </Card>

      {/* Links */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={14} className="text-light-muted dark:text-dark-muted" />
          <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Links</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Input label="LinkedIn" value={profile.linkedin || ''} onChange={e => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" />
          <Input label="GitHub" value={profile.github || ''} onChange={e => updateField('github', e.target.value)} placeholder="github.com/yourname" />
          <Input label="Portfolio" value={profile.portfolio || ''} onChange={e => updateField('portfolio', e.target.value)} placeholder="yourname.dev" />
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Skills</h2>
          <span className="text-[10px] text-light-muted dark:text-dark-muted">({profile.skills?.length || 0} added)</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[36px]">
          <AnimatePresence>
            {(profile.skills || []).map(skill => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20"
              >
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-error transition-colors ml-0.5">
                  <XIcon size={9} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <input
            className="input-base flex-1"
            placeholder="Python, React, AWS... press Enter"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKey}
          />
          <Button variant="secondary" size="md" onClick={addSkill}>Add</Button>
        </div>
      </Card>

      {/* Experience */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-light-muted dark:text-dark-muted" />
            <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Experience</h2>
          </div>
          <button onClick={addExperience} className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-4">
          {(profile.experience || []).map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-light-border dark:border-dark-border space-y-3"
            >
              <div className="flex justify-end">
                <button onClick={() => removeExp(i)} className="text-light-muted dark:text-dark-muted hover:text-error transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Input placeholder="Job Title" value={exp.role || ''} onChange={e => updateExp(i, 'role', e.target.value)} />
                <Input placeholder="Company Name" value={exp.company || ''} onChange={e => updateExp(i, 'company', e.target.value)} />
                <Input placeholder="Duration (e.g. Jan 2022 – Present)" value={exp.duration || ''} onChange={e => updateExp(i, 'duration', e.target.value)} className="col-span-2" />
                <Input textarea rows={2} placeholder="Describe your responsibilities..." value={exp.description || ''} onChange={e => updateExp(i, 'description', e.target.value)} className="col-span-2" />
              </div>
            </motion.div>
          ))}
          {profile.experience?.length === 0 && (
            <p className="text-xs text-light-muted dark:text-dark-muted text-center py-3">No experience added yet.</p>
          )}
        </div>
      </Card>

      {/* Education */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap size={14} className="text-light-muted dark:text-dark-muted" />
            <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Education</h2>
          </div>
          <button onClick={addEducation} className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
            <Plus size={12} /> Add
          </button>
        </div>
        <div className="space-y-3">
          {(profile.education || []).map((edu, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
              <Input placeholder="Degree / Certification" value={edu.degree || ''} onChange={e => updateEdu(i, 'degree', e.target.value)} className="flex-1" />
              <Input placeholder="Institution" value={edu.institution || ''} onChange={e => updateEdu(i, 'institution', e.target.value)} className="flex-1" />
              <Input placeholder="Year" value={edu.year || ''} onChange={e => updateEdu(i, 'year', e.target.value)} className="w-20 flex-shrink-0" />
              <button onClick={() => removeEdu(i)} className="mb-2.5 text-light-muted dark:text-dark-muted hover:text-error transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </motion.div>
          ))}
          {profile.education?.length === 0 && (
            <p className="text-xs text-light-muted dark:text-dark-muted text-center py-2">No education added yet.</p>
          )}
        </div>
      </Card>

      {/* LinkedIn Optimizer */}
      <LinkedInOptimizer profile={profile} activeJob={activeJob} />
    </div>
  )
}

function XIcon({ size = 16 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}
