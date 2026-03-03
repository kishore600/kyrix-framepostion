'use client'

import { useState, useEffect } from 'react'
import { format, isToday, parseISO } from 'date-fns'
import { 
  CheckCircle, 
  Circle, 
  Trash2, 
  Clock, 
  RotateCcw,
  TrendingUp,
  Flame,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  dueDate: string
  dueTime: string | null
  category: string
  priority: string
  estimatedEffort: number
  completed: boolean
  isRecurring: boolean
  recurrenceType?: string
}

interface UserProfile {
  id: string
  email: string
  personalityMode: string
  growthIndex: number
  streakCount: number
  stabilityScore: number
  totalFocusMinutes: number
  deviceId?: string
}

export default function TodayPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchTasks()
    fetchUserProfile()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tasks')
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch')
      }
      
      const data = await res.json()
      setTasks(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch tasks')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const updateStreak = async () => {
    try {
      // Call a dedicated streak update endpoint
      const res = await fetch('/api/user/update-streak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (res.ok) {
        const data = await res.json()
        // Update profile with new streak data
        setProfile(prev => prev ? {
          ...prev,
          streakCount: data.streakCount,
          stabilityScore: data.stabilityScore,
          growthIndex: data.growthIndex
        } : null)
        
        // Show streak notification if increased
        if (data.streakIncreased) {
          toast.success(`🔥 ${data.streakCount} day streak!`, {
            icon: '🔥',
            duration: 4000
          })
        }
      }
    } catch (error) {
      console.error('Failed to update streak:', error)
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update task')
      }

      // Update local tasks state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed: !completed } : task
      ))
      
      // If task is being completed, update streak
      if (!completed) {
        await updateStreak()
      } else {
        // Just refresh profile for other metrics
        fetchUserProfile()
      }
      
      toast.success(!completed ? 'Task completed! 🎉' : 'Task uncompleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task')
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to delete task')
      }

      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success('Task deleted')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task')
    }
  }

  // Filter tasks for today
  const todayTasks = tasks
    .filter(task => {
      if (!task.dueDate) return false
      try {
        return isToday(parseISO(task.dueDate))
      } catch (error) {
        console.error('Error parsing date:', task.dueDate)
        return false
      }
    })
    .sort((a, b) => {
      if (!a.dueTime && !b.dueTime) return 0
      if (!a.dueTime) return 1
      if (!b.dueTime) return -1
      return a.dueTime.localeCompare(b.dueTime)
    })

  const completedCount = todayTasks.filter(t => t.completed).length
  const progressPercentage = todayTasks.length > 0 
    ? Math.round((completedCount / todayTasks.length) * 100) 
    : 0

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-100'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-100'
      case 'LOW': return 'text-green-600 bg-green-50 border-green-100'
      default: return 'text-gray-600 bg-gray-50 border-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WORK': return 'text-blue-600 bg-blue-50 border-blue-100'
      case 'STUDY': return 'text-purple-600 bg-purple-50 border-purple-100'
      case 'PERSONAL': return 'text-green-600 bg-green-50 border-green-100'
      default: return 'text-gray-600 bg-gray-50 border-gray-100'
    }
  }

  const getPersonalityModeColor = (mode: string) => {
    switch (mode) {
      case 'AMBITIOUS': return 'bg-orange-500 text-orange-700 border-orange-200'
      case 'FLOW': return 'bg-blue-500 text-blue-700 border-blue-200'
      default: return 'bg-green-500 text-green-700 border-green-200'
    }
  }

  const getStreakMilestone = (streak: number) => {
    const milestones = [7, 14, 21, 30, 60, 90, 100, 365]
    const nextMilestone = milestones.find(m => m > streak)
    const daysToNext = nextMilestone ? nextMilestone - streak : 0
    return { nextMilestone, daysToNext }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-100 rounded-xl mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Profile Section */}
      <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">

            
            <div>
              <h2 className="text-xl font-bold">{profile?.email?.split('@')[0] || 'User'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getPersonalityModeColor(profile?.personalityMode || "BALANCED")} bg-opacity-20 text-white border-white/20`}
                >
                  {profile?.personalityMode || "BALANCED"} Mode
                </span>
                {profile?.deviceId && (
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                    Device Connected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {/* Growth Index */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-300" />
              <span className="text-xs text-blue-200">Growth Index</span>
            </div>
            <p className="text-2xl font-bold">{profile?.growthIndex || 0}</p>
            <div className="w-full bg-white/20 h-1 rounded-full mt-2">
              <div
                className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${profile?.growthIndex || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden">
            {profile?.streakCount && profile.streakCount > 0 && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 rounded-full -mr-10 -mt-10 animate-pulse"></div>
            )}
            <div className="flex items-center gap-2 mb-1">
              <Flame className={`w-4 h-4 ${profile?.streakCount && profile.streakCount > 0 ? 'text-orange-300' : 'text-gray-400'}`} />
              <span className="text-xs text-orange-200">Current Streak</span>
            </div>
            <p className="text-2xl font-bold flex items-baseline gap-2">
              {profile?.streakCount || 0} days
              {profile?.streakCount && profile.streakCount > 0 && (
                <span className="text-xs font-normal bg-orange-500/30 px-2 py-1 rounded-full">
                  {getStreakMilestone(profile.streakCount).daysToNext} to next
                </span>
              )}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-orange-200">Stability: {profile?.stabilityScore || 0}%</span>
              <span className="text-xs text-orange-200">
                {!profile?.streakCount ? 'Start your streak!' : 'Keep it up!'}
              </span>
            </div>
            {/* Progress to next milestone */}
            {profile?.streakCount && profile.streakCount > 0 && (
              <div className="mt-2">
                <div className="w-full bg-white/20 h-1 rounded-full">
                  <div 
                    className="bg-orange-400 h-1 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${((profile.streakCount % 7) / 7) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Time */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-300" />
              <span className="text-xs text-green-200">Focus Time</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.floor((profile?.totalFocusMinutes || 0) / 60)}h
            </p>
            <p className="text-xs text-green-200 mt-2">Total hours</p>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="mt-4 bg-white/5 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/80">Today's Progress</span>
            <span className="text-sm font-medium">
              {completedCount}/{todayTasks.length} tasks
            </span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full">
            <div
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {format(new Date(), "EEEE, MMMM d")}
        </h1>
        <p className="text-gray-600 mt-1">
          {todayTasks.length === 0
            ? "No tasks scheduled for today"
            : `You have ${todayTasks.length} task${todayTasks.length !== 1 ? "s" : ""} for today`}
        </p>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {todayTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">No tasks for today</p>
            <button
              onClick={() => router.push("/dashboard/add-task")}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm"
            >
              Add a task
            </button>
          </div>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className="mt-1"
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={`text-gray-900 font-medium ${task.completed ? "line-through text-gray-400" : ""}`}
                    >
                      {task.title}
                    </p>
                    {task.isRecurring && (
                      <RotateCcw className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {task.dueTime && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        {task.dueTime}
                      </span>
                    )}

                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(task.category)}`}
                    >
                      {task.category}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>

                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      {task.estimatedEffort} min
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}