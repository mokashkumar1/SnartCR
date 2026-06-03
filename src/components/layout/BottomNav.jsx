import { NavLink, useLocation } from 'react-router-dom'
import { Home, BookOpen, FileText, MoreHorizontal, Users } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/classes', icon: BookOpen, label: 'Classes' },
  { to: '/students', icon: Users, label: 'Students' },
  { to: '/history', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
]

export default function BottomNav() {
  const location = useLocation()
  // Hide on auth pages
  if (location.pathname === '/login' || location.pathname === '/setup') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-slate-800 z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-200">
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
              <div className={`relative transition-colors duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}