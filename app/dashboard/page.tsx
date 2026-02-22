// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { format, isToday, parseISO } from 'date-fns'
import { CheckCircle, Circle, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Task {
  id: string
  title: string
  time: string | null
  category: string
  priority: string
  completed: boolean
  date: string
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (res.ok) {
        setTasks(tasks.map(task => 
          task.id === id ? { ...task, completed: !completed } : task
        ))
      }
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setTasks(tasks.filter(task => task.id !== id))
        toast.success('Task deleted')
      }
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const todayTasks = tasks
    .filter(task => isToday(parseISO(task.date)))
    .sort((a, b) => {
      if (!a.time) return 1
      if (!b.time) return -1
      return a.time.localeCompare(b.time)
    })

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-black text-3xl font-bold mb-2">
        {format(new Date(), 'EEEE, MMMM d')}
      </h1>
      
      <div className="space-y-3 mt-8">
        {todayTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No tasks for today. Add one to get started!
          </p>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {task.completed ? (
                    <CheckCircle className="text-green-500" size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <div>
                  <p className={`font-medium ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    {task.time && <span>{task.time}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      task.category === 'WORK' ? 'bg-blue-100 text-blue-700' :
                      task.category === 'STUDY' ? 'bg-green-100 text-green-700' :
                      task.category === 'PERSONAL' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}