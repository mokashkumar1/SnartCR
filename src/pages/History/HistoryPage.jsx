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
    <div className="min-h-screen bg-white dark:bg-[#0B1120] pb-20">
      <PageHeader title="History" showBack={false} />

      <div className="px-4 mt-2 space-y-6">
        {grouped.length === 0 || grouped.every((g) => g.sessions.length === 0) ? (
          <EmptyState title="No history yet" subtitle="Complete an attendance session to see it here." />
        ) : (
          grouped.map((subj) =>
            subj.sessions.length > 0 ? (
              <div key={subj.id}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">{subj.name}</h2>
                  <button
                    onClick={() => navigate(`/stats/${subj.id}`)}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <BarChart3 size={14} /> Stats
                  </button>
                </div>
                <div className="space-y-2">
                  {subj.sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => navigate(`/history/${session.id}`)}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-[#131B2F] border border-slate-200 dark:border-[#1E293B] rounded-xl active:bg-navy-700 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <Calendar size={18} className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {format(new Date(session.date), 'EEEE, d MMMM yyyy')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {session.total_students} students
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-500" />
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