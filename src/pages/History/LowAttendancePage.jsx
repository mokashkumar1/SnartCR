import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import PageHeader from '../../components/layout/PageHeader'
import BottomNav from '../../components/layout/BottomNav'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { getSubjectStatsForAllStudents, formatAttendancePercent } from '../../lib/calculations'
import { AlertTriangle, BookOpen, ChevronRight } from 'lucide-react'

export default function LowAttendancePage() {
  const navigate = useNavigate()
  const { subjects, sessions, records, fetchSubjects, fetchSessions, fetchRecords } = useAttendanceStore()
  const { students, fetchStudents } = useStudentsStore()

  useEffect(() => {
    fetchSubjects()
    fetchSessions()
    fetchRecords()
    fetchStudents()
  }, [fetchSubjects, fetchSessions, fetchRecords, fetchStudents])

  const lowAttendanceList = []
  
  subjects.forEach(subj => {
    const stats = getSubjectStatsForAllStudents(students, sessions, records, subj.id)
    const belowThreshold = stats.filter(s => s.isBelowThreshold)
    if (belowThreshold.length > 0) {
      lowAttendanceList.push({
        subject: subj,
        students: belowThreshold
      })
    }
  })

  return (
    <div className="min-h-screen bg-surface-bg pb-24 transition-colors duration-200">
      <PageHeader title="Low Attendance" />

      <div className="px-5 py-4 space-y-6">
        {lowAttendanceList.length === 0 ? (
          <EmptyState 
            title="All Good!" 
            subtitle="No students currently have attendance below 75% in any subject." 
          />
        ) : (
          lowAttendanceList.map(item => (
            <details key={item.subject.id} className="group bg-surface-card border border-border rounded-lg shadow-card mb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="p-5 flex items-center justify-between border-b border-border cursor-pointer list-none hover:bg-surface-muted transition-fast">
                <div className="flex items-center gap-3">
                  <div className="bg-status-error-light p-2.5 rounded-md transition-transform duration-200 group-open:rotate-90">
                    <ChevronRight size={20} className="text-status-error" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-dark block">{item.subject.name}</span>
                    <span className="text-sm font-medium text-status-error block mt-0.5">{item.students.length} students at risk</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/stats/${item.subject.id}`);
                  }}
                  className="text-sm font-semibold text-primary bg-primary-light hover:bg-surface-muted transition-fast px-3 py-1.5 rounded-md"
                >
                  View All Stats
                </button>
              </summary>

              <div className="p-4 space-y-3 bg-surface-muted">
                {item.students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-surface-card border border-border shadow-sm rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-surface-muted border border-border flex items-center justify-center text-dark-60 font-bold text-xs">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-md text-dark">{s.roll_number}</div>
                        <div className="text-sm text-dark-60 truncate max-w-[150px]">{s.name}</div>
                      </div>
                    </div>
                    <Badge variant="danger" className="font-bold">{formatAttendancePercent(s.percentage)}</Badge>
                  </div>
                ))}
              </div>
            </details>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}
