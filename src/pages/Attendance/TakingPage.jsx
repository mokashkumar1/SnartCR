import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import PageHeader from '../../components/layout/PageHeader'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { Undo, Check, X } from 'lucide-react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

export default function TakingPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { students } = useStudentsStore()
  const {
    currentSession,
    createSession,
    markAttendance,
    completeSession,
    resumeSession,
    clearCurrentSession,
    records,
    fetchRecords,
  } = useAttendanceStore()

  const [index, setIndex] = useState(0)
  const [statusMap, setStatusMap] = useState({})
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initDone, setInitDone] = useState(false)

  // Framer motion values
  const x = useMotionValue(0)
  const controls = useAnimation()
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])
  
  // Background color hints
  const bgPresentOpacity = useTransform(x, [0, 150], [0, 0.2])
  const bgAbsentOpacity = useTransform(x, [-150, 0], [0.2, 0])

  useEffect(() => {
    const init = async () => {
      if (students.length === 0) {
        showToast('No students found. Add students first.', 'error')
        navigate('/students')
        return
      }

      if (currentSession && currentSession.subject_id === subjectId && !currentSession.completed) {
        setSession(currentSession)
        resumeSession(currentSession)
        await fetchRecords()
        const existing = records.filter((r) => r.session_id === currentSession.id)
        const map = {}
        existing.forEach((r) => { map[r.student_id] = r.status })
        setStatusMap(map)
        const firstUnmarked = students.findIndex((s) => !map[s.id])
        setIndex(firstUnmarked === -1 ? students.length : firstUnmarked)
      } else {
        try {
          const s = await createSession(subjectId, students.length)
          setSession(s)
        } catch (err) {
          showToast(err.message || 'Failed to start session', 'error')
          navigate('/')
        }
      }
      setInitDone(true)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId])

  useEffect(() => {
    if (!session) return
    const existing = records.filter((r) => r.session_id === session.id)
    const map = {}
    existing.forEach((r) => { map[r.student_id] = r.status })
    setStatusMap((prev) => ({ ...prev, ...map }))
  }, [records, session])

  const currentStudent = students[index]
  const markedCount = Object.keys(statusMap).length

  const mark = async (status) => {
    if (!session || !currentStudent) return
    const studentId = currentStudent.id

    // Animate out based on status
    await controls.start({
      x: status === 'present' ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.2 }
    })

    setStatusMap((prev) => ({ ...prev, [studentId]: status }))

    try {
      await markAttendance(session.id, studentId, status)
    } catch (err) {
      showToast('Failed to save. Will retry.', 'error')
    }

    if (index < students.length - 1) {
      setIndex((i) => i + 1)
      // Reset position for next student
      x.set(0)
      controls.set({ x: 0, opacity: 1, scale: 0.9 })
      controls.start({ scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    } else {
      finishSession()
    }
  }

  const goBack = () => {
    if (index > 0) {
      setIndex((i) => i - 1)
      const prevStudent = students[index - 1]
      setStatusMap((prev) => {
        const next = { ...prev }
        delete next[prevStudent.id]
        return next
      })
      x.set(0)
      controls.set({ x: 0, opacity: 0, scale: 0.9 })
      controls.start({ opacity: 1, scale: 1, transition: { type: 'spring' } })
    }
  }

  const finishSession = async () => {
    if (!session) return
    setLoading(true)
    try {
      await completeSession(session.id)
      clearCurrentSession()
      navigate(`/summary/${session.id}`)
    } catch (err) {
      showToast(err.message || 'Failed to complete session', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (e, info) => {
    if (info.offset.x > 100) {
      mark('present')
    } else if (info.offset.x < -100) {
      mark('absent')
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } })
    }
  }

  if (!initDone) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-navy-950 to-navy-950" />
        <div className="text-center relative z-10 glass-panel p-8 rounded-3xl">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-6xl mb-4">🎉</motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">All Done!</h2>
          <p className="text-blue-200 mb-8">{markedCount}/{students.length} students marked</p>
          <Button size="lg" className="w-full max-w-xs" onClick={finishSession} disabled={loading}>
            {loading ? 'Saving...' : 'Finish & View Report'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col relative overflow-hidden">
      {/* Dynamic Background Overlays */}
      <motion.div style={{ opacity: bgPresentOpacity }} className="absolute inset-0 bg-green-500 pointer-events-none" />
      <motion.div style={{ opacity: bgAbsentOpacity }} className="absolute inset-0 bg-red-500 pointer-events-none" />
      
      <PageHeader title="Taking Attendance" backTo="/" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-sm">
          <ProgressBar current={markedCount} total={students.length} />

          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={controls}
            className="mt-12 mb-12 text-center glass-panel p-8 rounded-3xl cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="text-6xl font-bold tracking-wider text-white mb-3 drop-shadow-lg">
              {currentStudent.roll_number}
            </div>
            <div className="text-xl text-blue-200 font-medium">
              {currentStudent.name}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="success"
              size="giant"
              onClick={() => mark('present')}
              className="rounded-2xl shadow-lg"
            >
              <Check size={28} className="mr-2" /> PRESENT
            </Button>
            <Button
              variant="danger"
              size="giant"
              onClick={() => mark('absent')}
              className="rounded-2xl shadow-lg"
            >
              <X size={28} className="mr-2" /> ABSENT
            </Button>
          </div>

          <div className="h-12 mt-6 flex justify-center items-center">
            {index > 0 && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-white/5"
              >
                <Undo size={16} /> Back to previous
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 text-center text-xs text-slate-500 relative z-10 uppercase tracking-widest font-semibold">
        Swipe Right = Present · Swipe Left = Absent
      </div>
    </div>
  )
}