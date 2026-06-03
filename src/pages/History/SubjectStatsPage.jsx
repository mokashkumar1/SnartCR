import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import { getSubjectStatsForAllStudents, formatAttendancePercent } from '../../lib/calculations'
import { TrendingDown, TrendingUp } from 'lucide-react'

export default function SubjectStatsPage() {
  const { subjectId } = useParams()
  const { sessions, records, fetchSessions, fetchRecords } = useAttendanceStore()
  const { students, fetchStudents } = useStudentsStore()

  useEffect(() => {
    fetchSessions()
    fetchRecords()
    fetchStudents()
  }, [fetchSessions, fetchRecords, fetchStudents])

  const subjectSessions = sessions.filter((s) => s.subject_id === subjectId && s.completed)
  const stats = getSubjectStatsForAllStudents(students, sessions, records, subjectId)

  const belowThreshold = stats.filter((s) => s.isBelowThreshold)
  const aboveThreshold = stats.filter((s) => !s.isBelowThreshold && s.percentage !== null)
  const noData = stats.filter((s) => s.percentage === null)

  return (
    <div className="min-h-screen bg-surface-bg pb-8">
      <PageHeader title="Subject Stats" backTo="/history" />

      <div className="px-4 py-4 space-y-6">
        <div className="bg-surface-card border border-border rounded-lg shadow-sm p-4 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xl font-bold text-dark">{subjectSessions.length}</div>
            <div className="text-xs font-semibold text-dark-60">Sessions</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div className="text-xl font-bold text-status-error">{belowThreshold.length}</div>
            <div className="text-xs font-semibold text-dark-60">Below 75%</div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="text-center">
            <div className="text-xl font-bold text-status-success">{aboveThreshold.length}</div>
            <div className="text-xs font-semibold text-dark-60">Above 75%</div>
          </div>
        </div>

        {belowThreshold.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-status-error" />
              <h3 className="text-sm font-semibold text-status-error uppercase tracking-wider">Below 75%</h3>
            </div>
            <div className="space-y-2">
              {belowThreshold.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-status-error-light border border-status-error/20 rounded-md shadow-sm">
                  <div>
                    <div className="font-bold text-dark">{s.roll_number}</div>
                    <div className="text-sm font-medium text-dark-60">{s.name}</div>
                  </div>
                  <Badge variant="danger">{formatAttendancePercent(s.percentage)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {aboveThreshold.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-status-success" />
              <h3 className="text-sm font-semibold text-status-success uppercase tracking-wider">Above 75%</h3>
            </div>
            <div className="space-y-2">
              {aboveThreshold.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-surface-card border border-border rounded-md shadow-sm">
                  <div>
                    <div className="font-bold text-dark">{s.roll_number}</div>
                    <div className="text-sm font-medium text-dark-60">{s.name}</div>
                  </div>
                  <Badge variant="success">{formatAttendancePercent(s.percentage)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {noData.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-60 mb-3 uppercase tracking-wider">No Data</h3>
            <div className="space-y-2">
              {noData.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-surface-card border border-border rounded-md opacity-60 shadow-sm">
                  <div>
                    <div className="font-bold text-dark">{s.roll_number}</div>
                    <div className="text-sm font-medium text-dark-60">{s.name}</div>
                  </div>
                  <Badge variant="default">N/A</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}