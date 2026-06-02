import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, backTo, showBack = true }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/5 rounded-none border-x-0 border-t-0 shadow-none">
      <div className="flex items-center h-14 px-4 gap-3">
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="p-2 -ml-2 rounded-xl active:scale-90 bg-white/5 hover:bg-white/10 transition-all text-slate-300 hover:text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-lg font-medium text-white truncate drop-shadow-sm">{title}</h1>
      </div>
    </header>
  )
}