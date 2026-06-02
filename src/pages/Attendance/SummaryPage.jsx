import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAuthStore } from '../../store/authStore'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { showToast } from '../../components/ui/Toast'
import { buildWhatsAppReport, shareReport } from '../../lib/shareUtils'
import { Share2, Copy, CheckCircle, XCircle, Home } from 'lucide-react'
import { format } from 'date-fns'

export default function SummaryPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { sessions, records, subjects, fetchSessions, fetchRecords, fetchSubjects } = useAttendanceStore()
  const { students } = useStudentsStore()
  const { profile } = useAuthStore()

  const [shared, setShared] = useState(false)

  useEffect(() => {
    fetchSessions()
    fetchRecords()
    fetchSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const session = sessions.find((s) => s.id === sessionId)
  const sessionRecords = records.filter((r) => r.session_id === sessionId)
  const subject = subjects.find((s) => s.id === session?.subject_id)

  const absentees = sessionRecords
    .filter((r) => r.status === 'absent')
    .map((r) => students.find((s) => s.id === r.student_id))
    .filter(Boolean)

  const presentCount = sessionRecords.filter((r) => r.status === 'present').length
  const totalStudents = session?.total_students ?? students.length

  const subjectName = subject?.name || 'Subject'
  const classInfo = profile ? `${profile.batch}${profile.dept_code}-${profile.section}` : 'Class'

  const reportText = buildWhatsAppReport({
    classInfo,
    subjectName,
    date: session?.date || new Date(),
    absentees,
    totalStudents,
    presentCount,
    crName: profile?.cr_name || 'CR',
  })

  const handleShare = async () => {
    const result = await shareReport(reportText)
    if (result.success) {
      setShared(true)
      showToast(result.method === 'share' ? 'Shared!' : 'Copied to clipboard!')
    } else if (!result.aborted) {
      showToast('Could not share', 'error')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-slate-400">
        Loading session...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 pb-8">
      <PageHeader title="Attendance Summary" backTo="/" />

      <div className="px-4 py-6 space-y-6">
        {/* Header card */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-5 text-center">
          <h2 className="text-lg font-medium text-white mb-1">{subjectName}</h2>
          <p className="text-sm text-slate-400">
            {format(new Date(session.date), 'EEEE, d MMMM yyyy')}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-400">{presentCount}</div>
              <div className="text-xs text-slate-500">Present</div>
            </div>
            <div className="w-px h-10 bg-navy-700" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-400">{absentees.length}</div>
              <div className="text-xs text-slate-500">Absent</div>
            </div>
            <div className="w-px h-10 bg-navy-700" />
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-white">
                {totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-slate-500">Rate</div>
            </div>
          </div>
        </div>

        {/* Absentees */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
            Absent ({absentees.length})
          </h3>
          {absentees.length === 0 ? (
            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <CheckCircle size={18} />
              <span className="text-sm">All students were present!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {absentees.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-white">{s.roll_number}</div>
                    <div className="text-sm text-slate-400">{s.name}</div>
                  </div>
                  <XCircle size={18} className="text-red-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-4">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed mb-4">
            {reportText}
          </pre>
          <Button className="w-full" onClick={handleShare}>
            {shared ? <Copy size={18} className="mr-2" /> : <Share2 size={18} className="mr-2" />}
            {shared ? 'Copied!' : 'Share Report'}
          </Button>
        </div>

        <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
          <Home size={18} className="mr-2" /> Back to Home
        </Button>
      </div>
    </div>
  )
}