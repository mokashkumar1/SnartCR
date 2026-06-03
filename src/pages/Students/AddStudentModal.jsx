import { useState, useEffect } from 'react'
import { useStudentsStore } from '../../store/studentsStore'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { X } from 'lucide-react'

export default function AddStudentModal({ student, onClose, onSaved }) {
  const [roll, setRoll] = useState(student?.roll_number || '')
  const [name, setName] = useState(student?.name || '')
  const [loading, setLoading] = useState(false)
  const { addStudent, updateStudent } = useStudentsStore()

  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roll.trim() || !name.trim()) {
      showToast('Please fill all fields', 'error')
      return
    }
    setLoading(true)
    try {
      if (student) {
        await updateStudent(student.id, { roll_number: roll.trim(), name: name.trim() })
        showToast('Student updated')
      } else {
        await addStudent(roll.trim(), name.trim())
        showToast('Student added')
      }
      onSaved()
    } catch (err) {
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-dark-60 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="w-full sm:max-w-[560px] bg-surface-card border border-border rounded-t-xl sm:rounded-xl shadow-modal flex flex-col">
        
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-dark">{student ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-muted text-dark-60 hover:text-dark transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <form id="studentForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Roll Number</label>
              <input
                type="text"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                placeholder="24CS030"
                className="w-full h-9 px-3 bg-surface-card border border-border rounded-md text-md text-dark placeholder:text-dark-30 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] focus:outline-none transition-fast"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full h-9 px-3 bg-surface-card border border-border rounded-md text-md text-dark placeholder:text-dark-30 focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] focus:outline-none transition-fast"
                required
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="studentForm" disabled={loading}>
            {loading ? 'Saving...' : student ? 'Update' : 'Add Student'}
          </Button>
        </div>

      </div>
    </div>
  )
}