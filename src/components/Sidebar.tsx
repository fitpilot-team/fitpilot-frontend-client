import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Utensils, ChevronRight, Activity, Ruler, ClipboardList } from 'lucide-react'

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const routerState = useRouterState()

  const navItems = [
    { icon: Home, label: 'Dashboard', to: '/dashboard' },
    { icon: Utensils, label: 'Diets & Foods', to: '/diets' },
    { icon: ClipboardList, label: 'Menus', to: '/menus' },
    { icon: Ruler, label: 'Composition', to: '/composition' },
    // Add more items as needed
  ]

  return (
    <aside
      className={`relative h-screen bg-white shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-gray-50">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap px-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
             <Activity className="h-6 w-6 text-emerald-600" />
          </div>
          <span
            className={`font-bold text-xl text-gray-800 tracking-tight transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 w-0'
            }`}
          >
            FitPilot
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => {
          const isActive = routerState.location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                  isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span
                className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-12'
                }`}
              >
                {item.label}
              </span>
              
              {/* Active Indicator Strip */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-emerald-500 rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>



      {/* Expand Hint Indicator (only visible when collapsed) */}
      {!isExpanded && (
        <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md border border-gray-100 text-gray-400">
           <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </aside>
  )
}
