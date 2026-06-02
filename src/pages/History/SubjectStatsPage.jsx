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
    <div className="min-h-screen bg-navy-900 pb-8">
      <PageHeader title="Subject Stats" backTo="/history" />

      <div className="px-4 py-4 space-y-6">
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-4 flex items-center justify-around">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{subjectSessions.length}</div>
            <div className="text-xs text-slate-500">Sessions</div>
          </div>
          <div className="w-px h-10 bg-navy-700" />
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{belowThreshold.length}</div>
            <div className="text-xs text-slate-500">Below 75%</div>
          </div>
          <div className="w-px h-10 bg-navy-700" />
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{aboveThreshold.length}</div>
            <div className="text-xs text-slate-500">Above 75%</div>
          </div>
        </div>

        {belowThreshold.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={16} className="text-red-400" />
              <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Below 75%</h3>
            </div>
            <div className="space-y-2">
              {belowThreshold.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div>
                    <div className="font-medium text-white">{s.roll_number}</div>
                    <div className="text-sm text-slate-400">{s.name}</div>
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
              <TrendingUp size={16} className="text-green-400" />
              <h3 className="text-sm font-medium text-green-400 uppercase tracking-wider">Above 75%</h3>
            </div>
            <div className="space-y-2">
              {aboveThreshold.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-navy-800 border border-navy-700 rounded-xl">
                  <div>
                    <div className="font-medium text-white">{s.roll_number}</div>
                    <div className="text-sm text-slate-400">{s.name}</div>
                  </div>
                  <Badge variant="success">{formatAttendancePercent(s.percentage)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {noData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">No Data</h3>
            <div className="space-y-2">
              {noData.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-navy-800 border border-navy-700 rounded-xl opacity-60">
                  <div>
                    <div className="font-medium text-white">{s.roll_number}</div>
                    <div className="text-sm text-slate-400">{s.name}</div>
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