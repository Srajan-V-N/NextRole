import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PageWrapper from '../common/PageWrapper'

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64 h-full flex flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col px-4 pt-5 pb-0 lg:px-8 lg:pt-7 lg:pb-0 max-w-9xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <PageWrapper key={location.pathname} className="flex-1 flex flex-col min-h-0">
              <Outlet />
            </PageWrapper>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
