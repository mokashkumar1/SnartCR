import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { User, Hash, Building, Users } from 'lucide-react'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'

export default function SetupPage() {
  const [cr_name, setCrName] = useState('')
  const [batch, setBatch] = useState('')
  const [dept_code, setDeptCode] = useState('')
  const [section, setSection] = useState('')
  const [loading, setLoading] = useState(false)
  const { createProfile } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!cr_name.trim() || !batch.trim() || !dept_code.trim() || !section.trim()) {
      showToast('Please fill all fields', 'error')
      return
    }
    setLoading(true)
    try {
      await createProfile({ cr_name: cr_name.trim(), batch: batch.trim(), dept_code: dept_code.trim(), section: section.trim() })
      showToast('Profile created!')
    } catch (err) {
      showToast(err.message || 'Failed to save profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Your Name', value: cr_name, setter: setCrName, icon: User, placeholder: 'Moksh Kumar' },
    { label: 'Batch', value: batch, setter: setBatch, icon: Hash, placeholder: '24' },
    { label: 'Department Code', value: dept_code, setter: setDeptCode, icon: Building, placeholder: 'CS' },
    { label: 'Section', value: section, setter: setSection, icon: Users, placeholder: 'A' },
  ]

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col justify-center px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h1>
        <p className="text-slate-400 text-sm">This info will appear on attendance reports.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.label}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{f.label}</label>
              <div className="relative">
                <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full h-12 pl-10 pr-4 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
                  required
                />
              </div>
            </div>
          )
        })}

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  )
}