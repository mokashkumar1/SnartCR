import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Mail, Lock, Eye, EyeOff, Inbox, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import { showToast } from '../../components/ui/Toast'

import logo from '../../assets/smartcrlogo.png'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp, resetPassword } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || (!isForgotPassword && !password.trim())) {
      showToast('Please fill all fields', 'error')
      return
    }
    setLoading(true)
    try {
      if (isForgotPassword) {
        await resetPassword(email.trim())
        setResetSent(true)
      } else if (isSignUp) {
        await signUp(email.trim(), password)
        setSignupSuccess(true)
      } else {
        await signIn(email.trim(), password)
        showToast('Welcome back!')
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-center px-6 overflow-hidden bg-surface-bg">
      <div className="relative z-10 w-full max-w-sm mx-auto">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-full bg-[#0B1120] rounded-xl overflow-hidden shadow-lg border border-border mb-4">
            <img src={logo} alt="SmartCR Logo" className="w-full h-auto object-cover opacity-95" />
          </div>
          <p className="text-dark-60 text-sm font-medium">Built for Pakistani university CRs</p>
        </div>

        <div className="bg-surface-card border border-border shadow-card rounded-lg p-6">
          {signupSuccess ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <Inbox size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Check your email</h2>
              <p className="text-dark-60 text-sm mb-6 leading-relaxed">
                We've sent a verification link to <br/><span className="text-dark font-medium">{email}</span>. <br/>Please verify your email to continue.
              </p>
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => {
                  setSignupSuccess(false)
                  setIsSignUp(false)
                  setPassword('')
                }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : resetSent ? (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4">
                <Mail size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-dark mb-2">Reset link sent</h2>
              <p className="text-dark-60 text-sm mb-6 leading-relaxed">
                We've sent a password reset link to <br/><span className="text-dark font-medium">{email}</span>.
              </p>
              <Button 
                size="lg" 
                className="w-full" 
                onClick={() => {
                  setResetSent(false)
                  setIsForgotPassword(false)
                  setPassword('')
                }}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              {isForgotPassword && (
                <button 
                  onClick={() => setIsForgotPassword(false)}
                  className="flex items-center text-sm text-dark-60 hover:text-primary transition-fast mb-4"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back
                </button>
              )}
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-dark">
                  {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                </h2>
                <p className="text-sm text-dark-60 mt-1">
                  {isForgotPassword 
                    ? 'Enter your email to receive a reset link' 
                    : 'Enter your credentials to continue'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-dark-60 mb-1.5 ml-1">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-60" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu.pk"
                      className="w-full h-12 pl-11 pr-4 bg-surface-bg border border-border rounded-md text-dark placeholder:text-dark-30 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-border-focus)] transition-fast shadow-sm"
                      required
                    />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
                      <label className="block text-sm font-semibold text-dark-60">Password</label>
                      {!isSignUp && (
                        <button 
                          type="button" 
                          onClick={() => setIsForgotPassword(true)}
                          className="text-xs text-primary hover:text-primary-hover transition-fast"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
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
                )}

                <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                  {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              {!isForgotPassword && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-dark-60 hover:text-primary transition-fast"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}