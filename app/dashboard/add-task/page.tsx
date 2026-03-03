'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, RotateCcw, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface TaskFormData {
  title: string
  dueDate: string
  dueTime: string
  category: string
  priority: string
  estimatedEffort: number
  isRecurring: boolean
  recurrenceType: string
  recurrenceInterval: number
  recurrenceDayOfWeek: number
  recurrenceDayOfMonth: number
  recurrenceEndDate: string
  recurrenceCount: number
}

export default function AddTaskPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '',
    category: 'OTHER',
    priority: 'MEDIUM',
    estimatedEffort: 25,
    isRecurring: false,
    recurrenceType: 'DAILY',
    recurrenceInterval: 1,
    recurrenceDayOfWeek: new Date().getDay(),
    recurrenceDayOfMonth: new Date().getDate(),
    recurrenceEndDate: '',
    recurrenceCount: 10
  })

  const categories = [
    { value: 'WORK', label: 'Work', color: 'blue' },
    { value: 'STUDY', label: 'Study', color: 'green' },
    { value: 'PERSONAL', label: 'Personal', color: 'purple' },
    { value: 'OTHER', label: 'Other', color: 'gray' }
  ]

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'green' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
    { value: 'HIGH', label: 'High', color: 'red' }
  ]

  const recurrenceTypes = [
    { value: 'DAILY', label: 'Daily', description: 'Repeats every day' },
    { value: 'WEEKDAYS', label: 'Weekdays', description: 'Repeats Monday to Friday' },
    { value: 'WEEKLY', label: 'Weekly', description: 'Repeats on a specific day each week' },
    { value: 'MONTHLY', label: 'Monthly', description: 'Repeats on a specific day each month' },
    { value: 'CUSTOM', label: 'Custom', description: 'Repeats every X days' }
  ]

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    // Combine date and time
    let dueDate = new Date(formData.dueDate)
    if (formData.dueTime) {
      const [hours, minutes] = formData.dueTime.split(':')
      dueDate.setHours(parseInt(hours), parseInt(minutes))
    }

    const taskData = {
      title: formData.title,
      dueDate: dueDate.toISOString(),
      category: formData.category,
      priority: formData.priority,
      estimatedEffort: formData.estimatedEffort,
      isRecurring: formData.isRecurring,
      ...(formData.isRecurring && {
        recurrenceType: formData.recurrenceType,
        recurrenceInterval: formData.recurrenceInterval,
        recurrenceDayOfWeek: formData.recurrenceDayOfWeek,
        recurrenceDayOfMonth: formData.recurrenceDayOfMonth,
        // Only include recurrenceEndDate if it has a value
        ...(formData.recurrenceEndDate && formData.recurrenceEndDate.trim() !== '' && {
          recurrenceEndDate: new Date(formData.recurrenceEndDate).toISOString()
        }),
        // Only include recurrenceCount if it has a value
        ...(formData.recurrenceCount && formData.recurrenceCount > 0 && {
          recurrenceCount: formData.recurrenceCount
        })
      })
    }

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create task')
    }

    toast.success(
      formData.isRecurring 
        ? 'Recurring task created successfully!' 
        : 'Task created successfully!'
    )
    router.push('/dashboard')
  } catch (error: any) {
    toast.error(error.message)
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Add New Task</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    {priorities.map(pri => (
                      <option key={pri.value} value={pri.value}>{pri.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Schedule</h2>
            
            <div className="space-y-4">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Time (optional)
                  </label>
                  <input
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({...formData, dueTime: e.target.value})}
                  />
                </div>
              </div>

              {/* Estimated Effort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Effort (minutes)
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  className="w-full"
                  value={formData.estimatedEffort}
                  onChange={(e) => setFormData({...formData, estimatedEffort: parseInt(e.target.value)})}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>5 min</span>
                  <span className="font-medium">{formData.estimatedEffort} min</span>
                  <span>120 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Task Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Recurring Task</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>

            <AnimatePresence>
              {formData.isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  {/* Recurrence Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat Every
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      value={formData.recurrenceType}
                      onChange={(e) => setFormData({...formData, recurrenceType: e.target.value})}
                    >
                      {recurrenceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {recurrenceTypes.find(t => t.value === formData.recurrenceType)?.description}
                    </p>
                  </div>

                  {/* Custom Interval */}
                  {formData.recurrenceType === 'CUSTOM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Every X Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData({...formData, recurrenceInterval: parseInt(e.target.value)})}
                      />
                    </div>
                  )}

                  {/* Weekly Day Selection */}
                  {formData.recurrenceType === 'WEEKLY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat On
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={formData.recurrenceDayOfWeek}
                        onChange={(e) => setFormData({...formData, recurrenceDayOfWeek: parseInt(e.target.value)})}
                      >
                        {weekDays.map(day => (
                          <option key={day.value} value={day.value}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Monthly Day Selection */}
                  {formData.recurrenceType === 'MONTHLY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Day of Month
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        value={formData.recurrenceDayOfMonth}
                        onChange={(e) => setFormData({...formData, recurrenceDayOfMonth: parseInt(e.target.value)})}
                      />
                    </div>
                  )}

                  {/* End Options */}
                  <div className="border-t pt-4 mt-4">
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (optional)
                        </label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={formData.recurrenceEndDate}
                          onChange={(e) => setFormData({...formData, recurrenceEndDate: e.target.value})}
                          min={formData.dueDate}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Occurrences (optional)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                          value={formData.recurrenceCount}
                          onChange={(e) => setFormData({...formData, recurrenceCount: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 p-4 rounded-lg mt-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Recurrence Preview</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.recurrenceType === 'DAILY' && 'Task will repeat every day'}
                          {formData.recurrenceType === 'WEEKDAYS' && 'Task will repeat Monday through Friday'}
                          {formData.recurrenceType === 'WEEKLY' && `Task will repeat every ${weekDays.find(d => d.value === formData.recurrenceDayOfWeek)?.label}`}
                          {formData.recurrenceType === 'MONTHLY' && `Task will repeat on day ${formData.recurrenceDayOfMonth} of each month`}
                          {formData.recurrenceType === 'CUSTOM' && `Task will repeat every ${formData.recurrenceInterval} days`}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Creating Task...'
            ) : (
              <>
                <Calendar className="w-5 h-5" />
                {formData.isRecurring ? 'Create Recurring Task' : 'Create Task'}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}