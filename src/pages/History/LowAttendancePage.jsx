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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-24 transition-colors duration-200">
      <PageHeader title="Low Attendance" />

      <div className="px-5 py-4 space-y-6">
        {lowAttendanceList.length === 0 ? (
          <EmptyState 
            title="All Good!" 
            subtitle="No students currently have attendance below 75% in any subject." 
          />
        ) : (
          lowAttendanceList.map(item => (
            <details key={item.subject.id} className="group bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-none mb-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 cursor-pointer list-none hover:bg-slate-50/50 dark:hover:bg-[#131B2F]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-xl transition-transform duration-200 group-open:rotate-90">
                    <ChevronRight size={20} className="text-rose-500 dark:text-rose-400" />
                  </div>
                  <div>
                    <span className="text-[16px] font-bold text-slate-900 dark:text-white block">{item.subject.name}</span>
                    <span className="text-[13px] font-medium text-rose-500 block mt-0.5">{item.students.length} students at risk</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/stats/${item.subject.id}`);
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors px-3 py-1.5 rounded-lg"
                >
                  View All Stats
                </button>
              </summary>

              <div className="p-3 space-y-2 bg-slate-50/30 dark:bg-slate-800/20">
                {item.students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-[#131B2F]/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-[15px] text-slate-900 dark:text-white">{s.roll_number}</div>
                        <div className="text-[13px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{s.name}</div>
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
