import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const { updatePassword } = useAuthStore()
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }
    setLoading(true)
    try {
      await updatePassword(password)
      showToast('Password updated successfully!')
      navigate('/')
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center px-6 bg-surface-bg">
      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-dark mb-2">Reset Password</h1>
          <p className="text-dark-60 text-sm">Enter your new password below</p>
        </div>

        <div className="bg-surface-card border border-border shadow-card rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark-60 mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 bg-surface-bg border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-60 hover:text-primary transition-fast p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-60 mb-1.5 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 bg-surface-bg border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
                  required
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full mt-4" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
