
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut, User, ChevronDown, Bell } from 'lucide-react'
import { useAuth } from '@/features/auth/context/AuthContext'

export function Header() {
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
      logout()
      setIsDropdownOpen(false)
      await navigate({ to: '/auth/sign-in' })
  }

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-40  backdrop-blur-sm bg-white/90 shadow-sm">
      {/* Left side - Breadcrumbs or Page Title (Optional placeholder) */}
      <div className="flex items-center gap-4">
          {/* <h2 className="text-gray-700 font-semibold">Dashboard</h2> */} 
          {/* We can make this dynamic later */}
      </div>

      {/* Right side - Actions & Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications (Placeholder) */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
          >
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-gray-700 leading-none">{user?.name || 'User'}</span>
                <span className="text-[10px] text-gray-400 font-medium">{user?.role || 'Member'}</span>
             </div>
             
             <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center shadow-sm">
                {user?.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" className="h-full w-full rounded-full object-cover" />
                ) : (
                    <span className="text-emerald-700 font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                )}
             </div>
             <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in origin-top-right">
                <div className="p-3 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
                
                <div className="p-1">
                    <Link 
                        to="/dashboard" 
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                    >
                        <User className="w-4 h-4" />
                        Profile
                    </Link>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
