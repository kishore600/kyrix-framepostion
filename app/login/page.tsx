/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

// app/login/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    console.log('1. Sending login request...')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    console.log('2. Response status:', res.status)
    console.log('3. Response headers:', Object.fromEntries(res.headers.entries()))
    
    const data = await res.json()
    console.log('4. Response data:', data)

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    console.log('5. Login successful, checking cookies...')
    // Check if cookie was set
    console.log('6. Document cookie:', document.cookie)
    
    toast.success('Logged in successfully!')
    
    // Force a hard redirect to ensure cookies are sent
    window.location.href = '/dashboard'
  } catch (error: any) {
    console.error('Login error:', error)
    toast.error(error.message)
  }
}
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-gray-600 mt-2">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="text-gray-900 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}