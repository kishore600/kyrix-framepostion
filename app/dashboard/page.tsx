"use client";

import { useState, useEffect } from "react";
import { format, isToday, parseISO } from "date-fns";
import {
  CheckCircle,
  Circle,
  Trash2,
  Clock,
  RotateCcw,
  TrendingUp,
  Flame,
  User,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string | null;
  category: string;
  priority: string;
  estimatedEffort: number;
  completed: boolean;
  isRecurring: boolean;
  recurrenceType?: string;
}

interface UserProfile {
  id: string;
  email: string;
  personalityMode: string;
  growthIndex: number;
  streakCount: number;
  stabilityScore: number;
  totalFocusMinutes: number;
  deviceId?: string;
}

export default function TodayPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchUserProfile();
  }, []);

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
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch tasks");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const updateStreak = async () => {
    try {
      // Call a dedicated streak update endpoint
      const res = await fetch("/api/user/update-streak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        // Update profile with new streak data
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                streakCount: data.streakCount,
                stabilityScore: data.stabilityScore,
                growthIndex: data.growthIndex,
              }
            : null,
        );

        // Show streak notification if increased
        if (data.streakIncreased) {
          toast.success(`🔥 ${data.streakCount} day streak!`, {
            icon: "🔥",
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }), // This is correct
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update task");
      }

      const updatedTask = await res.json(); // Get the updated task from response

      // Update local tasks state with the response data
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !completed } : task,
        ),
      );

      // If task is being completed, update streak
      if (!completed) {
        await updateStreak();
      } else {
        // Just refresh profile for other metrics
        fetchUserProfile();
      }

      toast.success(!completed ? "Task completed! 🎉" : "Task uncompleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to update task");
      console.error("Toggle complete error:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
      toast.success("Task deleted");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete task");
    }
  };

  // Filter tasks for today
  const todayTasks = tasks
    .filter((task) => {
      if (!task.dueDate) return false;
      try {
        return isToday(parseISO(task.dueDate));
      } catch (error) {
        console.error("Error parsing date:", task.dueDate);
        return false;
      }
    })
    .sort((a, b) => {
      if (!a.dueTime && !b.dueTime) return 0;
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;
      return a.dueTime.localeCompare(b.dueTime);
    });

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progressPercentage =
    todayTasks.length > 0
      ? Math.round((completedCount / todayTasks.length) * 100)
      : 0;

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
        return "text-green-600 bg-green-50 border-green-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  const getPersonalityModeColor = (mode: string) => {
    switch (mode) {
      case "AMBITIOUS":
        return "bg-orange-500 text-orange-700 border-orange-200";
      case "FLOW":
        return "bg-blue-500 text-blue-700 border-blue-200";
      default:
        return "bg-green-500 text-green-700 border-green-200";
    }
  };

  const getStreakMilestone = (streak: number) => {
    const milestones = [7, 14, 21, 30, 60, 90, 100, 365];
    const nextMilestone = milestones.find((m) => m > streak);
    const daysToNext = nextMilestone ? nextMilestone - streak : 0;
    return { nextMilestone, daysToNext };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-100 rounded-xl mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pb-24 sm:pb-8">
      {/* User Profile Section - Mobile Optimized */}
      <div className="mb-4 sm:mb-6 md:mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl text-white p-4 sm:p-5 md:p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">
                {profile?.email?.split("@")[0] || "User"}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                <span
                  className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2 sm:py-1 rounded-full border ${getPersonalityModeColor(profile?.personalityMode || "BALANCED")} bg-opacity-20 text-white border-white/20`}
                >
                  {profile?.personalityMode || "BALANCED"}
                </span>
                {profile?.deviceId && (
                  <span className="text-[10px] sm:text-xs bg-white/10 px-2 py-0.5 sm:px-2 sm:py-1 rounded-full">
                    📱 Connected
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Responsive: 2 columns on mobile, 3 on tablet+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6">
          {/* Growth Index */}
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-300" />
              <span className="text-[10px] sm:text-xs text-blue-200">Growth</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl font-bold">{profile?.growthIndex || 0}</p>
            <div className="w-full bg-white/20 h-1 rounded-full mt-1 sm:mt-2">
              <div
                className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                style={{ width: `${profile?.growthIndex || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-sm relative overflow-hidden">
            {/* {profile?.streakCount && profile.streakCount > 0 && (
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-orange-500/20 rounded-full -mr-6 -mt-6 sm:-mr-8 sm:-mt-8 md:-mr-10 md:-mt-10 animate-pulse"></div>
            )} */}
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Flame
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${profile?.streakCount && profile.streakCount > 0 ? "text-orange-300" : "text-gray-400"}`}
              />
              <span className="text-[10px] sm:text-xs text-orange-200">Streak</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl font-bold flex items-baseline gap-1 sm:gap-2">
              {profile?.streakCount || 0}
              <span className="text-[10px] sm:text-xs font-normal">days</span>
            </p>
  
            {/* Progress to next milestone */}
            {profile?.streakCount && profile.streakCount > 0 ? (
              <div className="mt-1 sm:mt-2">
                <div className="w-full bg-white/20 h-1 rounded-full">
                  <div
                    className="bg-orange-400 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: `${((profile.streakCount % 7) / 7) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ):<div></div>}
          </div>

          {/* Focus Time - Spans full width on mobile, normal on tablet+ */}
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-300" />
              <span className="text-[10px] sm:text-xs text-green-200">Focus</span>
            </div>
            <p className="text-base sm:text-lg md:text-2xl font-bold">
              {Math.floor((profile?.totalFocusMinutes || 0) / 60)}h
            </p>
            <p className="text-[8px] sm:text-xs text-green-200 mt-1">total hours</p>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="mt-3 sm:mt-4 md:mt-6 bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm text-white/80">Today's Progress</span>
            <span className="text-xs sm:text-sm font-medium">
              {completedCount}/{todayTasks.length}
            </span>
          </div>
          <div className="w-full bg-white/20 h-1.5 sm:h-2 rounded-full">
            <div
              className="bg-green-400 h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          {format(new Date(), "EEEE, MMMM d")}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">
          {todayTasks.length === 0
            ? "No tasks scheduled for today"
            : `${todayTasks.length} task${todayTasks.length !== 1 ? "s" : ""} for today`}
        </p>
      </div>

      {/* Tasks List */}
      <div className="space-y-2 sm:space-y-3">
        {todayTasks.length === 0 ? (
          <div className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-lg sm:rounded-xl border border-gray-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No tasks for today</p>
            <button
              onClick={() => router.push("/dashboard/add-task")}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-xs sm:text-sm"
            >
              Add a task
            </button>
          </div>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleComplete(task.id, task.completed)}
                  className="mt-0.5 sm:mt-1 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                    <p
                      className={`text-sm sm:text-base text-gray-900 font-medium truncate max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-sm ${task.completed ? "line-through text-gray-400" : ""}`}
                    >
                      {task.title}
                    </p>
                    {task.isRecurring && (
                      <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                    {task.dueTime && (
                      <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {task.dueTime}
                      </span>
                    )}

                    <span
                      className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${getCategoryColor(task.category)}`}
                    >
                      {task.category === "WORK" ? "💼" : 
                       task.category === "STUDY" ? "📚" :
                       task.category === "PERSONAL" ? "🏠" : "📌"} {task.category}
                    </span>

                    <span
                      className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>

                    <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                      {task.estimatedEffort}m
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50 ml-1 sm:ml-2 flex-shrink-0"
              >
                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quick Add Button for Mobile */}
      <div className="fixed bottom-20 right-4 sm:hidden">
        <button
          onClick={() => router.push("/dashboard/add-task")}
          className="w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
