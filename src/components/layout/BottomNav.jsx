import { NavLink, useLocation } from 'react-router-dom'
import { ClipboardCheck, Users, History, Settings } from 'lucide-react'

const tabs = [
  { to: '/', icon: ClipboardCheck, label: 'Take' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const location = useLocation()
  // Hide on auth pages
  if (location.pathname === '/login' || location.pathname === '/setup') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50 rounded-t-2xl">
      <div className="flex items-center justify-around h-16 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to))
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 relative group"
            >
              <div className={`relative transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}