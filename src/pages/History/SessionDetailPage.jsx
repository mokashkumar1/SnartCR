import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAuthStore } from '../../store/authStore'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { CheckCircle, XCircle, Trash2, Share2, Copy, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react'
import { showToast } from '../../components/ui/Toast'
import { format } from 'date-fns'
import { buildWhatsAppReport, shareReport } from '../../lib/shareUtils'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function SessionDetailPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { sessions, records, subjects, fetchSessions, fetchRecords, fetchSubjects, deleteSession } = useAttendanceStore()
  const { students, fetchStudents } = useStudentsStore()
  const { profile } = useAuthStore()

  const [shared, setShared] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    fetchSessions()
    fetchRecords()
    fetchSubjects()
    fetchStudents()
  }, [fetchSessions, fetchRecords, fetchSubjects, fetchStudents, sessionId])

  const session = sessions.find((s) => s.id === sessionId)
  const sessionRecords = records.filter((r) => r.session_id === sessionId)
  const subject = subjects.find((s) => s.id === session?.subject_id)

  const presentRecords = sessionRecords.filter((r) => r.status === 'present')
  const absentRecords = sessionRecords.filter((r) => r.status === 'absent')

  const presentCount = presentRecords.length
  const totalStudents = session?.total_students ?? students.length

  const getStudent = (id) => students.find((s) => s.id === id)

  // Absentees for export
  const absentees = absentRecords
    .map((r) => getStudent(r.student_id))
    .filter(Boolean)

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

  const handleExportCSV = () => {
    let csv = `Subject,"${subjectName}"\n`
    csv += `Date,"${format(new Date(session?.date || new Date()), 'EEEE, d MMMM yyyy')}"\n`
    csv += `Class,"${classInfo}"\n\n`
    csv += `Roll Number,Name,Status\n`
    
    sessionRecords.forEach(record => {
      const student = getStudent(record.student_id)
      if (student) {
        csv += `"${student.roll_number}","${student.name}","${record.status}"\n`
      }
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Attendance_${subjectName.replace(/\s+/g, '_')}_${format(new Date(session?.date || new Date()), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV downloaded!')
  }

  const handleExportImage = async () => {
    if (!exportRef.current || isExporting) return
    setIsExporting(true)
    showToast('Generating Image...')
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready
      await new Promise(resolve => setTimeout(resolve, 500))
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      const canvas = await html2canvas(exportRef.current, { 
        backgroundColor: '#ffffff', 
        scale: 2, 
        useCORS: true 
      })
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `Attendance_${subjectName.replace(/\s+/g, '_')}_${format(new Date(session?.date || new Date()), 'yyyy-MM-dd')}.jpg`
      a.click()
      showToast('Image downloaded successfully!')
    } catch (err) {
      console.error(err)
      showToast('Failed to save image', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!exportRef.current || isExporting) return
    setIsExporting(true)
    showToast('Generating PDF...')
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready
      await new Promise(resolve => setTimeout(resolve, 500))
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

      const pages = exportRef.current.querySelectorAll('.export-page')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i]
        const canvas = await html2canvas(pageEl, { 
          backgroundColor: '#ffffff',
          scale: 2, 
          useCORS: true 
        })
        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        
        if (i > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
      }
      
      pdf.save(`Attendance_${subjectName.replace(/\s+/g, '_')}_${format(new Date(session?.date || new Date()), 'yyyy-MM-dd')}.pdf`)
      showToast('PDF downloaded successfully!')
    } catch (err) {
      console.error(err)
      showToast('Failed to save PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this session permanently?')) return
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
      <div className="min-h-screen bg-surface-bg flex items-center justify-center text-dark-60">
        Loading...
      </div>
    )
  }

  // Calculate chunks for A4 pagination
  const ABSENTEES_PER_PAGE = 39 // 13 rows * 3 columns
  const absenteeChunks = []
  if (absentees.length === 0) {
    absenteeChunks.push([])
  } else {
    for (let i = 0; i < absentees.length; i += ABSENTEES_PER_PAGE) {
      absenteeChunks.push(absentees.slice(i, i + ABSENTEES_PER_PAGE))
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-8 overflow-x-hidden transition-colors duration-200">
      <PageHeader title="Session Report" backTo="/history" />

      <div className="px-4 py-6 space-y-6">
        <div className="bg-surface-card border border-border rounded-lg p-5 shadow-card">
          <div className="text-sm font-semibold text-dark-60 mb-1">Date</div>
          <div className="text-lg font-bold text-dark">
            {format(new Date(session.date), 'EEEE, d MMMM yyyy')}
          </div>
          <div className="text-sm font-semibold text-dark-60 mt-2">
            Subject: <span className="text-dark">{subjectName}</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Badge variant="success">{presentRecords.length} Present</Badge>
            <Badge variant="danger">{absentRecords.length} Absent</Badge>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-surface-card border border-border rounded-lg p-5 shadow-card">
          <h3 className="text-sm font-semibold text-dark-60 mb-3 uppercase tracking-wider">Export Report</h3>
          <div className="grid grid-cols-2 gap-3 mb-1">
            <Button disabled={isExporting} variant="neutral" className="w-full flex items-center justify-center gap-2 rounded-md" onClick={handleExportImage}>
              <ImageIcon size={16} /> Save Image
            </Button>
            <Button disabled={isExporting} variant="neutral" className="w-full flex items-center justify-center gap-2 rounded-md" onClick={handleExportPDF}>
              <FileText size={16} /> Save PDF
            </Button>
            <Button disabled={isExporting} variant="neutral" className="w-full flex items-center justify-center gap-2 rounded-md" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} /> Save CSV
            </Button>
            <Button className="w-full flex items-center justify-center gap-2 rounded-md" onClick={handleShare}>
              {shared ? <Copy size={16} /> : <Share2 size={16} />}
              {shared ? 'Copied' : 'Copy Text'}
            </Button>
          </div>
        </div>

        {absentRecords.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-60 mb-3 uppercase tracking-wider">Absent</h3>
            <div className="space-y-2">
              {absentRecords.map((r) => {
                const s = getStudent(r.student_id)
                if (!s) return null
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-status-error-light border border-status-error/20 rounded-md shadow-sm">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-dark mb-0.5">{s.roll_number}</div>
                      <div className="text-sm font-medium text-dark-60 pb-0.5">{s.name}</div>
                    </div>
                    <XCircle size={18} className="text-status-error shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {presentRecords.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-dark-60 mb-3 uppercase tracking-wider">Present</h3>
            <div className="space-y-2">
              {presentRecords.map((r) => {
                const s = getStudent(r.student_id)
                if (!s) return null
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-status-success-light border border-status-success/20 rounded-md shadow-sm">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-dark mb-0.5">{s.roll_number}</div>
                      <div className="text-sm font-medium text-dark-60 pb-0.5">{s.name}</div>
                    </div>
                    <CheckCircle size={18} className="text-status-success shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-border">
          <Button variant="danger" className="w-full" onClick={handleDelete}>
            <Trash2 size={18} className="mr-2" /> Delete Session
          </Button>
        </div>
      </div>

      {/* Hidden Off-Screen A4 Export Layout */}
      <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <div ref={exportRef} className="flex flex-col gap-4 bg-slate-100 p-8">
          {absenteeChunks.map((chunk, index) => (
            <div
              key={index}
              className="export-page bg-white w-[794px] h-[1123px] p-12 box-border relative flex flex-col shadow-none border-0"
            >
              {/* Header */}
              <div className="text-center border-b border-slate-200 pb-6 mb-6">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{subjectName}</h2>
                <p className="text-lg text-slate-600 font-medium">
                  {format(new Date(session.date), 'EEEE, d MMMM yyyy')} • {classInfo}
                </p>
                <div className="mt-6 flex items-center justify-center gap-16">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Present</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold text-red-600">{absentees.length}</div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Absent</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold text-slate-900">
                      {totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Rate</div>
                  </div>
                </div>
              </div>

              {/* Absentees Grid */}
              <h3 className="text-xl font-bold text-slate-800 mb-5 border-l-4 border-red-500 pl-3">
                Absent Students ({absentees.length}) {absenteeChunks.length > 1 ? `- Page ${index + 1}` : ''}
              </h3>
              
              {chunk.length === 0 ? (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-6 rounded-xl border border-green-200">
                  <CheckCircle size={24} />
                  <span className="text-lg font-medium">All students were present!</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-x-4 gap-y-3 flex-1 content-start">
                  {chunk.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-lg">
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-slate-900 text-[15px] mb-1">{s.roll_number}</div>
                        <div className="text-sm text-slate-600 font-medium pb-0.5">{s.name}</div>
                      </div>
                      <XCircle size={18} className="text-red-500 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Footer Page Number */}
              <div className="absolute bottom-10 left-0 right-0 text-center text-sm font-bold text-slate-400">
                Page {index + 1} of {absenteeChunks.length}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}