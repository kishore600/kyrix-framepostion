/* eslint-disable react-hooks/set-state-in-effect */
// app/dashboard/week/page.tsx
'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, parseISO, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'
import { CheckCircle, Circle, Clock, Calendar, X, Edit2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  date: string
  time?: string | null
  category: string
  priority: string
  completed: boolean
}

export default function WeekViewPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateTasks, setSelectedDateTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    date: '',
    time: ''
  })

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date)
    const tasksForDate = tasks.filter(task => 
      isSameDay(parseISO(task.date), arg.date)
    )
    setSelectedDateTasks(tasksForDate)
  }

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      })

      if (!res.ok) throw new Error('Failed to update task')

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ))
      
      // Update selected date tasks
      setSelectedDateTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed: !currentStatus } : task
      ))

      toast.success('Task updated')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete task')

      // Update local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
      setSelectedDateTasks(prev => prev.filter(task => task.id !== taskId))

      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const startEditing = (task: Task) => {
    setEditingTask(task)
    setEditForm({
      title: task.title,
      date: task.date.split('T')[0],
      time: task.time || ''
    })
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setEditForm({ title: '', date: '', time: '' })
  }

  const updateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return

    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          date: editForm.date,
          time: editForm.time || null
        })
      })

      if (!res.ok) throw new Error('Failed to update task')

      const updatedTask = await res.json()

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ))
      
      // Update selected date tasks
      setSelectedDateTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ))

      toast.success('Task updated successfully')
      cancelEditing()
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const events = tasks.map(task => ({
    title: task.title,
    date: task.date.split('T')[0],
    backgroundColor: task.completed ? '#10b981' : '#3b82f6',
    borderColor: 'transparent',
    textColor: '#ffffff',
    extendedProps: {
      task
    }
  }))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WORK': return 'text-blue-600 bg-blue-50'
      case 'STUDY': return 'text-purple-600 bg-purple-50'
      case 'PERSONAL': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-96 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">7-Day Overview</h1>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Completed</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridWeek'
          }}
          events={events}
          dateClick={handleDateClick}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
          dayMaxEvents={3}
          weekends={true}
        />
      </div>

      {selectedDate && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Tasks for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            <span className="text-sm text-gray-500">
              {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          
          <div className="space-y-3">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tasks for this day</p>
                <button 
                  onClick={() => window.location.href = '/dashboard/add-task'}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add a task
                </button>
              </div>
            ) : (
              selectedDateTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  {editingTask?.id === task.id ? (
                    <form onSubmit={updateTask} className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Task title"
                        required
                      />
                      <div className="flex gap-3">
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <input
                          type="time"
                          value={editForm.time}
                          onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => toggleTaskCompletion(task.id, task.completed)}
                          className="mt-0.5"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <p className={`text-gray-900 font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.title}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2">
                            {task.time && (
                              <span className="flex items-center gap-1 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                {task.time}
                              </span>
                            )}
                            
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                            
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEditing(task)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}