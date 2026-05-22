import { createContext, useContext, useState, useCallback } from 'react'
import { jobsAPI, dashboardAPI } from '../services/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [activeJob, setActiveJobState] = useState(null)
  const [placementScore, setPlacementScore] = useState(0)
  const [atsScore, setAtsScore] = useState(0)
  const [readinessScore, setReadinessScore] = useState(0)
  const [profileCompleteness, setProfileCompleteness] = useState(0)
  const [dashboardLoaded, setDashboardLoaded] = useState(false)

  const setActiveJob = useCallback(async (job) => {
    try {
      await jobsAPI.setActive(job)
      setActiveJobState(job)
    } catch (err) {
      console.error('Failed to set active job', err)
    }
  }, [])

  const clearActiveJob = useCallback(async () => {
    try {
      await jobsAPI.clearActive()
      setActiveJobState(null)
    } catch (err) {
      console.error('Failed to clear active job', err)
    }
  }, [])

  const fetchActiveJob = useCallback(async () => {
    try {
      const res = await jobsAPI.getActive()
      if (res.data.job) setActiveJobState(res.data.job)
    } catch (err) {
      console.error('Failed to fetch active job', err)
    }
  }, [])

  const refreshDashboard = useCallback(async () => {
    try {
      const res = await dashboardAPI.get()
      const d = res.data
      setPlacementScore(d.placement_score || 0)
      setAtsScore(d.ats_score || 0)
      setReadinessScore(d.readiness_score || 0)
      setProfileCompleteness(d.profile_completeness || 0)
      if (d.active_job) setActiveJobState(d.active_job)
      setDashboardLoaded(true)
      return d
    } catch {
      setDashboardLoaded(true)
      return null
    }
  }, [])

  return (
    <AppContext.Provider value={{
      activeJob,
      setActiveJob,
      clearActiveJob,
      fetchActiveJob,
      placementScore,
      atsScore,
      readinessScore,
      profileCompleteness,
      setAtsScore,
      setReadinessScore,
      setProfileCompleteness,
      refreshDashboard,
      dashboardLoaded,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
