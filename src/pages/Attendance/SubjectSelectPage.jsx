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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-20 transition-colors duration-200">
      <div className="px-5 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-slate-50 dark:bg-[#0B1120] z-10">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Classes</h1>
        {!showAdd && (
          <button 
            onClick={() => setShowAdd(true)}
            className="text-[15px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg"
          >
            <Plus size={18} className="mr-1" /> Add
          </button>
        )}
      </div>

      {showResume && currentSession && (
        <div className="mx-5 mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-none">
          <div className="flex items-start gap-3">
            <RotateCcw size={18} className="text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 dark:text-amber-400 font-bold">Resume session?</p>
              <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1">
                You have an unfinished attendance session.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 dark:text-white rounded-xl" onClick={handleResume}>Resume</Button>
                <Button size="sm" variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-500/30 rounded-xl" onClick={handleDiscard}>Discard</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {students.length === 0 && (
        <div className="mx-5 mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">You have no students. Add them before taking attendance.</p>
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAddSubject} className="px-5 mt-4 mb-6 scroll-mt-32">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Class Name (e.g. Data Structures)"
            className="w-full h-12 px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-3 shadow-sm transition-all"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl">Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border-slate-200 dark:border-slate-700">Cancel</Button>
          </div>
        </form>
      )}

      <div className="px-5 space-y-4">
        {subjects.length === 0 ? (
          <EmptyState title="No classes yet" subtitle="Add your first class to start taking attendance." />
        ) : (
          subjects.map((subj) => (
            <div key={subj.id} className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-[20px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-none">
              <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-xl">
                    <BookOpen size={22} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-[17px] font-bold text-slate-900 dark:text-white block">{subj.name}</span>
                    <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">{profile?.batch} - {profile?.section}</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/20 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 text-[13px] font-semibold h-10 bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white rounded-xl shadow-sm shadow-indigo-500/20"
                  onClick={() => handleSelectSubject(subj.id, 'take')}
                >
                  Take Attendance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-[13px] font-semibold h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 shadow-sm"
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