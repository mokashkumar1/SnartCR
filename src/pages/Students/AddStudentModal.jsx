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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-navy-800 border border-navy-700 rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-white">{student ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-navy-700 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Roll Number</label>
            <input
              type="text"
              value={roll}
              onChange={(e) => setRoll(e.target.value)}
              placeholder="24CS030"
              className="w-full h-12 px-4 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-12 px-4 bg-navy-900 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : student ? 'Update' : 'Add Student'}
          </Button>
        </form>
      </div>
    </div>
  )
}