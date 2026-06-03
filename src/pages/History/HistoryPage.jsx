import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import BottomNav from '../../components/layout/BottomNav'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { Calendar, ChevronRight, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { subjects, sessions, fetchSubjects, fetchSessions } = useAttendanceStore()
  const { students, fetchStudents } = useStudentsStore()

  useEffect(() => {
    fetchSubjects()
    fetchSessions()
    fetchStudents()
  }, [fetchSubjects, fetchSessions, fetchStudents])

  const grouped = subjects.map((subj) => ({
    ...subj,
    sessions: sessions
      .filter((s) => s.subject_id === subj.id && s.completed)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
  }))

  return (
    <div className="min-h-screen bg-surface-bg pb-20">
      <PageHeader title="History" showBack={false} />

      <div className="px-4 mt-2 space-y-6">
        {grouped.length === 0 || grouped.every((g) => g.sessions.length === 0) ? (
          <EmptyState title="No history yet" subtitle="Complete an attendance session to see it here." />
        ) : (
          grouped.map((subj) =>
            subj.sessions.length > 0 ? (
              <div key={subj.id}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold text-dark-60 uppercase tracking-wider">{subj.name}</h2>
                  <button
                    onClick={() => navigate(`/stats/${subj.id}`)}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover hover:bg-surface-muted transition-fast rounded-md p-1"
                  >
                    <BarChart3 size={14} /> Stats
                  </button>
                </div>
                <div className="space-y-2">
                  {subj.sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => navigate(`/history/${session.id}`)}
                      className="w-full flex items-center justify-between p-4 bg-surface-card border border-border rounded-lg hover:bg-surface-muted transition-fast shadow-sm text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-light p-2.5 rounded-md">
                          <Calendar size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-dark">
                            {format(new Date(session.date), 'EEEE, d MMMM yyyy')}
                          </div>
                          <div className="text-xs font-medium text-dark-60 mt-0.5">
                            {session.total_students} students
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-dark-60" />
                    </button>
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </div>

      <BottomNav />
    </div>
  )
}