// app/page.tsx
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">Kyrix</div>
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
          </p>
          <div>
            <Link 
              href="/register" 
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-lg"
            >
              Start for free
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Add tasks',
                description: 'Quickly add tasks with categories and priorities'
              },
              {
                title: 'View your day',
                description: 'See your daily schedule at a glance'
              },
              {
                title: 'Connect your device',
                description: 'Sync with your ESP32 for physical productivity'
              }
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {i + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}