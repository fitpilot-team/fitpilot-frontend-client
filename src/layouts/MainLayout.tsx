import { Outlet, useLocation } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { motion, AnimatePresence } from 'framer-motion'

export function MainLayout() {
  const location = useLocation()

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {/* Top padding to account for visual spacing if needed, but standard padding is usually fine */}
          <div className="py-8 px-6 md:px-12 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
