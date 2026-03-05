'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Calendar, 
  PlusCircle, 
  Smartphone, 
  LogOut,
  Menu,
  X,
  TrendingUp,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Today' },
  { href: '/dashboard/view', icon: Calendar, label: 'Task View' },
  { href: '/dashboard/add-task', icon: PlusCircle, label: 'Add Task' },
  { href: '/dashboard/device', icon: Smartphone, label: 'Device' },
  { href: '/dashboard/momentum', icon: TrendingUp, label: 'Momentum' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

// Mobile bottom navigation items (limited to 5 for better UX)
const mobileNavItems = menuItems.slice(0, 5)

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Kyrix</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween' }}
                className="fixed right-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <nav className="space-y-2">
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                            isActive 
                              ? 'bg-gray-900 text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <item.icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

    
      </div>
    )
  }

  // Desktop/Tablet layout
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: isSidebarOpen ? 240 : 80 }}
        animate={{ width: isSidebarOpen ? 240 : 80 }}
        className="bg-white border-r border-gray-200 overflow-hidden hidden md:block"
      >
        <div className="p-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg mb-4"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <LogOut size={20} />
              {isSidebarOpen && <span>Logout</span>}
            </button>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}