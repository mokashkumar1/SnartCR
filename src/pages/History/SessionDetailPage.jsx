import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { showToast } from '../../components/ui/Toast'
import { format } from 'date-fns'

export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { sessions, records, fetchSessions, fetchRecords, deleteSession } = useAttendanceStore()
  const { students } = useStudentsStore()

  useEffect(() => {
    fetchSessions()
    fetchRecords()
  }, [fetchSessions, fetchRecords, sessionId])

  const session = sessions.find((s) => s.id === sessionId)
  const sessionRecords = records.filter((r) => r.session_id === sessionId)

  const present = sessionRecords.filter((r) => r.status === 'present')
  const absent = sessionRecords.filter((r) => r.status === 'absent')

  const getStudent = (id) => students.find((s) => s.id === id)

  const handleDelete = async () => {
    if (!confirm('Delete this session permanently?')) return
    try {
      await deleteSession(sessionId)
      showToast('Session deleted')
      navigate('/history')
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 pb-8">
      <PageHeader title="Session Report" backTo="/history" />

      <div className="px-4 py-6 space-y-6">
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-5">
          <div className="text-sm text-slate-400 mb-1">Date</div>
          <div className="text-lg font-medium text-white">
            {format(new Date(session.date), 'EEEE, d MMMM yyyy')}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Badge variant="success">{present.length} Present</Badge>
            <Badge variant="danger">{absent.length} Absent</Badge>
          </div>
        </div>

        {absent.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Absent</h3>
            <div className="space-y-2">
              {absent.map((r) => {
                const s = getStudent(r.student_id)
                if (!s) return null
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div>
                      <div className="font-medium text-white">{s.roll_number}</div>
                      <div className="text-sm text-slate-400">{s.name}</div>
                    </div>
                    <XCircle size={18} className="text-red-400" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {present.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Present</h3>
            <div className="space-y-2">
              {present.map((r) => {
                const s = getStudent(r.student_id)
                if (!s) return null
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div>
                      <div className="font-medium text-white">{s.roll_number}</div>
                      <div className="text-sm text-slate-400">{s.name}</div>
                    </div>
                    <CheckCircle size={18} className="text-green-400" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <Button variant="danger" className="w-full" onClick={handleDelete}>
          <Trash2 size={18} className="mr-2" /> Delete Session
        </Button>
      </div>
    </div>
  )
}