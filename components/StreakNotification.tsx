'use client'

import { useEffect, useState } from 'react'
import { Flame, Award, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface StreakNotificationProps {
  streakCount: number
  previousStreak?: number
  milestone?: number
}

export default function StreakNotification({ 
  streakCount, 
  previousStreak = 0,
  milestone 
}: StreakNotificationProps) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if streak increased
    if (streakCount > previousStreak) {
      if (milestone && streakCount >= milestone) {
        setMessage(`🎉 Milestone reached! ${streakCount} day streak!`)
      } else {
        setMessage(`🔥 ${streakCount} day streak! Keep it up!`)
      }
      setShow(true)
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
    
    // Check if streak was lost
    if (streakCount === 0 && previousStreak > 0) {
      setMessage(`💔 Streak lost after ${previousStreak} days. Start a new one today!`)
      setShow(true)
      
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [streakCount, previousStreak, milestone])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 right-4 z-50"
        >
          <div className={`rounded-lg shadow-lg p-4 max-w-sm ${
            streakCount > previousStreak 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
              : 'bg-gray-800 text-white'
          }`}>
            <div className="flex items-start gap-3">
              {streakCount > previousStreak ? (
                <Flame className="w-6 h-6 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium">{message}</p>
                {streakCount > previousStreak && (
                  <div className="flex items-center gap-2 mt-2">
                    <Award className="w-4 h-4" />
                    <span className="text-sm opacity-90">
                      {streakCount === 7 && "One week! You're on fire!"}
                      {streakCount === 30 && "One month! Incredible dedication!"}
                      {streakCount === 100 && "Century streak! You're a legend!"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}