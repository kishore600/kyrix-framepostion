'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Clock, Repeat, Flame, Play } from 'lucide-react'
import toast from 'react-hot-toast'

interface Settings {
  focusLength: number
  breakDuration: number
  autoRepeatCycles: boolean
  streakTracking: boolean
  autoStartBreaks: boolean
  personalityMode: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!res.ok) throw new Error('Failed to save')

      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="max-w-3xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Focus Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Focus Length */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Focus Duration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default focus length (minutes)
                </label>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.focusLength}
                  onChange={(e) => setSettings({...settings, focusLength: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>5 min</span>
                  <span className="font-medium">{settings.focusLength} min</span>
                  <span>60 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break duration (minutes)
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={settings.breakDuration}
                  onChange={(e) => setSettings({...settings, breakDuration: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>1 min</span>
                  <span className="font-medium">{settings.breakDuration} min</span>
                  <span>15 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Repeat className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold">Behavior</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Auto-repeat cycles</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.autoRepeatCycles}
                    onChange={(e) => setSettings({...settings, autoRepeatCycles: e.target.checked})}
                  />
                  <div className={`block w-14 h-8 rounded-full transition ${settings.autoRepeatCycles ? 'bg-green-400' : 'bg-gray-300'}`}>
                    <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition ${settings.autoRepeatCycles ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Auto-start breaks</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings({...settings, autoStartBreaks: e.target.checked})}
                  />
                  <div className={`block w-14 h-8 rounded-full transition ${settings.autoStartBreaks ? 'bg-green-400' : 'bg-gray-300'}`}>
                    <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition ${settings.autoStartBreaks ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Tracking Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold">Tracking</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Enable streak tracking</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.streakTracking}
                    onChange={(e) => setSettings({...settings, streakTracking: e.target.checked})}
                  />
                  <div className={`block w-14 h-8 rounded-full transition ${settings.streakTracking ? 'bg-green-400' : 'bg-gray-300'}`}>
                    <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition ${settings.streakTracking ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Personality Mode */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Personality Mode</h2>
            </div>
            <div className="space-y-4">
              <select
                value={settings.personalityMode}
                onChange={(e) => setSettings({...settings, personalityMode: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="BALANCED">Balanced</option>
                <option value="AMBITIOUS">Ambitious</option>
                <option value="FLOW">Flow</option>
              </select>
              <p className="text-sm text-gray-500">
                {settings.personalityMode === 'BALANCED' && 'Perfect for daily use with standard productivity patterns'}
                {settings.personalityMode === 'AMBITIOUS' && 'Encourages longer focus sessions and higher goals'}
                {settings.personalityMode === 'FLOW' && 'Optimized for deep work and uninterrupted sessions'}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}