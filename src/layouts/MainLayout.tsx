import { Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export function MainLayout() {
  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {/* Top padding to account for visual spacing if needed, but standard padding is usually fine */}
          <div className="py-8 px-6 md:px-12 w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
