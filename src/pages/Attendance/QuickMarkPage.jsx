import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { showToast } from '../../components/ui/Toast'
import { Check, X } from 'lucide-react'

export default function QuickMarkPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { students } = useStudentsStore()
  const { createSession, markAttendance, completeSession, fetchSubjects } = useAttendanceStore()

  const [statusMap, setStatusMap] = useState(() => {
    const map = {}
    students.forEach((s) => { map[s.id] = 'present' })
    return map
  })
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSubjects()
    const init = async () => {
      if (students.length === 0) {
        showToast('No students found', 'error')
        navigate('/students')
        return
      }
      try {
        const s = await createSession(subjectId, students.length)
        setSession(s)
      } catch (err) {
        showToast(err.message || 'Failed to start session', 'error')
        navigate('/')
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  const toggle = (studentId) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }))
  }

  const markAll = (status) => {
    setStatusMap(() => {
      const newMap = {}
      students.forEach((s) => { newMap[s.id] = status })
      return newMap
    })
  }

  const absentCount = Object.values(statusMap).filter((v) => v === 'absent').length
  const presentCount = students.length - absentCount

  const handleDone = async () => {
    if (!session) return
    setLoading(true)
    try {
      await Promise.all(
        students.map((s) => markAttendance(session.id, s.id, statusMap[s.id] || 'present'))
      )
      await completeSession(session.id)
      navigate(`/summary/${session.id}`)
    } catch (err) {
      showToast(err.message || 'Failed to save attendance', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-24">
      <PageHeader title="Quick Mark" backTo="/" />

      <div className="px-4 py-3 flex items-center justify-between bg-surface-card border-b border-border shadow-sm">
        <div className="text-sm text-dark-60">
          <span className="text-status-success font-medium">{presentCount}</span> P ·{' '}
          <span className="text-status-error font-medium">{absentCount}</span> A
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => markAll('present')}
            className="text-xs px-3 py-1.5 bg-status-success-light text-status-success font-semibold rounded-full active:scale-95 transition-all shadow-sm border border-status-success/20 hover:bg-status-success/20"
          >
            All P
          </button>
          <button 
            onClick={() => markAll('absent')}
            className="text-xs px-3 py-1.5 bg-status-error-light text-status-error font-semibold rounded-full active:scale-95 transition-all shadow-sm border border-status-error/20 hover:bg-status-error/20"
          >
            All A
          </button>
        </div>
      </div>

      <div className="px-4 mt-2 space-y-2">
        {students.map((student) => {
          const status = statusMap[student.id] || 'present'
          const isAbsent = status === 'absent'
          return (
            <button
              key={student.id}
              onClick={() => toggle(student.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left shadow-sm ${
                isAbsent
                  ? 'bg-status-error-light border-status-error/30'
                  : 'bg-surface-card border-border hover:bg-surface-muted'
              }`}
            >
              <div>
                <div className="font-bold text-dark">{student.roll_number}</div>
                <div className="text-sm font-medium text-dark-60">{student.name}</div>
              </div>
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${
                  isAbsent ? 'bg-status-error' : 'bg-status-success'
                }`}
              >
                {isAbsent ? <X size={18} /> : <Check size={18} />}
              </div>
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-bg/95 backdrop-blur border-t border-border z-50 shadow-card">
        <Button size="giant" variant="primary" className="w-full" onClick={handleDone} disabled={loading}>
          {loading ? 'Saving...' : 'Done'}
        </Button>
      </div>
    </div>
  )
}