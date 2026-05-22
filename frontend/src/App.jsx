import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Resume from './pages/Resume'
import Readiness from './pages/Readiness'
import Profile from './pages/Profile'
import Courses from './pages/Courses'
import Tracker from './pages/Tracker'
import AppShell from './components/layout/AppShell'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="resume" element={<Resume />} />
          <Route path="readiness" element={<Readiness />} />
          <Route path="courses" element={<Courses />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppProvider>
          <AnimatedRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
