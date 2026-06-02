import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import { Plus, BookOpen, ChevronRight, AlertCircle, Zap, RotateCcw } from 'lucide-react'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { showToast } from '../../components/ui/Toast'

export default function SubjectSelectPage() {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-navy-900 pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-white mb-1">Select Subject</h1>
        <p className="text-sm text-slate-400">Choose a subject to take attendance</p>
      </div>

      {showResume && currentSession && (
        <div className="mx-4 mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <RotateCcw size={18} className="text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-400 font-medium">Resume session?</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                You have an unfinished attendance session.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1" onClick={handleResume}>Resume</Button>
                <Button size="sm" variant="outline" onClick={handleDiscard}>Discard</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="mx-4 mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-400">You have no students. Add them before taking attendance.</p>
        </div>
      )}

      {showAdd ? (
        <form onSubmit={handleAddSubject} className="px-4 mb-4">
          <input
            autoFocus
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Subject name (e.g. Data Structures)"
            className="w-full h-12 px-4 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="px-4 mb-4">
          <Button variant="outline" className="w-full" onClick={() => setShowAdd(true)}>
            <Plus size={18} className="mr-2" /> Add New Subject
          </Button>
        </div>
      )}

      <div className="px-4 space-y-3">
        {subjects.length === 0 ? (
          <EmptyState title="No subjects yet" subtitle="Add your first subject to start taking attendance." />
        ) : (
          subjects.map((subj) => (
            <div key={subj.id} className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
              <button
                onClick={() => handleSelectSubject(subj.id, 'take')}
                className="w-full flex items-center justify-between p-4 text-left active:bg-navy-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg">
                    <BookOpen size={20} className="text-blue-400" />
                  </div>
                  <span className="font-medium text-white">{subj.name}</span>
                </div>
                <ChevronRight size={20} className="text-slate-500" />
              </button>
              <div className="px-4 pb-3 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs h-9"
                  onClick={() => handleSelectSubject(subj.id, 'take')}
                >
                  One-by-One
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs h-9"
                  onClick={() => handleSelectSubject(subj.id, 'quick')}
                >
                  <Zap size={14} className="mr-1" /> Quick Mark
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