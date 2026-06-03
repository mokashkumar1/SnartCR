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
    <div className="min-h-screen bg-surface-bg pb-24">
      <PageHeader title="Students" showBack={false} />

      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by roll or name..."
            className="w-full h-10 pl-10 pr-4 bg-surface-card border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="neutral" className="flex-1 rounded-md" onClick={() => setShowAdd(true)}>
            <Plus size={16} className="mr-2" /> Add
          </Button>
          <Button variant="neutral" className="flex-1 rounded-md" onClick={() => setShowBulk(true)}>
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
              className="flex items-center justify-between p-4 bg-surface-card border border-border rounded-lg shadow-sm"
            >
              <div>
                <div className="font-bold text-dark">{student.roll_number}</div>
                <div className="text-sm font-medium text-dark-60 mt-0.5">{student.name}</div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditing(student)}
                  className="p-2 rounded-md text-dark-60 hover:text-primary hover:bg-surface-muted transition-fast"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="p-2 rounded-md text-dark-60 hover:text-status-error hover:bg-surface-muted transition-fast"
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