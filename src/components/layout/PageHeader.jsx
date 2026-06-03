import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, backTo, showBack = true }) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-surface-bg border-b border-border">
      <div className="flex items-center h-16 px-4 gap-3">
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="p-2 -ml-2 rounded-xl active:scale-90 bg-transparent hover:bg-surface-muted transition-all text-dark-60 hover:text-dark"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-dark truncate">{title}</h1>
      </div>
    </header>
  )
}