"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, RotateCcw, Clock, AlertCircle, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

interface TaskFormData {
  title: string;
  dueDate: string;
  dueTime: string;
  category: string;
  priority: string;
  estimatedEffort: number;
  isRecurring: boolean;
  recurrenceType: string;
  recurrenceInterval: number;
  recurrenceDayOfWeek: number;
  recurrenceDayOfMonth: number;
  recurrenceEndDate: string;
  // recurrenceCount: number;
}

export default function AddTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    dueTime: "",
    category: "OTHER",
    priority: "MEDIUM",
    estimatedEffort: 25,
    isRecurring: false,
    recurrenceType: "DAILY",
    recurrenceInterval: 1,
    recurrenceDayOfWeek: new Date().getDay(),
    recurrenceDayOfMonth: new Date().getDate(),
    recurrenceEndDate: ""
    // recurrenceCount: 10,
  });

  useEffect(() => {
    if (taskId) {
      setIsEditing(true);
      fetchTaskForEdit(taskId);
    }
  }, [taskId]);

  const fetchTaskForEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      const task = await res.json();

      console.log("Task data for edit:", task);

      // Parse the due date properly using local date format
      const dueDateObj = new Date(task.dueDate);
      const dueDateStr = dueDateObj.toLocaleDateString("en-CA"); // YYYY-MM-DD format
      
      // Extract time if it exists (not midnight)
      let dueTimeStr = "";
      if (dueDateObj.getHours() !== 0 || dueDateObj.getMinutes() !== 0) {
        dueTimeStr = `${dueDateObj.getHours().toString().padStart(2, '0')}:${dueDateObj.getMinutes().toString().padStart(2, '0')}`;
      }

      // Parse recurrence end date
      let recurrenceEndDateStr = "";
      if (task.recurrenceEndDate) {
        const endDateObj = new Date(task.recurrenceEndDate);
        recurrenceEndDateStr = endDateObj.toLocaleDateString("en-CA");
      }

      setFormData({
        title: task.title || "",
        dueDate: dueDateStr,
        dueTime: dueTimeStr,
        category: task.category || "OTHER",
        priority: task.priority || "MEDIUM",
        estimatedEffort: task.estimatedEffort || 25,
        isRecurring: task.isRecurring || false,
        
        recurrenceType: task.recurrenceType || "DAILY",
        recurrenceInterval: task.recurrenceInterval || 1,
        recurrenceDayOfWeek: task.recurrenceDayOfWeek ?? new Date().getDay(),
        recurrenceDayOfMonth: task.recurrenceDayOfMonth ?? new Date().getDate(),
        recurrenceEndDate: recurrenceEndDateStr
        // recurrenceCount: task.recurrenceCount || 10,
      });
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Failed to load task for editing");
    }
  };

  const categories = [
    { value: "WORK", label: "Work", color: "blue" },
    { value: "STUDY", label: "Study", color: "green" },
    { value: "PERSONAL", label: "Personal", color: "purple" },
    { value: "OTHER", label: "Other", color: "gray" },
  ];

  const priorities = [
    { value: "LOW", label: "Low", color: "green" },
    { value: "MEDIUM", label: "Medium", color: "yellow" },
    { value: "HIGH", label: "High", color: "red" },
  ];

  const recurrenceTypes = [
    { value: "DAILY", label: "Daily", description: "Repeats every day" },
    {
      value: "WEEKDAYS",
      label: "Weekdays",
      description: "Repeats Monday to Friday",
    },
    {
      value: "WEEKLY",
      label: "Weekly",
      description: "Repeats on a specific day each week",
    },
    {
      value: "MONTHLY",
      label: "Monthly",
      description: "Repeats on a specific day each month",
    },
    { value: "CUSTOM", label: "Custom", description: "Repeats every X days" },
  ];

  const weekDays = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Make time optional
      const dueDateTime = new Date(formData.dueDate);

      if (formData.dueTime) {
        const [hours, minutes] = formData.dueTime.split(":");
        dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      } else {
        dueDateTime.setHours(0, 0, 0, 0);
      }

      const taskData: any = {
        title: formData.title,
        dueDate: dueDateTime.toISOString(),
        category: formData.category,
        priority: formData.priority,
        estimatedEffort: Number(formData.estimatedEffort),
        isRecurring: formData.isRecurring,
      };

      // Add recurrence fields only if isRecurring is true
      if (formData.isRecurring) {
        taskData.recurrenceType = formData.recurrenceType;
        taskData.recurrenceInterval = Number(formData.recurrenceInterval);
        
        // Include day fields based on recurrence type
        if (formData.recurrenceType === "WEEKLY") {
          taskData.recurrenceDayOfWeek = Number(formData.recurrenceDayOfWeek);
        }
        
        if (formData.recurrenceType === "MONTHLY") {
          taskData.recurrenceDayOfMonth = Number(formData.recurrenceDayOfMonth);
        }
        
        // Handle recurrence end date
        if (formData.recurrenceEndDate) {
          const endDate = new Date(formData.recurrenceEndDate);
          endDate.setHours(23, 59, 59, 999);
          taskData.recurrenceEndDate = endDate.toISOString();
        }
        
        // if (formData.recurrenceCount) {
        //   taskData.recurrenceCount = Number(formData.recurrenceCount);
        // }
      }

      console.log("Sending task data:", taskData);

      const url = isEditing ? `/api/tasks/${taskId}` : "/api/tasks";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save task");
      }

      toast.success(
        isEditing
          ? "Task updated successfully!"
          : formData.isRecurring
            ? "Recurring task created successfully!"
            : "Task created successfully!",
      );
      router.push("/dashboard/view");
    } catch (error: any) {
      console.error("Error saving task:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mobile responsive classes
  const cardClass = "bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200";
  const inputClass = "w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent";
  const labelClass = "block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2";
  const gridClass = "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4";

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 sm:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8">
          {isEditing ? "Edit Task" : "Add New Task"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Info Card */}
          <div className={cardClass}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Basic Information</h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Enter task title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              {/* Category and Priority */}
              <div className={gridClass}>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    className={inputClass}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Priority</label>
                  <select
                    className={inputClass}
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    {priorities.map((pri) => (
                      <option key={pri.value} value={pri.value}>
                        {pri.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className={cardClass}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Schedule</h2>

            <div className="space-y-3 sm:space-y-4">
              {/* Date and Time */}
              <div className={gridClass}>
                <div>
                  <label className={labelClass}>
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className={inputClass}
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Due Time <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="time"
                    className={inputClass}
                    value={formData.dueTime}
                    onChange={(e) =>
                      setFormData({ ...formData, dueTime: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Estimated Effort */}
              <div>
                <label className={labelClass}>
                  Estimated Effort: {formData.estimatedEffort} min
                </label>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  value={formData.estimatedEffort}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedEffort: parseInt(e.target.value),
                    })
                  }
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>5 min</span>
                  <span>60 min</span>
                  <span>120 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Task Card */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold">Recurring Task</h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                />
                <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
              </label>
            </div>

            <AnimatePresence>
              {formData.isRecurring && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 sm:space-y-4 overflow-hidden"
                >
                  {/* Recurrence Type */}
                  <div>
                    <label className={labelClass}>Repeat Every</label>
                    <select
                      className={inputClass}
                      value={formData.recurrenceType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurrenceType: e.target.value,
                        })
                      }
                    >
                      {recurrenceTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Interval */}
                  {formData.recurrenceType === "CUSTOM" && (
                    <div>
                      <label className={labelClass}>Every X Days</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        className={inputClass}
                        value={formData.recurrenceInterval}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrenceInterval: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Weekly Day Selection */}
                  {formData.recurrenceType === "WEEKLY" && (
                    <div>
                      <label className={labelClass}>
                        Repeat On <span className="text-red-500">*</span>
                      </label>
                      <select
                        className={inputClass}
                        value={formData.recurrenceDayOfWeek}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrenceDayOfWeek: parseInt(e.target.value),
                          })
                        }
                      >
                        {weekDays.map((day) => (
                          <option key={day.value} value={day.value}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Monthly Day Selection */}
                  {formData.recurrenceType === "MONTHLY" && (
                    <div>
                      <label className={labelClass}>
                        Day of Month <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className={inputClass}
                        value={formData.recurrenceDayOfMonth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrenceDayOfMonth: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  )}

                  {/* End Options */}
                  <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>
                          End Date <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <input
                          type="date"
                          className={inputClass}
                          value={formData.recurrenceEndDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recurrenceEndDate: e.target.value,
                            })
                          }
                          min={formData.dueDate}
                        />
                      </div>

                      {/* <div>
                        <label className={labelClass}>
                          Max Occurrences <span className="text-gray-400 text-xs">(optional)</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className={inputClass}
                          value={formData.recurrenceCount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recurrenceCount: parseInt(e.target.value),
                            })
                          }
                        />
                      </div> */}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mt-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          Recurrence Preview
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.recurrenceType === "DAILY" &&
                            "Task will repeat every day"}
                          {formData.recurrenceType === "WEEKDAYS" &&
                            "Task will repeat Monday through Friday"}
                          {formData.recurrenceType === "WEEKLY" &&
                            `Task will repeat every ${weekDays.find((d) => d.value === formData.recurrenceDayOfWeek)?.label}`}
                          {formData.recurrenceType === "MONTHLY" &&
                            `Task will repeat on day ${formData.recurrenceDayOfMonth} of each month`}
                          {formData.recurrenceType === "CUSTOM" &&
                            `Task will repeat every ${formData.recurrenceInterval} days`}
                          {formData.recurrenceEndDate && (
                            <span className="block mt-1">
                              Until {new Date(formData.recurrenceEndDate).toLocaleDateString()}
                            </span>
                          )}
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
            className="w-full bg-gray-900 text-white py-3.5 sm:py-3 px-4 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm   shadow-lg sm:shadow-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEditing ? "Updating..." : "Creating..."}
              </div>
            ) : (
              <>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                {isEditing
                  ? "Update Task"
                  : formData.isRecurring
                    ? "Create Recurring Task"
                    : "Create Task"}
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}