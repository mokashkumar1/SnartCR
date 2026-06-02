import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import BottomNav from '../../components/layout/BottomNav'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { LogOut, Download, Upload, Trash2, User, Save } from 'lucide-react'

export default function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuthStore()
  const { students } = useStudentsStore()
  const { subjects, sessions, records } = useAttendanceStore()

  const [crName, setCrName] = useState(profile?.cr_name || '')
  const [batch, setBatch] = useState(profile?.batch || '')
  const [deptCode, setDeptCode] = useState(profile?.dept_code || '')
  const [section, setSection] = useState(profile?.section || '')
  const [saving, setSaving] = useState(false)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!crName.trim() || !batch.trim() || !deptCode.trim() || !section.trim()) {
      showToast('Fill all fields', 'error')
      return
    }
    setSaving(true)
    try {
      await updateProfile({
        cr_name: crName.trim(),
        batch: batch.trim(),
        dept_code: deptCode.trim(),
        section: section.trim(),
      })
      showToast('Profile updated')
    } catch (err) {
      showToast(err.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const data = {
      profile,
      students,
      subjects,
      sessions,
      records,
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cr-attendance-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded')
  }

  const handleImport = () => {
    try {
      const data = JSON.parse(importText)
      if (!data.profile && !data.students) throw new Error('Invalid backup file')
      // In a real app we would merge/upsert. For now we just validate and notify.
      showToast('Import feature: validate your JSON and use Supabase dashboard for full restore.', 'error')
      setShowImport(false)
      setImportText('')
    } catch {
      showToast('Invalid JSON', 'error')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('WARNING: This will delete ALL your data permanently. Are you sure?')) return
    if (!confirm('This action cannot be undone. Confirm again?')) return
    showToast('Use Supabase dashboard to clear data securely.', 'error')
  }

  return (
    <div className="min-h-screen bg-navy-900 pb-24">
      <PageHeader title="Settings" showBack={false} />

      <div className="px-4 py-6 space-y-8">
        {/* Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-blue-400" />
            <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider">CR Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <input
              type="text"
              value={crName}
              onChange={(e) => setCrName(e.target.value)}
              placeholder="Your Name"
              className="w-full h-12 px-4 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch"
                className="w-full h-12 px-3 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="Dept"
                className="w-full h-12 px-3 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Section"
                className="w-full h-12 px-3 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </section>

        {/* Data */}
        <section>
          <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Data</h2>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
              <Download size={16} className="mr-3" /> Export Backup (JSON)
            </Button>

            {showImport ? (
              <div className="space-y-2">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste backup JSON here..."
                  className="w-full h-32 p-3 bg-navy-800 border border-navy-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-mono"
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleImport}>Import</Button>
                  <Button variant="outline" onClick={() => setShowImport(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full justify-start" onClick={() => setShowImport(true)}>
                <Upload size={16} className="mr-3" /> Import Backup (JSON)
              </Button>
            )}

            <Button variant="danger" className="w-full justify-start" onClick={handleClearAll}>
              <Trash2 size={16} className="mr-3" /> Clear All Data
            </Button>
          </div>
        </section>

        {/* Auth */}
        <section>
          <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Account</h2>
          <Button variant="outline" className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10" onClick={signOut}>
            <LogOut size={16} className="mr-3" /> Sign Out
          </Button>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}