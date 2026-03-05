/* eslint-disable react-hooks/set-state-in-effect */
// app/dashboard/week/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, parseISO, isSameDay, isToday, isPast } from "date-fns";
import toast from "react-hot-toast";
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar as CalendarIcon,
  X,
  Edit2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LayoutGrid,
  ListTodo,
  Plus,
  Search,
  AlertCircle,
  TrendingUp,
  Flame,
  Target,
  Filter,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string | null;
  category: string;
  priority: string;
  completed: boolean;
  estimatedEffort?: number;
  isRecurring?: boolean;
}

type ViewType = "month" | "week" | "day";

export default function CalendarViewPage() {
  const calendarRef = useRef<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>("day");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Task>>({});

  const startEditing = () => {
    setIsEditing(true);
    setEditFormData({
      title: selectedTask?.title,
      category: selectedTask?.category,
      priority: selectedTask?.priority,
      dueDate: selectedTask?.dueDate.split("T")[0],
      dueTime: selectedTask?.dueTime,
      estimatedEffort: selectedTask?.estimatedEffort,
    });
  };

  const saveEdit = async () => {
    if (!selectedTask) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }

      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t.id === selectedTask.id ? updatedTask : t)));
      setSelectedTask(updatedTask);
      setIsEditing(false);
      toast.success("Task updated successfully");

      // Refresh calendar
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch");
      }

      const data = await res.json();
      setTasks(data);
      calculateStats(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tasks");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskList: Task[]) => {
    const now = new Date();
    const stats = {
      total: taskList.length,
      completed: taskList.filter((t) => t.completed).length,
      pending: taskList.filter((t) => !t.completed).length,
      overdue: taskList.filter(
        (t) => !t.completed && isPast(parseISO(t.dueDate)),
      ).length,
    };
    setStats(stats);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    toast.success(`Selected ${format(arg.date, "MMMM d, yyyy")}`);
  };

  const handleEventClick = (arg: any) => {
    const task = arg.event.extendedProps.task;
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const toggleTaskCompletion = async (
    taskId: string,
    currentStatus: boolean,
  ) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !currentStatus } : task,
      );
      setTasks(updatedTasks);
      calculateStats(updatedTasks);

      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, completed: !currentStatus });
      }

      // Update calendar
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }

      toast.success(!currentStatus ? "Task completed! 🎉" : "Task uncompleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete task");
      }

      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      calculateStats(updatedTasks);
      setShowTaskModal(false);
      setSelectedTask(null);

      // Update calendar
      if (calendarRef.current) {
        calendarRef.current.getApi().refetchEvents();
      }

      toast.success("Task deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }
      if (filterCategory !== "all" && task.category !== filterCategory) {
        return false;
      }
      return true;
    });
  };

  // Create calendar events with proper time slots
  const events = getFilteredTasks()
    .filter((task) => task.dueDate)
    .map((task) => {
      const startDate = new Date(task.dueDate);

      // Check if the date has a time component (not midnight)
      const hasTimeComponent =
        startDate.getHours() !== 0 ||
        startDate.getMinutes() !== 0 ||
        startDate.getSeconds() !== 0;

      // If task has dueTime or the date has a time component, treat as timed event
      if (task.dueTime || hasTimeComponent) {
        // If we have dueTime but the date might not have it set properly
        if (task.dueTime && !hasTimeComponent) {
          const [hours, minutes] = task.dueTime.split(":");
          startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        }

        return {
          id: task.id,
          title: task.title,
          start: startDate,
          backgroundColor: task.completed
            ? "#10b981"
            : task.priority === "HIGH"
              ? "#ef4444"
              : task.priority === "MEDIUM"
                ? "#f59e0b"
                : "#3b82f6",
          borderColor: "transparent",
          textColor: "#ffffff",
          extendedProps: { task },
          classNames: [
            "calendar-event",
            task.completed ? "completed" : "",
            `priority-${task.priority.toLowerCase()}`,
          ],
        };
      } else {
        // Tasks without any time component go to all-day slot
        return {
          id: task.id,
          title: task.title,
          start: startDate,
          allDay: true,
          backgroundColor: task.completed
            ? "#10b981"
            : task.priority === "HIGH"
              ? "#ef4444"
              : task.priority === "MEDIUM"
                ? "#f59e0b"
                : "#3b82f6",
          borderColor: "transparent",
          textColor: "#ffffff",
          extendedProps: { task },
          classNames: [
            "calendar-event",
            task.completed ? "completed" : "",
            `priority-${task.priority.toLowerCase()}`,
          ],
        };
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50 border-red-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50 border-yellow-100";
      case "LOW":
        return "text-green-600 bg-green-50 border-green-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "WORK":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "STUDY":
        return "text-purple-600 bg-purple-50 border-purple-100";
      case "PERSONAL":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "WORK":
        return "💼";
      case "STUDY":
        return "📚";
      case "PERSONAL":
        return "🏠";
      default:
        return "📌";
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case "month":
        return format(selectedDate, "MMMM yyyy");
      case "week":
        return `Week of ${format(selectedDate, "MMM d, yyyy")}`;
      case "day":
        return format(selectedDate, "EEEE, MMMM d, yyyy");
      default:
        return "";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      if (direction === "prev") {
        calendarApi.prev();
      } else {
        calendarApi.next();
      }
      setSelectedDate(calendarApi.getDate());
    }
  };

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(
        newView === "month"
          ? "dayGridMonth"
          : newView === "week"
            ? "timeGridWeek"
            : "timeGridDay",
      );
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-10 sm:h-12 bg-gray-200 rounded-lg w-48 sm:w-64"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 sm:h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 sm:h-[600px] bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">
      {/* Header with Stats */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
          {/* <button
            onClick={() => (window.location.href = "/dashboard/add-task")}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus size={18} />
            New Task
          </button> */}
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Done</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Overdue</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-3 sm:p-4 border-b border-gray-200">
          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center justify-between flex-wrap gap-4">
            {/* View Selector */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleViewChange("month")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition text-sm ${
                  view === "month" ? "bg-white shadow-sm" : "hover:bg-white/50"
                }`}
              >
                <CalendarDays size={16} />
                <span>Month</span>
              </button>
              <button
                onClick={() => handleViewChange("week")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition text-sm ${
                  view === "week" ? "bg-white shadow-sm" : "hover:bg-white/50"
                }`}
              >
                <LayoutGrid size={16} />
                <span>Week</span>
              </button>
              <button
                onClick={() => handleViewChange("day")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition text-sm ${
                  view === "day" ? "bg-white shadow-sm" : "hover:bg-white/50"
                }`}
              >
                <ListTodo size={16} />
                <span>Day</span>
              </button>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (calendarRef.current) {
                    calendarRef.current.getApi().today();
                    setSelectedDate(calendarRef.current.getApi().getDate());
                  }
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate("prev")}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {getViewTitle()}
                </span>
                <button
                  onClick={() => navigateDate("next")}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition text-sm ${
                showFilters
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="sm:hidden space-y-3">
            {/* Mobile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => handleViewChange("month")}
                  className={`px-3 py-1.5 rounded-md transition text-xs ${
                    view === "month" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => handleViewChange("week")}
                  className={`px-3 py-1.5 rounded-md transition text-xs ${
                    view === "week" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleViewChange("day")}
                  className={`px-3 py-1.5 rounded-md transition text-xs ${
                    view === "day" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  Day
                </button>
              </div>

              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`p-2 rounded-lg border ${
                  showMobileFilters
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200"
                }`}
              >
                <Filter size={18} />
              </button>
            </div>

            {/* Mobile Date Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateDate("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-center px-2">
                {getViewTitle()}
              </span>
              <button
                onClick={() => navigateDate("next")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <button
              onClick={() => {
                if (calendarRef.current) {
                  calendarRef.current.getApi().today();
                  setSelectedDate(calendarRef.current.getApi().getDate());
                }
              }}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg"
            >
              Today
            </button>
          </div>

          {/* Expandable Filters - Desktop */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="hidden sm:block overflow-hidden"
              >
                <div className="flex items-center gap-4 pt-4 mt-4 border-t border-gray-200">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Priorities</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="all">All Categories</option>
                    <option value="WORK">Work</option>
                    <option value="STUDY">Study</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {showMobileFilters && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-40 sm:hidden"
                  onClick={() => setShowMobileFilters(false)}
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "tween" }}
                  className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-xl p-4 sm:hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Filter Tasks</h3>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="all">All Priorities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        <option value="all">All Categories</option>
                        <option value="WORK">Work</option>
                        <option value="STUDY">Study</option>
                        <option value="PERSONAL">Personal</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Calendar - Responsive Height */}
        <div className="p-2 sm:p-4 overflow-x-auto">
          <div className="min-w-[300px] sm:min-w-0">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={
                view === "month"
                  ? "dayGridMonth"
                  : view === "week"
                    ? "timeGridWeek"
                    : "timeGridDay"
              }
              headerToolbar={false}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              height="auto"
              initialDate={selectedDate}
              datesSet={(arg) => setSelectedDate(arg.start)}
              slotMinTime="00:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={true}
              allDayText="All Day"
              slotDuration="00:30:00"
              slotLabelInterval="01:00:00"
              slotLabelFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                meridiem: "short",
              }}
              nowIndicator={true}
              weekNumbers={false} // Hide week numbers on mobile
              weekNumberCalculation="ISO"
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                meridiem: "short",
              }}
              dayMaxEvents={true}
              weekends={true}
              eventContent={renderEventContent}
              eventDisplay="block"
              displayEventTime={true}
              displayEventEnd={false}
              forceEventDuration={false}
              defaultTimedEventDuration="00:30:00"
              views={{
                timeGrid: {
                  dayHeaderFormat: { weekday: "short", month: "numeric", day: "numeric", omitCommas: true }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Detail Modal - Mobile Optimized */}
      <AnimatePresence>
        {showTaskModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ y: "100%", scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: "100%", scale: 1 }}
              transition={{ type: "tween" }}
              className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full mx-0 sm:mx-4 p-4 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Task Details</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Title</p>
                  <p className="text-sm sm:text-base font-medium">{selectedTask.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Date</p>
                    <p className="text-sm">
                      {format(parseISO(selectedTask.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  {selectedTask.dueTime && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Time</p>
                      <p className="text-sm">{selectedTask.dueTime}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Category</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getCategoryColor(selectedTask.category)}`}
                    >
                      {getCategoryIcon(selectedTask.category)} {selectedTask.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Priority</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getPriorityColor(selectedTask.priority)}`}
                    >
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>

                {selectedTask.estimatedEffort && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Estimated Effort</p>
                    <p className="text-sm">{selectedTask.estimatedEffort} minutes</p>
                  </div>
                )}

                {selectedTask.isRecurring && (
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Recurring</p>
                    <p className="text-sm flex items-center gap-1">
                      <RotateCcw size={14} />
                      Yes
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <button
                    onClick={() =>
                      toggleTaskCompletion(
                        selectedTask.id,
                        selectedTask.completed,
                      )
                    }
                    className="flex-1 px-4 py-3 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
                  >
                    {selectedTask.completed
                      ? "Mark Incomplete"
                      : "Mark Complete"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowTaskModal(false);
                        window.location.href = `/dashboard/add-task?id=${selectedTask.id}`;
                      }}
                      className="flex-1 sm:flex-none px-4 py-3 sm:py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1 text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteTask(selectedTask.id)}
                      className="flex-1 sm:flex-none px-4 py-3 sm:py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom event renderer for better task visibility
function renderEventContent(eventInfo: any) {
  const { task } = eventInfo.event.extendedProps;
  const isCompleted = task?.completed;

  return (
    <div
      className={`
        p-1 text-xs sm:text-sm
        ${isCompleted ? "opacity-75 line-through" : ""}
      `}
    >
      <div className="font-medium truncate max-w-[100px] sm:max-w-none">
        {eventInfo.event.title}
      </div>
      {eventInfo.timeText && (
        <div className="text-[10px] sm:text-xs opacity-90 mt-0.5">
          {eventInfo.timeText}
        </div>
      )}
    </div>
  );
}