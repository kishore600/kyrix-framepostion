"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Clock, Smartphone, Target, Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Try to fetch user profile - this will fail if not authenticated
      const res = await fetch('/api/user/profile')
      
      if (res.ok) {
        // User is authenticated, redirect to dashboard
        setIsAuthenticated(true)
        router.push('/dashboard')
      } else {
        // User is not authenticated, stay on landing page
        setIsAuthenticated(false)
      }
    } catch (error) {
      // Error checking auth, stay on landing page
      setIsAuthenticated(false)
    } finally {
      setIsChecking(false)
    }
  }

  // Show loading spinner while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render landing page if authenticated (will redirect)
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
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-gray-900">Kyrix</div>
        <div className="space-x-4">
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
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold text-gray-900">
            Distraction-free productivity
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A clean, focused task manager that helps you get things done without the noise. 
            Syncs with your ESP32 for physical productivity tracking.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register" 
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-lg"
            >
              Start for free
            </Link>
            <Link 
              href="#features" 
              className="inline-block px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-lg"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to stay productive</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
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
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-gray-200 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have already transformed their workflow.
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition text-lg font-medium"
          >
            Get started now
          </Link>
        </div>
      </section>
    </main>
  )
}