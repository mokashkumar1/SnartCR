import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useStudentsStore } from '../../store/studentsStore'
import { useAttendanceStore } from '../../store/attendanceStore'
import { useThemeStore } from '../../store/themeStore'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'
import { LogOut, Download, Upload, Trash2, User, Save, Sun, Moon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target.result
        const data = JSON.parse(text)
        if (!data.profile && !data.students) throw new Error('Invalid backup file')
        
        setSaving(true)
        showToast('Restoring backup, please wait...')

        // Execute upserts to Supabase tables
        if (data.profile) await supabase.from('profiles').upsert(data.profile)
        if (data.students?.length) await supabase.from('students').upsert(data.students)
        if (data.subjects?.length) await supabase.from('subjects').upsert(data.subjects)
        if (data.sessions?.length) await supabase.from('sessions').upsert(data.sessions)
        if (data.records?.length) await supabase.from('attendance_records').upsert(data.records)

        // Refresh all local stores to reflect restored data
        if (data.profile?.id) await useAuthStore.getState().fetchProfile(data.profile.id)
        await useStudentsStore.getState().fetchStudents()
        await useAttendanceStore.getState().fetchSubjects()
        await useAttendanceStore.getState().fetchSessions()
        await useAttendanceStore.getState().fetchRecords()

        showToast('Backup restored successfully!')
      } catch (err) {
        showToast(err.message || 'Restore failed', 'error')
      } finally {
        setSaving(false)
      }
    }
    reader.readAsText(file)
    e.target.value = null // Reset input so same file can be selected again
  }

  const handleStartNewSemester = async () => {
    if (!confirm('Start New Semester?\n\nThis will permanently delete all Subjects, Sessions, and Attendance records. Your Students list and Profile will be kept safe.\n\nAre you sure you want to continue?')) return
    setSaving(true)
    try {
      const user = useAuthStore.getState().user
      const sessionIds = useAttendanceStore.getState().sessions.map(s => s.id)
      
      showToast('Clearing semester data...')
      
      if (sessionIds.length > 0) {
        await supabase.from('attendance_records').delete().in('session_id', sessionIds)
      }
      await supabase.from('sessions').delete().eq('user_id', user.id)
      await supabase.from('subjects').delete().eq('user_id', user.id)

      await useAttendanceStore.getState().fetchSubjects()
      await useAttendanceStore.getState().fetchSessions()
      await useAttendanceStore.getState().fetchRecords()

      showToast('New semester started successfully!', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to clear data', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFactoryReset = async () => {
    if (!confirm('FACTORY RESET\n\nWARNING: This will delete absolutely EVERYTHING including your Students and Profile. This action is irreversible.\n\nAre you 100% sure?')) return
    if (!confirm('Final warning: All data will be wiped. Continue?')) return
    
    setSaving(true)
    try {
      const user = useAuthStore.getState().user
      const sessionIds = useAttendanceStore.getState().sessions.map(s => s.id)
      
      showToast('Wiping all data...')
      
      if (sessionIds.length > 0) {
        await supabase.from('attendance_records').delete().in('session_id', sessionIds)
      }
      await supabase.from('sessions').delete().eq('user_id', user.id)
      await supabase.from('subjects').delete().eq('user_id', user.id)
      await supabase.from('students').delete().eq('user_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)

      useStudentsStore.getState().clearStudents()
      useAuthStore.setState({ profile: null })
      await useAttendanceStore.getState().fetchSubjects()
      await useAttendanceStore.getState().fetchSessions()
      await useAttendanceStore.getState().fetchRecords()

      showToast('All data has been wiped.', 'success')
    } catch (err) {
      showToast(err.message || 'Failed to wipe data', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg pb-24 transition-colors duration-200">
      <div className="px-5 pt-8 pb-4 sticky top-0 bg-surface-bg z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-dark">Settings</h1>
      </div>

      <div className="px-5 py-2 space-y-8">
        {/* Appearance */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sun size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-dark-60 uppercase tracking-wider">Appearance</h2>
          </div>
          <div className="bg-surface-card border border-border rounded-lg p-4 shadow-card flex justify-between items-center">
            <div>
              <p className="text-[15px] font-bold text-dark">Dark Mode</p>
              <p className="text-xs font-medium text-dark-60 mt-0.5">Toggle app theme</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-14 h-8 bg-surface-muted rounded-full relative transition-colors duration-300 border border-border"
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-6 bg-primary' : 'bg-white shadow-sm'}`}>
                {theme === 'dark' ? <Moon size={14} className="text-white" /> : <Sun size={14} className="text-primary" />}
              </div>
            </button>
          </div>
        </section>

        {/* Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-dark-60 uppercase tracking-wider">CR Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <input
              type="text"
              value={crName}
              onChange={(e) => setCrName(e.target.value)}
              placeholder="Your Name"
              className="w-full h-12 px-4 bg-surface-card border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Batch"
                className="w-full h-12 px-3 bg-surface-card border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
              />
              <input
                type="text"
                value={deptCode}
                onChange={(e) => setDeptCode(e.target.value)}
                placeholder="Dept"
                className="w-full h-12 px-3 bg-surface-card border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
              />
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="Section"
                className="w-full h-12 px-3 bg-surface-card border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full rounded-md shadow-sm" disabled={saving}>
              <Save size={16} className="mr-2" /> {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </section>

        {/* Data */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Download size={18} className="text-primary" />
            <h2 className="text-sm font-bold text-dark-60 uppercase tracking-wider">Data</h2>
          </div>
          <div className="space-y-3">
            <Button variant="neutral" className="w-full justify-start rounded-md shadow-sm" onClick={handleExport}>
              <Download size={16} className="mr-3" /> Export Backup (JSON)
            </Button>

            <input
              type="file"
              accept=".json"
              className="hidden"
              id="json-upload"
              onChange={handleFileUpload}
            />
            <Button variant="neutral" className="w-full justify-start rounded-md shadow-sm" onClick={() => document.getElementById('json-upload').click()}>
              <Upload size={16} className="mr-3" /> Import Backup (JSON)
            </Button>

            <Button variant="danger" className="w-full justify-start rounded-md shadow-sm" onClick={handleStartNewSemester}>
              <Trash2 size={16} className="mr-3" /> Start New Semester
            </Button>

            <Button variant="danger" className="w-full justify-start rounded-md shadow-sm opacity-80" onClick={handleFactoryReset}>
              <Trash2 size={16} className="mr-3" /> Factory Reset (Wipe All)
            </Button>
          </div>
        </section>

        {/* Auth */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <LogOut size={18} className="text-status-error" />
            <h2 className="text-sm font-bold text-dark-60 uppercase tracking-wider">Account</h2>
          </div>
          <Button variant="neutral" className="w-full justify-start rounded-md shadow-sm text-status-error hover:text-status-error" onClick={signOut}>
            <LogOut size={16} className="mr-3" /> Sign Out
          </Button>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}