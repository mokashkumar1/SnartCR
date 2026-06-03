import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useThemeStore } from '../../store/themeStore'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { LogOut, Download, Upload, Trash2, User, Save, Sun, Moon } from 'lucide-react'

export default function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuthStore()
  const { students } = useStudentsStore()
  const { subjects, sessions, records } = useAttendanceStore()
  const { theme, toggleTheme } = useThemeStore()

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] pb-24 transition-colors duration-200">
      <div className="px-5 pt-8 pb-4 sticky top-0 bg-slate-50 dark:bg-[#0B1120] z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      </div>

      <div className="px-5 py-2 space-y-8">
        {/* Appearance */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sun size={18} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</h2>
          </div>
          <div className="bg-white dark:bg-[#111827] border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-none flex justify-between items-center">
            <div>
              <p className="text-[15px] font-bold text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Toggle app theme</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-14 h-8 bg-slate-100 dark:bg-slate-800 rounded-full relative transition-colors duration-300 border border-slate-200 dark:border-slate-700"
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-6 bg-indigo-600' : 'bg-white shadow-sm'}`}>
                {theme === 'dark' ? <Moon size={14} className="text-slate-900 dark:text-white" /> : <Sun size={14} className="text-amber-500" />}
              </div>
            </button>
          </div>
        </section>

        {/* Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">CR Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <input
              type="text"
              value={crName}
              onChange={(e) => setCrName(e.target.value)}
              placeholder="Your Name"
              className="w-full h-12 px-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch"
                className="w-full h-12 px-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="Dept"
                className="w-full h-12 px-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Section"
                className="w-full h-12 px-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white rounded-xl shadow-sm" disabled={saving}>
              <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </section>

        {/* Data */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Download size={18} className="text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data</h2>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 shadow-sm" onClick={handleExport}>
              <Download size={16} className="mr-3" /> Export Backup (JSON)
            </Button>

            {showImport ? (
              <div className="space-y-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-none">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste backup JSON here..."
                  className="w-full h-32 p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white rounded-xl" onClick={handleImport}>Import</Button>
                  <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300" onClick={() => setShowImport(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full justify-start rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 shadow-sm" onClick={() => setShowImport(true)}>
                <Upload size={16} className="mr-3" /> Import Backup (JSON)
              </Button>
            )}

            <Button variant="danger" className="w-full justify-start rounded-xl shadow-sm" onClick={handleClearAll}>
              <Trash2 size={16} className="mr-3" /> Clear All Data
            </Button>
          </div>
        </section>

        {/* Auth */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LogOut size={18} className="text-rose-500" />
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account</h2>
          </div>
          <Button variant="outline" className="w-full justify-start text-rose-500 border-rose-200 dark:border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl bg-white dark:bg-[#111827] shadow-sm" onClick={signOut}>
            <LogOut size={16} className="mr-3" /> Sign Out
          </Button>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}