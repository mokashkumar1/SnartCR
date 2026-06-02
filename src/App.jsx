import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

import LoginPage from './pages/Auth/LoginPage'
import SetupPage from './pages/Auth/SetupPage'
import SubjectSelectPage from './pages/Attendance/SubjectSelectPage'
import TakingPage from './pages/Attendance/TakingPage'
import QuickMarkPage from './pages/Attendance/QuickMarkPage'
import SummaryPage from './pages/Attendance/SummaryPage'
import StudentsPage from './pages/Students/StudentsPage'
import HistoryPage from './pages/History/HistoryPage'
import SessionDetailPage from './pages/History/SessionDetailPage'
import SubjectStatsPage from './pages/History/SubjectStatsPage'
import SettingsPage from './pages/Settings/SettingsPage'

function App() {
  const { session, profile, initialized, initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    )
  }

  // Not logged in
  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Logged in but no profile yet
  if (!profile) {
    return (
      <Routes>
        <Route path="/setup" element={<SetupPage />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    )
  }

  // Fully authenticated
  return (
    <div className="min-h-screen bg-navy-900 pb-20">
      <Routes>
        <Route path="/" element={<SubjectSelectPage />} />
        <Route path="/take/:subjectId" element={<TakingPage />} />
        <Route path="/quick/:subjectId" element={<QuickMarkPage />} />
        <Route path="/summary/:sessionId" element={<SummaryPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:sessionId" element={<SessionDetailPage />} />
        <Route path="/stats/:subjectId" element={<SubjectStatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App