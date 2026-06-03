import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentsStore } from '../../store/studentsStore'
import BottomNav from '../../components/layout/BottomNav'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import AddStudentModal from './AddStudentModal'
import BulkImportModal from './BulkImportModal'
import { Plus, Upload, Trash2, Pencil, Search } from 'lucide-react'
import { showToast } from '../../components/ui/Toast'

export default function StudentsPage() {
  const navigate = useNavigate()
  const { students, fetchStudents, deleteStudent } = useStudentsStore()
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const filtered = students.filter(
    (s) =>
      s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return
    try {
      await deleteStudent(id)
      showToast('Student deleted')
    } catch (err) {
      showToast(err.message || 'Delete failed', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1120] pb-24">
      <PageHeader title="Students" showBack={false} />

      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by roll or name..."
            className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-[#131B2F] border border-slate-200 dark:border-[#1E293B] rounded-xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-2" /> Add
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShowBulk(true)}>
            <Upload size={16} className="mr-2" /> Import CSV
          </Button>
        </div>
      </div>

      <div className="px-4 mt-2 space-y-2">
        {filtered.length === 0 ? (
          <EmptyState title="No students found" subtitle={search ? 'Try a different search.' : 'Add your first student to get started.'} />
        ) : (
          filtered.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#131B2F] border border-slate-200 dark:border-[#1E293B] rounded-xl"
            >
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{student.roll_number}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{student.name}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditing(student)}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-400 hover:bg-navy-700 transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-400 hover:bg-navy-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <AddStudentModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false)
            fetchStudents()
          }}
        />
      )}

      {editing && (
        <AddStudentModal
          student={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            fetchStudents()
          }}
        />
      )}

      {showBulk && (
        <BulkImportModal
          onClose={() => setShowBulk(false)}
          onImported={() => {
            setShowBulk(false)
            fetchStudents()
          }}
        />
      )}

      <BottomNav />
    </div>
  )
}