"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Calendar, Target, Flame, Activity } from "lucide-react";
import toast from "react-hot-toast";

interface GrowthData {
  weeklyFocus: Array<{ date: string; minutes: number }>;
  completionRatio: number;
  streakCalendar: Array<{ date: string; active: boolean }>;
  pressureMap: Array<{ date: string; count: number; overloaded: boolean }>;
  growthHistory: Array<{ date: string; index: number }>;
  currentStreak: number;
  growthIndex: number;
  stabilityScore: number;
  missedDays: number;
}

export default function MomentumPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    try {
      const res = await fetch("/api/growth");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setData(data);
    } catch (error) {
      toast.error("Failed to load momentum data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8">
        <div className="animate-pulse space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="h-6 sm:h-7 lg:h-8 bg-gray-200 rounded w-40 sm:w-48 lg:w-64"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 sm:h-28 lg:h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-64 sm:h-72 bg-gray-100 rounded-lg"></div>
            <div className="h-64 sm:h-72 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6"];

  const stats = [
    {
      title: "Growth Index",
      value: data.growthIndex,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Current Streak",
      value: `${data.currentStreak} days`,
      icon: Flame,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Completion Rate",
      value: `${Math.round(data.completionRatio)}%`,
      icon: Target,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Stability Score",
      value: `${Math.round(data.stabilityScore)}%`,
      icon: Activity,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  console.log(data);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 sm:space-y-6 lg:space-y-8"
      >
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Momentum Dashboard
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2">
            Track your productivity trends and growth
          </p>
        </div>

        {/* Stats Grid - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{stat.title}</p>
                  <p className="text-base sm:text-lg lg:text-2xl font-bold mt-1 sm:mt-2">
                    {stat.value}
                  </p>
                </div>
              
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Weekly Focus Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
          >
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">
              Weekly Focus Hours
            </h2>
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyFocus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    }
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number | undefined) => [
                      `${value} min`,
                      "Focus Time",
                    ]}
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    }
                    contentStyle={{ fontSize: "12px" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Growth Index History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
          >
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">
              Growth Index Trend
            </h2>
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.growthHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    }
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number | undefined) => [value, "Growth Index"]}
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    }
                    contentStyle={{ fontSize: "12px" }}
                  />
                  <Bar dataKey="index" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pressure Heat Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
          >
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">
              Pressure Heat Map
            </h2>
            <div className="h-48 sm:h-56 lg:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.pressureMap}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    }
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number | undefined) => {
                      if (value === undefined) return ["0 min", "Focus Time"];
                      return [`${value} min`, "Focus Time"];
                    }}
                    labelFormatter={(date) =>
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    }
                    contentStyle={{ fontSize: "12px" }}
                  />
                  <Bar dataKey="count">
                    {data.pressureMap.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.overloaded ? "#ef4444" : "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">Normal</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">Overloaded</span>
              </div>
            </div>
          </motion.div>

          {/* Streak Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6"
          >
            <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 lg:mb-4">
              Streak Calendar
            </h2>
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <div
                  key={`${day}-${idx}`}
                  className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1 sm:py-2"
                >
                  {day}
                </div>
              ))}
              {data.streakCalendar.map((day, index) => (
                <div
                  key={`streak-${index}`}
                  className={`aspect-square rounded-[2px] sm:rounded-sm ${
                    day.active
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  } transition-colors cursor-pointer`}
                  title={`${new Date(day.date).toLocaleDateString()}: ${day.active ? "Active" : "Inactive"}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">Active day</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-200"></div>
                <span className="text-xs sm:text-sm text-gray-600">Inactive</span>
              </div>
            </div>
          </motion.div>
        </div>


      </motion.div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-4 sm:hidden">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition"
        >
          <TrendingUp size={20} />
        </button>
      </div>
    </div>
  );
}