import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReactToPrint } from 'react-to-print'
import {
  Sparkles, Download, Plus, Trash2, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Loader2, FileText, Briefcase, RefreshCw
} from 'lucide-react'
import { resumeAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import ProgressBar from '../components/common/ProgressBar'
import EmptyState from '../components/common/EmptyState'
import { SkeletonLine } from '../components/common/SkeletonCard'
import { Link } from 'react-router-dom'

// ── Skill categorization utility ───────────────────────────────
const CATEGORY_PATTERNS = {
  'Programming Languages': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'golang', 'rust', 'kotlin', 'swift', 'ruby', 'php', 'scala', 'matlab'],
  'Web Development': ['react', 'angular', 'vue', 'html', 'css', 'sass', 'next.js', 'node', 'express', 'django', 'flask', 'fastapi', 'spring'],
  'Data & Analytics': ['pandas', 'numpy', 'matplotlib', 'scikit-learn', 'tensorflow', 'pytorch', 'spark', 'tableau', 'power bi', 'machine learning', 'deep learning', 'nlp'],
  'Databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra', 'dynamodb', 'firebase'],
  'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'linux'],
  'Tools & Concepts': ['git', 'agile', 'scrum', 'jira', 'figma', 'postman', 'rest', 'graphql', 'microservices', 'oop', 'data structures', 'algorithms', 'problem solving'],
}

function categorizeSkills(skills) {
  if (!skills?.length) return {}
  const categorized = {}
  const assigned = new Set()
  for (const [cat, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    const matches = skills.filter(s => patterns.some(p => s.toLowerCase().includes(p)))
    if (matches.length) {
      categorized[cat] = matches
      matches.forEach(s => assigned.add(s))
    }
  }
  const rest = skills.filter(s => !assigned.has(s))
  if (rest.length) categorized['Other Skills'] = rest
  return categorized
}

// ── Section header for print document (pt units) ──────────────
function SectionHeaderPrint({ title }) {
  return (
    <div style={{ marginTop: '14px', marginBottom: '6px' }}>
      <h2 style={{ fontSize: '9pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0B1F1A', margin: '0 0 5px' }}>
        {title}
      </h2>
      <div style={{ height: '1px', background: '#00D5B9' }} />
    </div>
  )
}

// ── Resume print document ──────────────────────────────────────
function ResumeDocument({ resume }) {
  const flatSkills = resume.skills_ordered?.length ? resume.skills_ordered : (resume.skills || [])
  const skillsDisplay = (resume.skills_categorized && Object.keys(resume.skills_categorized).length > 0)
    ? resume.skills_categorized
    : categorizeSkills(flatSkills)

  return (
    <div
      className="resume-print"
      style={{
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        background: 'white',
        color: '#0B1F1A',
        padding: '16mm 18mm 14mm',
        width: '210mm',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 700, color: '#0B1F1A', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {resume.name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '9pt', color: '#5C7C75', margin: '5px 0 0', lineHeight: 1.4 }}>
          {[resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean).join('  ·  ')}
        </p>
        <div style={{ height: '1px', background: '#00D5B9', marginTop: '8px' }} />
      </div>

      {/* 1. Summary */}
      {resume.summary && (
        <div style={{ marginBottom: '2px' }}>
          <SectionHeaderPrint title="Summary" />
          <p style={{ fontSize: '10pt', lineHeight: 1.65, margin: '6px 0 0', color: '#374151' }}>{resume.summary}</p>
        </div>
      )}

      {/* 2. Experience */}
      {resume.experience?.length > 0 && (
        <div style={{ marginBottom: '2px' }}>
          <SectionHeaderPrint title="Experience" />
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '12px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '11.5pt', color: '#0B1F1A' }}>{exp.role}</strong>
                <span style={{ fontSize: '9pt', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '9.5pt', color: '#5C7C75', fontWeight: 500, margin: '2px 0 4px' }}>{exp.company}</div>
              {(exp.bullets || (exp.description ? [exp.description] : [])).map((b, bi) => (
                <p key={bi} style={{ fontSize: '10pt', lineHeight: 1.6, margin: '3px 0 0 6px', color: '#374151' }}>• {b}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 3. Projects */}
      {resume.projects?.length > 0 && (
        <div style={{ marginBottom: '2px' }}>
          <SectionHeaderPrint title="Projects" />
          {resume.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '11.5pt', color: '#0B1F1A' }}>{proj.title}</strong>
                {proj.link && <span style={{ fontSize: '8.5pt', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{proj.link}</span>}
              </div>
              {proj.tech?.length > 0 && (
                <div style={{ fontSize: '9pt', color: '#5C7C75', fontWeight: 500, margin: '2px 0 4px' }}>{proj.tech.join(' · ')}</div>
              )}
              {(proj.bullets?.length > 0 ? proj.bullets : proj.description ? [proj.description] : []).map((b, bi) => (
                <p key={bi} style={{ fontSize: '10pt', lineHeight: 1.6, margin: '3px 0 0 6px', color: '#374151' }}>• {b}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 4. Skills */}
      {Object.keys(skillsDisplay).length > 0 && (
        <div style={{ marginBottom: '2px' }}>
          <SectionHeaderPrint title="Skills" />
          <div style={{ marginTop: '6px' }}>
            {Object.entries(skillsDisplay).map(([category, skillList]) => (
              <div key={category} style={{ marginBottom: '5px', display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '9.5pt', fontWeight: 700, color: '#0B1F1A', flexShrink: 0 }}>{category}:</span>
                <span style={{ fontSize: '9.5pt', color: '#5C7C75', lineHeight: 1.5 }}>{skillList.join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Education */}
      {resume.education?.length > 0 && (
        <div style={{ marginBottom: '2px' }}>
          <SectionHeaderPrint title="Education" />
          {resume.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', marginBottom: '4px' }}>
              <div>
                <strong style={{ fontSize: '11pt', color: '#0B1F1A' }}>{edu.degree}</strong>
                {edu.institution && <span style={{ fontSize: '9.5pt', color: '#5C7C75' }}> — {edu.institution}</span>}
              </div>
              <span style={{ fontSize: '9pt', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {/* 6. Certifications */}
      {resume.certifications?.length > 0 && (
        <div>
          <SectionHeaderPrint title="Certifications" />
          {resume.certifications.map((cert, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', marginBottom: '3px' }}>
              <div>
                <strong style={{ fontSize: '10pt', color: '#0B1F1A' }}>{cert.name}</strong>
                {cert.issuer && <span style={{ fontSize: '9pt', color: '#5C7C75' }}> — {cert.issuer}</span>}
              </div>
              <span style={{ fontSize: '9pt', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{cert.year}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Live preview ───────────────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <div style={{ marginTop: '14px', marginBottom: '6px' }}>
      <h2 style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0B1F1A', margin: '0 0 5px' }}>
        {title}
      </h2>
      <div style={{ height: '1px', background: '#00D5B9', marginBottom: '7px' }} />
    </div>
  )
}

function ResumePreview({ resume }) {
  const flatSkills = resume.skills_ordered?.length ? resume.skills_ordered : (resume.skills || [])
  const skillsDisplay = (resume.skills_categorized && Object.keys(resume.skills_categorized).length > 0)
    ? resume.skills_categorized
    : categorizeSkills(flatSkills)
  const isEmpty = !resume.name && !resume.summary && !resume.experience?.length

  return (
    <div
      className="bg-white text-black rounded-xl shadow-inner border border-light-border overflow-hidden"
      style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", minHeight: '500px', lineHeight: 1.55 }}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-80">
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>Fill in the form to see your resume preview</p>
        </div>
      ) : (
        <>
          {/* Header — clean white, minimal */}
          <div style={{ padding: '20px 20px 0' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0B1F1A', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {resume.name || 'Your Name'}
            </h1>
            <p style={{ fontSize: '9px', color: '#5C7C75', margin: '4px 0 0', lineHeight: 1.4 }}>
              {[resume.email, resume.phone, resume.location, resume.linkedin, resume.github].filter(Boolean).join('  ·  ')}
            </p>
            <div style={{ height: '1px', background: '#00D5B9', margin: '8px 0' }} />
          </div>

          {/* Body */}
          <div style={{ padding: '0 20px 16px' }}>
            {/* 1. Summary */}
            {resume.summary && (
              <div>
                <SectionHeader title="Summary" />
                <p style={{ fontSize: '10px', color: '#374151', lineHeight: 1.65 }}>{resume.summary}</p>
              </div>
            )}

            {/* 2. Experience */}
            {resume.experience?.length > 0 && (
              <div>
                <SectionHeader title="Experience" />
                {resume.experience.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '10px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: '#0B1F1A' }}>{exp.role}</span>
                      <span style={{ fontSize: '9px', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{exp.duration}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#5C7C75', fontWeight: 500 }}>{exp.company}</span>
                    {(exp.bullets || (exp.description ? [exp.description] : [])).map((b, bi) => (
                      <p key={bi} style={{ fontSize: '10px', color: '#374151', marginTop: '3px', paddingLeft: '4px', lineHeight: 1.6 }}>• {b}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* 3. Projects */}
            {resume.projects?.length > 0 && (
              <div>
                <SectionHeader title="Projects" />
                {resume.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: '10px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: '#0B1F1A' }}>{proj.title}</span>
                      {proj.link && <span style={{ fontSize: '8px', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{proj.link}</span>}
                    </div>
                    {proj.tech?.length > 0 && (
                      <span style={{ fontSize: '9px', color: '#5C7C75', fontWeight: 500 }}>{proj.tech.join(' · ')}</span>
                    )}
                    {(proj.bullets?.length > 0 ? proj.bullets : proj.description ? [proj.description] : []).map((b, bi) => (
                      <p key={bi} style={{ fontSize: '10px', color: '#374151', marginTop: '3px', paddingLeft: '4px', lineHeight: 1.6 }}>• {b}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* 4. Skills */}
            {Object.keys(skillsDisplay).length > 0 && (
              <div>
                <SectionHeader title="Skills" />
                {Object.entries(skillsDisplay).map(([category, skillList]) => (
                  <div key={category} style={{ marginBottom: '5px', display: 'flex', gap: '5px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#0B1F1A', flexShrink: 0 }}>{category}:</span>
                    <span style={{ fontSize: '9px', color: '#5C7C75', lineHeight: 1.5 }}>{skillList.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Education */}
            {resume.education?.length > 0 && (
              <div>
                <SectionHeader title="Education" />
                {resume.education.map((edu, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#0B1F1A' }}>
                      <strong>{edu.degree}</strong>
                      {edu.institution && <span style={{ color: '#5C7C75', fontWeight: 400 }}> — {edu.institution}</span>}
                    </span>
                    <span style={{ fontSize: '9px', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{edu.year}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 6. Certifications */}
            {resume.certifications?.length > 0 && (
              <div>
                <SectionHeader title="Certifications" />
                {resume.certifications.map((cert, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '10px', color: '#0B1F1A' }}>
                      <strong>{cert.name}</strong>
                      {cert.issuer && <span style={{ color: '#5C7C75', fontWeight: 400 }}> — {cert.issuer}</span>}
                    </span>
                    <span style={{ fontSize: '9px', color: '#5C7C75', flexShrink: 0, marginLeft: '8px' }}>{cert.year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── AI Resume Builder + Keyword Heatmap ─────────────────────────
function KeywordHeatmap({ ats, activeJob, onGenerate, generating, tailored }) {
  const hasData = ats && ats.score > 0
  const matched = ats?.matched || []
  const missing = ats?.missing || []
  const weakSections = []
  if (hasData && !tailored) {
    if (ats.score < 50) weakSections.push('Summary')
    if (missing.length > 5) weakSections.push('Skills section')
    if (missing.length > 8) weakSections.push('Experience bullets')
    if (!ats.matched?.some(k => ['python', 'javascript', 'react', 'java'].includes(k?.toLowerCase()))) {
      weakSections.push('Technical keywords')
    }
  }

  return (
    <Card padding={false} className="overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border flex items-center gap-2">
        <Sparkles size={13} className={tailored ? 'text-success flex-shrink-0' : 'text-brand flex-shrink-0'} />
        <div>
          <p className="text-xs font-semibold text-light-text dark:text-dark-text">AI Resume Builder</p>
          <p className="text-[10px] text-light-muted dark:text-dark-muted mt-0.5">
            {tailored
              ? 'Resume tailored · ready to apply'
              : hasData
              ? 'Keyword heatmap · resume vs job analysis'
              : 'Generate ATS-optimized resume for your target role'}
          </p>
        </div>
        {tailored ? (
          <span className="ml-auto text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-lg flex-shrink-0 flex items-center gap-1">
            <CheckCircle2 size={10} /> Tailored
          </span>
        ) : hasData ? (
          <span className="ml-auto text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-lg flex-shrink-0">
            Target: 100%
          </span>
        ) : null}
      </div>

      {/* Keyword heatmap */}
      {hasData && (
        <div className="p-5 space-y-4 border-b border-light-border dark:border-dark-border">
          {/* Matched keywords — always shown */}
          {matched.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-success uppercase tracking-wide mb-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" /> Matched ({matched.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matched.slice(0, 12).map(k => (
                  <span key={k} className="skill-tag-match">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tailored success banner replaces missing/weak sections */}
          {tailored ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-success/8 border border-success/20">
              <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-success">Resume is job-ready</p>
                <p className="text-[10px] text-success/80 mt-0.5 leading-relaxed">
                  Gemini has incorporated all missing keywords. Your resume is optimised for this role's ATS screening.
                </p>
              </div>
            </div>
          ) : (
            <>
              {missing.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-error uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-error" /> Missing ({missing.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missing.slice(0, 12).map(k => (
                      <span key={k} className="skill-tag-missing">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {weakSections.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-warning uppercase tracking-wide mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-warning" /> Weak Sections
                  </p>
                  <div className="space-y-1.5">
                    {weakSections.map(s => (
                      <div key={s} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                        <span className="text-xs text-light-text dark:text-dark-text">{s}</span>
                        <span className="text-[10px] text-warning ml-auto">Needs keywords</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Generate / Regenerate CTA */}
      <div className="p-5">
        {activeJob ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tailored ? 'bg-success' : 'bg-brand'}`} />
              <p className="text-[11px] text-light-muted dark:text-dark-muted">
                Targeting: <span className={`font-semibold ${tailored ? 'text-success' : 'text-brand'}`}>{activeJob.title}</span>
                {!tailored && missing.length > 0 && <span> · {missing.length} keywords to add</span>}
                {tailored && <span className="text-success"> · Ready to apply</span>}
              </p>
            </div>
            {tailored ? (
              <button
                onClick={onGenerate}
                disabled={generating}
                className="w-full py-2.5 rounded-2xl border border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted text-xs font-semibold hover:border-brand/40 hover:text-brand transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {generating
                  ? <><Loader2 size={13} className="animate-spin" /> Regenerating...</>
                  : <><RefreshCw size={13} /> Regenerate Resume</>
                }
              </button>
            ) : (
              <button
                onClick={onGenerate}
                disabled={generating}
                className="w-full py-2.5 rounded-2xl bg-brand text-white text-xs font-semibold hover:bg-brand-hover transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {generating
                  ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                  : <><Sparkles size={13} /> Generate Best Resume</>
                }
              </button>
            )}
            {hasData && !tailored && (
              <p className="text-[10px] text-light-muted dark:text-dark-muted text-center">
                Re-generate to incorporate missing keywords and boost ATS score
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] text-light-muted dark:text-dark-muted leading-relaxed">
              Set an active job role to let AI generate a resume targeting 100% ATS score using keyword heatmap analysis.
            </p>
            <Link
              to="/jobs"
              className="w-full py-2.5 rounded-2xl border border-brand/30 text-brand text-xs font-semibold hover:bg-brand/8 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Briefcase size={13} /> Select Active Job →
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── ATS Score panel ─────────────────────────────────────────────
function ATSPanel({ ats, tailored }) {
  const [expanded, setExpanded] = useState(false)
  if (!ats || ats.score === 0) return null
  const color = tailored || ats.score >= 70 ? 'success' : ats.score >= 40 ? 'brand' : 'warning'

  return (
    <Card padding={false}>
      <div
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold
            ${tailored || ats.score >= 70 ? 'bg-success/10 text-success' : ats.score >= 40 ? 'bg-brand/10 text-brand' : 'bg-warning/10 text-warning'}`}>
            {ats.score}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-light-text dark:text-dark-text">ATS Score</p>
              {tailored && (
                <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-md">Tailored ✓</span>
              )}
            </div>
            <p className="text-[10px] text-light-muted dark:text-dark-muted">{ats.matched?.length || 0} keywords matched</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-light-muted" /> : <ChevronDown size={14} className="text-light-muted" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-light-border dark:border-dark-border"
          >
            <div className="p-5 space-y-4">
              <ProgressBar value={ats.score} color={color} height="md" showValue />

              {ats.matched?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-2">Matched</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats.matched.slice(0, 15).map(k => <Badge key={k} variant="success" size="xs">{k}</Badge>)}
                  </div>
                </div>
              )}

              {/* Only show missing keywords section when resume hasn't been tailored */}
              {!tailored && ats.missing?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-2">Missing keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ats.missing.slice(0, 15).map(k => <Badge key={k} variant="warning" size="xs">{k}</Badge>)}
                  </div>
                </div>
              )}

              {/* Show tailored confirmation instead of suggestions after generation */}
              {tailored ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-success/8 border border-success/20">
                  <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                  <p className="text-[10px] text-success">Resume optimised by AI — all critical keywords incorporated</p>
                </div>
              ) : ats.suggestions?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wide mb-2">Suggestions</p>
                  <ul className="space-y-1.5">
                    {ats.suggestions.map((s, i) => (
                      <li key={i} className="text-xs text-light-muted dark:text-dark-muted flex gap-2">
                        <span className="text-warning mt-0.5 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ── Main component ──────────────────────────────────────────────
export default function Resume() {
  const { activeJob, fetchActiveJob, setAtsScore } = useApp()
  const printRef = useRef(null)
  const prevActiveJobRef = useRef(undefined)
  const [tailored, setTailored] = useState(false)
  const [resume, setResume] = useState({
    name: '', email: '', phone: '', location: '', linkedin: '', github: '',
    summary: '', skills: [], skills_ordered: [], skills_categorized: {},
    experience: [], projects: [], education: [], certifications: [], improvements: [],
  })
  const [ats, setAts] = useState({ score: 0, matched: [], missing: [], suggestions: [] })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await resumeAPI.get()
        if (res.data.resume && Object.keys(res.data.resume).length) {
          setResume(prev => ({ ...prev, ...res.data.resume }))
        }
        if (res.data.ats) setAts(res.data.ats)
        if (res.data.tailored) setTailored(true)
        if (!activeJob) await fetchActiveJob()
      } finally {
        setLoading(false)
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (prevActiveJobRef.current === undefined) {
      prevActiveJobRef.current = activeJob
      if (activeJob && !loading) {
        ;(async () => {
          try {
            const res = await resumeAPI.atsScore()
            setAts(res.data)
          } catch {}
        })()
      }
      return
    }

    const prev = prevActiveJobRef.current
    prevActiveJobRef.current = activeJob

    // Reset tailored only when switching from a real job to something else,
    // or clearing the job. Skip null→job (initial context load).
    if (prev !== null || activeJob === null) {
      setTailored(false)
    }

    if (!activeJob || loading) return
    ;(async () => {
      try {
        const res = await resumeAPI.atsScore()
        setAts(res.data)
      } catch {}
    })()
  }, [activeJob]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError('')
    try {
      const res = await resumeAPI.generate()
      const generated = res.data.resume
      setResume(prev => ({ ...prev, ...generated }))
      if (res.data.ats) {
        setAts(res.data.ats)
        setAtsScore(res.data.ats.score)
      }
      setTailored(true)
      // preserve_tailored=true so save doesn't flip the DB flag back to false
      await resumeAPI.save(generated, true)
    } catch (err) {
      setGenerateError(err.response?.data?.error || 'Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await resumeAPI.save(resume, tailored)
      if (res.data.ats) setAts(res.data.ats)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print { body { margin: 0; padding: 0; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `,
  })

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const res = await resumeAPI.upload(file)
      setUploadedFile(res.data.filename)
      const ext = res.data.extracted
      if (ext && Object.keys(ext).length > 0) {
        setResume(prev => ({ ...prev, ...ext }))
      }
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const updateField = (field, value) => setResume(prev => ({ ...prev, [field]: value }))

  const addExperience = () => setResume(prev => ({
    ...prev,
    experience: [...prev.experience, { company: '', role: '', duration: '', description: '', bullets: [] }]
  }))

  const updateExp = (i, field, value) => setResume(prev => {
    const exp = [...prev.experience]
    exp[i] = { ...exp[i], [field]: value }
    return { ...prev, experience: exp }
  })

  const removeExp = (i) => setResume(prev => ({
    ...prev, experience: prev.experience.filter((_, idx) => idx !== i)
  }))

  const addEducation = () => setResume(prev => ({
    ...prev, education: [...prev.education, { degree: '', institution: '', year: '' }]
  }))

  const updateEdu = (i, field, value) => setResume(prev => {
    const edu = [...prev.education]
    edu[i] = { ...edu[i], [field]: value }
    return { ...prev, education: edu }
  })

  const removeEdu = (i) => setResume(prev => ({
    ...prev, education: prev.education.filter((_, idx) => idx !== i)
  }))

  const addProject = () => setResume(prev => ({
    ...prev, projects: [...(prev.projects || []), { title: '', description: '', tech: [], link: '', bullets: [] }]
  }))

  const updateProject = (i, field, value) => setResume(prev => {
    const projects = [...(prev.projects || [])]
    projects[i] = { ...projects[i], [field]: value }
    return { ...prev, projects }
  })

  const removeProject = (i) => setResume(prev => ({
    ...prev, projects: (prev.projects || []).filter((_, idx) => idx !== i)
  }))

  const handleProjectTechInput = (i, e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = e.target.value.trim().replace(',', '')
      if (val) {
        const current = resume.projects[i]?.tech || []
        if (!current.includes(val)) updateProject(i, 'tech', [...current, val])
      }
      e.target.value = ''
    }
  }

  const addCert = () => setResume(prev => ({
    ...prev, certifications: [...(prev.certifications || []), { name: '', issuer: '', year: '' }]
  }))

  const updateCert = (i, field, value) => setResume(prev => {
    const certifications = [...(prev.certifications || [])]
    certifications[i] = { ...certifications[i], [field]: value }
    return { ...prev, certifications }
  })

  const removeCert = (i) => setResume(prev => ({
    ...prev, certifications: (prev.certifications || []).filter((_, idx) => idx !== i)
  }))

  const handleSkillsInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = e.target.value.trim().replace(',', '')
      if (val) {
        setResume(prev => {
          const orderedIsActive = prev.skills_ordered?.length > 0
          const displayList = orderedIsActive ? prev.skills_ordered : prev.skills
          if (displayList.includes(val)) return prev
          return {
            ...prev,
            skills: [...prev.skills, val],
            skills_ordered: orderedIsActive ? [...prev.skills_ordered, val] : prev.skills_ordered,
          }
        })
      }
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLine width="1/3" height="h-7" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">{[...Array(4)].map((_, i) => <SkeletonLine key={i} height="h-10" />)}</div>
          <div className="bg-light-card dark:bg-dark-card rounded-2xl h-96 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-light-text dark:text-dark-text tracking-tight">Resume</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Build, generate, and export your tailored resume</p>
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
          <Button variant="secondary" size="sm" onClick={handleSave} loading={saving}>Save</Button>
          <Button variant="secondary" size="sm" onClick={handlePrint} icon={<Download size={13} />}>Export PDF</Button>
        </div>
      </div>

      {/* Active job + generate */}
      {activeJob ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/8 border border-brand/25 flex-wrap"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
              <span className="text-xs text-light-text dark:text-dark-text truncate">
                Tailoring to: <span className="font-medium">{activeJob.title}</span> at {activeJob.company}
              </span>
            </div>
            <Button
              onClick={handleGenerate}
              loading={generating}
              size="sm"
              icon={generating ? undefined : <Sparkles size={12} />}
              className="flex-shrink-0"
            >
              {generating ? 'Generating...' : 'Generate with AI'}
            </Button>
          </motion.div>
          {generateError && (
            <p className="text-xs text-error flex items-center gap-1.5 px-1">
              <AlertCircle size={12} className="flex-shrink-0" />
              {generateError}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-light-bg dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <AlertCircle size={14} className="text-warning flex-shrink-0" />
          <p className="text-xs text-light-muted dark:text-dark-muted">
            Select an active job on the{' '}
            <Link to="/jobs" className="text-brand hover:text-brand-hover font-medium">Jobs page</Link>
            {' '}to enable AI resume generation tailored to that role.
          </p>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="space-y-5">
          {/* Resume Upload */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">
                Upload Existing Resume
              </h2>
              {uploadedFile && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 size={10} className="mr-1" />
                  Extracted & filled
                </Badge>
              )}
            </div>
            <p className="text-xs text-light-muted dark:text-dark-muted mb-3">
              Upload a PDF, DOC, or DOCX file (max 16 MB). Stored for reference alongside your built resume.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-file-input"
            />
            <div className="flex items-center gap-3">
              <label
                htmlFor="resume-file-input"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-150 cursor-pointer
                  ${uploading
                    ? 'opacity-60 cursor-not-allowed border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted'
                    : 'border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-brand/40 hover:text-brand bg-light-surface dark:bg-dark-surface'
                  }`}
              >
                {uploading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <FileText size={12} />
                )}
                {uploading ? 'Uploading...' : 'Choose file'}
              </label>
              {uploadError && (
                <p className="text-xs text-error flex items-center gap-1">
                  <AlertCircle size={11} /> {uploadError}
                </p>
              )}
            </div>
          </Card>

          {/* Personal info */}
          <Card>
            <h2 className="section-header mb-4">Personal Info</h2>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Full Name" placeholder="Jane Smith" value={resume.name} onChange={e => updateField('name', e.target.value)} />
              <Input label="Email" type="email" placeholder="jane@example.com" value={resume.email} onChange={e => updateField('email', e.target.value)} />
              <Input label="Phone" placeholder="+1 234 567 8900" value={resume.phone || ''} onChange={e => updateField('phone', e.target.value)} />
              <Input label="Location" placeholder="San Francisco, CA" value={resume.location || ''} onChange={e => updateField('location', e.target.value)} />
              <Input label="LinkedIn" placeholder="linkedin.com/in/..." value={resume.linkedin || ''} onChange={e => updateField('linkedin', e.target.value)} />
              <Input label="GitHub" placeholder="github.com/..." value={resume.github || ''} onChange={e => updateField('github', e.target.value)} />
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide mb-4">Professional Summary</h2>
            <Input
              textarea
              rows={3}
              placeholder="A brief summary tailored to your target role..."
              value={resume.summary || ''}
              onChange={e => updateField('summary', e.target.value)}
            />
            {resume.improvements?.length > 0 && (
              tailored ? (
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle2 size={11} className="text-success flex-shrink-0" />
                  <p className="text-[10px] text-success">Summary optimised by AI for this role</p>
                </div>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {resume.improvements.map((imp, i) => (
                    <p key={i} className="text-[10px] text-warning flex gap-2">
                      <span className="flex-shrink-0">•</span>{imp}
                    </p>
                  ))}
                </div>
              )
            )}
          </Card>

          {/* Experience */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Experience</h2>
              <button onClick={addExperience} className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {resume.experience.map((exp, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-light-border dark:border-dark-border space-y-2.5">
                  <div className="flex justify-end">
                    <button onClick={() => removeExp(i)} className="text-light-muted dark:text-dark-muted hover:text-error transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Job Title" value={exp.role || ''} onChange={e => updateExp(i, 'role', e.target.value)} />
                    <Input placeholder="Company" value={exp.company || ''} onChange={e => updateExp(i, 'company', e.target.value)} />
                    <Input placeholder="Duration (e.g. Jan 2022 - Present)" value={exp.duration || ''} onChange={e => updateExp(i, 'duration', e.target.value)} className="col-span-2" />
                  </div>
                  <Input
                    textarea rows={2}
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description || (exp.bullets || []).join('\n') || ''}
                    onChange={e => updateExp(i, 'description', e.target.value)}
                  />
                </div>
              ))}
              {resume.experience.length === 0 && (
                <p className="text-xs text-light-muted dark:text-dark-muted text-center py-3">
                  No experience added yet. Click Add or Generate with AI.
                </p>
              )}
            </div>
          </Card>

          {/* Projects */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Projects</h2>
              <button onClick={addProject} className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {(resume.projects || []).map((proj, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-light-border dark:border-dark-border space-y-2.5">
                  <div className="flex justify-end">
                    <button onClick={() => removeProject(i)} className="text-light-muted dark:text-dark-muted hover:text-error transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <Input placeholder="Project Title" value={proj.title || ''} onChange={e => updateProject(i, 'title', e.target.value)} />
                  <Input placeholder="GitHub / Live Link (optional)" value={proj.link || ''} onChange={e => updateProject(i, 'link', e.target.value)} />
                  <div className="flex flex-wrap gap-1 min-h-[24px]">
                    {(proj.tech || []).map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-brand/10 text-brand border border-brand/20">
                        {t}
                        <button onClick={() => updateProject(i, 'tech', (proj.tech || []).filter(s => s !== t))} className="hover:text-error transition-colors">
                          <X size={9} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    className="input-base"
                    placeholder="Technologies used (Enter to add)..."
                    onKeyDown={e => handleProjectTechInput(i, e)}
                  />
                  <Input
                    textarea rows={2}
                    placeholder="Describe what you built and the impact..."
                    value={proj.description || ''}
                    onChange={e => updateProject(i, 'description', e.target.value)}
                  />
                </div>
              ))}
              {!(resume.projects?.length) && (
                <p className="text-xs text-light-muted dark:text-dark-muted text-center py-3">
                  No projects added yet. Click Add or Generate with AI.
                </p>
              )}
            </div>
          </Card>

          {/* Education */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Education</h2>
              <button onClick={addEducation} className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {resume.education.map((edu, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <Input placeholder="Degree / Certificate" value={edu.degree || ''} onChange={e => updateEdu(i, 'degree', e.target.value)} className="flex-1" />
                  <Input placeholder="Institution" value={edu.institution || ''} onChange={e => updateEdu(i, 'institution', e.target.value)} className="flex-1" />
                  <Input placeholder="Year" value={edu.year || ''} onChange={e => updateEdu(i, 'year', e.target.value)} className="w-20" />
                  <button onClick={() => removeEdu(i)} className="mb-2.5 text-light-muted dark:text-dark-muted hover:text-error transition-colors flex-shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {resume.education.length === 0 && (
                <p className="text-xs text-light-muted dark:text-dark-muted text-center py-2">No education added yet.</p>
              )}
            </div>
          </Card>

          {/* Certifications */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide">Certifications</h2>
              <button onClick={addCert} className="text-xs text-brand hover:text-brand-hover flex items-center gap-1 transition-colors">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {(resume.certifications || []).map((cert, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <Input placeholder="Certification Name" value={cert.name || ''} onChange={e => updateCert(i, 'name', e.target.value)} className="flex-1" />
                  <Input placeholder="Issuer" value={cert.issuer || ''} onChange={e => updateCert(i, 'issuer', e.target.value)} className="flex-1" />
                  <Input placeholder="Year" value={cert.year || ''} onChange={e => updateCert(i, 'year', e.target.value)} className="w-20" />
                  <button onClick={() => removeCert(i)} className="mb-2.5 text-light-muted dark:text-dark-muted hover:text-error transition-colors flex-shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {!(resume.certifications?.length) && (
                <p className="text-xs text-light-muted dark:text-dark-muted text-center py-2">No certifications added yet.</p>
              )}
            </div>
          </Card>

          {/* Skills */}
          <Card>
            <h2 className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wide mb-4">Skills</h2>
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
              {(resume.skills_ordered?.length ? resume.skills_ordered : resume.skills || []).map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-brand/10 text-brand border border-brand/20"
                >
                  {skill}
                  <button
                    onClick={() => setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill), skills_ordered: prev.skills_ordered?.filter(s => s !== skill) || [] }))}
                    className="hover:text-error transition-colors"
                  >
                    <X size={9} />
                  </button>
                </span>
              ))}
            </div>
            <input
              className="input-base"
              placeholder="Type a skill and press Enter..."
              onKeyDown={handleSkillsInput}
            />
            <p className="text-[10px] text-light-muted dark:text-dark-muted mt-1.5">Press Enter to add each skill</p>
          </Card>
        </div>

        {/* ── Preview ── */}
        <div className="space-y-4 sticky top-6 self-start">
          <Card padding={false} className="overflow-hidden">
            <div className="px-5 py-3.5 border-b border-light-border dark:border-dark-border">
              <p className="text-xs font-semibold text-light-text dark:text-dark-text">Live Preview</p>
            </div>
            <div className="p-5">
              <ResumePreview resume={resume} />
            </div>
          </Card>

          {/* ATS score */}
          <ATSPanel ats={ats} tailored={tailored} />

          {/* AI Resume Builder + Keyword Heatmap */}
          <KeywordHeatmap
            ats={ats}
            activeJob={activeJob}
            tailored={tailored}
            onGenerate={handleGenerate}
            generating={generating}
          />
        </div>
      </div>

      {/* Hidden print version */}
      <div className="hidden">
        <div ref={printRef} style={{ margin: 0, padding: 0 }}>
          <ResumeDocument resume={resume} />
        </div>
      </div>
    </div>
  )
}

// X icon for skill tags
function X({ size = 16, ...props }) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  )
}
