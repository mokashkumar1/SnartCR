import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { Plus, ChevronRight, AlertCircle, Zap, RotateCcw, Users, BookOpen, Sun, Moon } from 'lucide-react'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { showToast } from '../../components/ui/Toast'

export default function SubjectSelectPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { subjects, fetchSubjects, addSubject, currentSession, clearCurrentSession } = useAttendanceStore()
  const { students, fetchStudents } = useStudentsStore()
  
  const [newSubject, setNewSubject] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showResume, setShowResume] = useState(false)

  useEffect(() => {
    fetchSubjects()
    fetchStudents()
  }, [fetchSubjects, fetchStudents])

  useEffect(() => {
    if (currentSession && !currentSession.completed) {
      setShowResume(true)
    } else {
      setShowResume(false)
    }
  }, [currentSession])

  const handleAddSubject = async (e) => {
    e.preventDefault()
    if (!newSubject.trim()) return
    setLoading(true)
    try {
      await addSubject(newSubject.trim())
      setNewSubject('')
      setShowAdd(false)
      showToast('Subject added')
    } catch (err) {
      showToast(err.message || 'Failed to add subject', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubject = (subjectId, mode = 'take') => {
    if (students.length === 0) {
      showToast('Add students first!', 'error')
      navigate('/students')
      return
    }
    if (mode === 'quick') {
      navigate(`/quick/${subjectId}`)
    } else {
      navigate(`/take/${subjectId}`)
    }
  }

  const handleResume = () => {
    if (!currentSession) return
    navigate(`/take/${currentSession.subject_id}`)
  }

  const handleDiscard = () => {
    clearCurrentSession()
    setShowResume(false)
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-20 transition-colors duration-200">
      <div className="px-5 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-surface-bg z-10">
        <h1 className="text-2xl font-bold text-dark">Classes</h1>
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="text-[15px] font-semibold text-primary flex items-center bg-primary-light px-3 py-1.5 rounded-md hover:bg-border transition-fast"
          >
            <Plus size={18} className="mr-1" /> Add
          </button>
        )}
      </div>

      {showResume && currentSession && (
        <div className="mx-5 mb-6 p-4 bg-status-warning-light border border-status-warning/20 rounded-lg shadow-card">
          <div className="flex items-start gap-3">
            <RotateCcw size={18} className="text-status-warning mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-status-warning font-bold">Resume session?</p>
              <p className="text-xs text-status-warning/80 mt-1">
                You have an unfinished attendance session.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1 bg-status-warning hover:bg-status-warning/90 text-white border-none" onClick={handleResume}>Resume</Button>
                <Button size="sm" variant="ghost" className="text-status-warning hover:bg-status-warning/20 border-none" onClick={handleDiscard}>Discard</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="mx-5 mb-6 p-4 bg-status-error-light border border-status-error/20 rounded-lg flex items-start gap-3 shadow-card">
          <AlertCircle size={18} className="text-status-error mt-0.5 shrink-0" />
          <p className="text-sm text-status-error font-medium">You have no students. Add them before taking attendance.</p>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAddSubject} className="px-5 mt-4 mb-6 scroll-mt-32">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Class Name (e.g. Data Structures)"
            className="w-full h-9 px-3 bg-surface-card border border-border rounded-md text-md text-dark placeholder:text-dark-30 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] focus:outline-none transition-fast mb-3 shadow-sm"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 rounded-md">Save</Button>
            <Button type="button" variant="neutral" onClick={() => setShowAdd(false)} className="flex-1 rounded-md">Cancel</Button>
          </div>
        </form>
      )}

      <div className="px-5 space-y-4">
        {subjects.length === 0 ? (
          <EmptyState title="No classes yet" subtitle="Add your first class to start taking attendance." />
        ) : (
          subjects.map((subj) => (
            <div key={subj.id} className="bg-surface-card border border-border rounded-lg overflow-hidden shadow-card">
              <div className="p-5 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-light p-2.5 rounded-md">
                    <BookOpen size={22} className="text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-dark block">{subj.name}</span>
                    <span className="text-sm font-medium text-dark-60 block mt-0.5">{profile?.batch} - {profile?.section}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 bg-surface-muted flex gap-3">
                <Button
                  size="md"
                  variant="primary"
                  className="flex-1"
                  onClick={() => handleSelectSubject(subj.id, 'take')}
                >
                  Take Attendance
                </Button>
                <Button
                  size="md"
                  variant="neutral"
                  className="flex-1"
                  onClick={() => handleSelectSubject(subj.id, 'quick')}
                >
                  <Zap size={16} className="mr-1.5" /> Quick Mark
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  )
}