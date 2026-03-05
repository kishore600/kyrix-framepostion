"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Clock, Smartphone, Target, Loader2, Menu, X } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/user/profile')
      
      if (res.ok) {
        setIsAuthenticated(true)
        router.push('/dashboard')
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const features = [
    {
      icon: Clock,
      title: 'Smart Task Management',
      description: 'Organize tasks with priorities, categories, and recurring schedules'
    },
    {
      icon: TrendingUp,
      title: 'Momentum Tracking',
      description: 'Track your growth with detailed analytics and streak calendars'
    },
    {
      icon: Smartphone,
      title: 'ESP32 Integration',
      description: 'Sync with your physical device for distraction-free focus sessions'
    },
    {
      icon: Target,
      title: 'Personality Modes',
      description: 'Choose between Balanced, Ambitious, or Flow modes'
    }
  ]

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Navigation - Mobile Optimized */}
      <nav className="relative flex justify-between items-center p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="text-xl sm:text-2xl font-bold text-gray-900">Kyrix</div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex space-x-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 sm:hidden z-50">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/login" 
                className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 px-2">
            Distraction-free productivity
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            A clean, focused task manager that helps you get things done without the noise. 
            Syncs with your ESP32 for physical productivity tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link 
              href="/register" 
              className="inline-block px-6 sm:px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-base sm:text-lg"
            >
              Start for free
            </Link>
            <Link 
              href="#features" 
              className="inline-block px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-base sm:text-lg"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Features - Mobile Optimized */}
      <section id="features" className="bg-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 px-4">
            Everything you need to stay productive
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl sm:bg-transparent">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Mobile Optimized */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Create tasks',
                description: 'Add tasks with priorities, categories, and recurring schedules'
              },
              {
                step: '02',
                title: 'Focus with your device',
                description: 'Use your ESP32 device for distraction-free focus sessions'
              },
              {
                step: '03',
                title: 'Track your growth',
                description: 'Monitor your progress with detailed analytics and insights'
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center md:text-left px-4">
                <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-200 mb-3 sm:mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Mobile Optimized */}
      <section className="bg-gray-900 text-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
            Join thousands of users who have already transformed their workflow.
          </p>
          <Link 
            href="/register" 
            className="inline-block px-6 sm:px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition text-base sm:text-lg font-medium"
          >
            Get started now
          </Link>
        </div>
      </section>
    </main>
  )
}