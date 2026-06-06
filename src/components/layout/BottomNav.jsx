import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, FileText, MoreHorizontal, Users } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/history', icon: FileText, label: 'Reports' },
]

export default function BottomNav() {
  const location = useLocation()
  // Hide on auth pages
  if (location.pathname === '/login' || location.pathname === '/setup') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-card border-t border-border z-50 shadow-card transition-colors duration-200">
      <div className="flex items-center justify-around h-16 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.to || (tab.to !== '/' && location.pathname.startsWith(tab.to))
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-fast group ${isActive ? 'bg-primary-light border-t-[3px] border-primary' : 'border-t-[3px] border-transparent hover:bg-surface-muted'}`}
            >
              <div className={`transition-fast ${isActive ? 'text-primary' : 'text-dark-60 group-hover:text-dark'}`}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] transition-fast ${isActive ? 'text-primary font-semibold' : 'text-dark-60 font-medium group-hover:text-dark'}`}>
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}