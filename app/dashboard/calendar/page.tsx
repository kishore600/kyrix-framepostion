// /* eslint-disable react-hooks/set-state-in-effect */
// // app/dashboard/calendar/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { format, parseISO, isToday, isPast, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore } from "date-fns";
// import toast from "react-hot-toast";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
//   CheckCircle,
//   Circle,
//   AlertCircle,
//   Clock,
//   Repeat,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface Task {
//   id: string;
//   title: string;
//   dueDate: string;
//   dueTime?: string | null;
//   category: string;
//   priority: string;
//   completed: boolean;
//   estimatedEffort?: number;
//   isRecurring?: boolean;
//   parentTaskId?: string | null;
//   recurrenceType?: string;
//   recurrenceEndDate?: string;
// }

// type ViewType = "month" | "week" | "day";

// export default function CalendarPage() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [view, setView] = useState<ViewType>("month");
//   const [loading, setLoading] = useState(true);
//   const [selectedTask, setSelectedTask] = useState<Task | null>(null);
//   const [showTaskModal, setShowTaskModal] = useState(false);

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/tasks");
//       if (!res.ok) throw new Error("Failed to fetch");
//       const data = await res.json();
//       setTasks(data);
//     } catch (error) {
//       toast.error("Failed to load tasks");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
//     try {
//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ completed: !currentStatus }),
//       });

//       if (!res.ok) throw new Error("Failed to update");

//       setTasks(tasks.map(t => 
//         t.id === taskId ? { ...t, completed: !currentStatus } : t
//       ));
      
//       toast.success(!currentStatus ? "Task completed! 🎉" : "Task uncompleted");
//     } catch (error) {
//       toast.error("Failed to update task");
//     }
//   };

//   const deleteTask = async (taskId: string) => {
//     if (!confirm("Delete this task?")) return;

//     try {
//       const res = await fetch(`/api/tasks/${taskId}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) throw new Error("Failed to delete");

//       setTasks(tasks.filter(t => t.id !== taskId));
//       setShowTaskModal(false);
//       toast.success("Task deleted");
//     } catch (error) {
//       toast.error("Failed to delete task");
//     }
//   };

//   const getTasksForDate = (date: Date) => {
//     return tasks.filter(task => {
//       const taskDate = parseISO(task.dueDate);
//       return isSameDay(taskDate, date);
//     });
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case "HIGH": return "bg-red-100 text-red-700 border-red-200";
//       case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case "LOW": return "bg-green-100 text-green-700 border-green-200";
//       default: return "bg-gray-100 text-gray-700 border-gray-200";
//     }
//   };

//   const getCategoryIcon = (category: string) => {
//     switch (category) {
//       case "WORK": return "💼";
//       case "STUDY": return "📚";
//       case "PERSONAL": return "🏠";
//       default: return "📌";
//     }
//   };

//   const navigateDate = (direction: "prev" | "next") => {
//     const newDate = new Date(currentDate);
//     if (view === "month") {
//       newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
//     } else if (view === "week") {
//       newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
//     } else {
//       newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
//     }
//     setCurrentDate(newDate);
//   };

//   const goToToday = () => setCurrentDate(new Date());

//   const getViewTitle = () => {
//     if (view === "month") return format(currentDate, "MMMM yyyy");
//     if (view === "week") {
//       const start = startOfWeek(currentDate, { weekStartsOn: 1 });
//       const end = endOfWeek(currentDate, { weekStartsOn: 1 });
//       return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
//     }
//     return format(currentDate, "EEEE, MMMM d, yyyy");
//   };

//   // Group tasks by date for better performance
//   const tasksByDate = tasks.reduce((acc, task) => {
//     const dateStr = format(parseISO(task.dueDate), "yyyy-MM-dd");
//     if (!acc[dateStr]) {
//       acc[dateStr] = [];
//     }
//     acc[dateStr].push(task);
//     return acc;
//   }, {} as Record<string, Task[]>);

//   // Month View
//   const renderMonthView = () => {
//     const year = currentDate.getFullYear();
//     const month = currentDate.getMonth();
//     const firstDay = new Date(year, month, 1);
//     const lastDay = new Date(year, month + 1, 0);
    
//     // Start from Monday of the week containing the first day
//     const startDate = new Date(firstDay);
//     startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1));
    
//     // End on Sunday of the week containing the last day
//     const endDate = new Date(lastDay);
//     endDate.setDate(endDate.getDate() + (7 - endDate.getDay()) % 7);
    
//     const days = eachDayOfInterval({ start: startDate, end: endDate });

//     const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

//     return (
//       <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
//         {weekDays.map(day => (
//           <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
//             {day}
//           </div>
//         ))}
        
//         {days.map(day => {
//           const dateStr = format(day, "yyyy-MM-dd");
//           const dayTasks = tasksByDate[dateStr] || [];
//           const isCurrentMonth = isSameMonth(day, currentDate);
//           const isTodayDate = isToday(day);
//           const isPastDate = isPast(day) && !isTodayDate;
          
//           return (
//             <div
//               key={day.toISOString()}
//               className={`min-h-[120px] bg-white p-2 transition-all ${
//                 !isCurrentMonth ? "bg-gray-50/50" : ""
//               } ${isTodayDate ? "ring-2 ring-blue-200 ring-inset" : ""} ${
//                 isPastDate ? "opacity-60" : ""
//               }`}
//             >
//               <div className={`text-sm font-medium mb-1 ${
//                 isCurrentMonth ? "text-gray-900" : "text-gray-400"
//               } ${isTodayDate ? "text-blue-600 font-bold" : ""}`}>
//                 {format(day, "d")}
//               </div>
              
//               <div className="space-y-1 max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
//                 {dayTasks.slice(0, 4).map(task => (
//                   <button
//                     key={task.id}
//                     onClick={() => {
//                       setSelectedTask(task);
//                       setShowTaskModal(true);
//                     }}
//                     className={`w-full text-left text-xs p-1.5 rounded border ${getPriorityColor(task.priority)} ${
//                       task.completed ? "line-through opacity-60" : ""
//                     } hover:shadow-md transition-shadow group relative`}
//                   >
//                     <div className="flex items-center gap-1 truncate">
//                       {task.isRecurring && (
//                         <Repeat size={10} className="flex-shrink-0 text-gray-500" />
//                       )}
//                       <span className="truncate">
//                         {getCategoryIcon(task.category)} {task.title}
//                       </span>
//                     </div>
//                     {task.dueTime && (
//                       <div className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-0.5">
//                         <Clock size={8} />
//                         {task.dueTime}
//                       </div>
//                     )}
//                   </button>
//                 ))}
//                 {dayTasks.length > 4 && (
//                   <div className="text-xs text-gray-500 pl-1 font-medium">
//                     +{dayTasks.length - 4} more
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   // Week View
//   const renderWeekView = () => {
//     const start = startOfWeek(currentDate, { weekStartsOn: 1 });
//     const end = endOfWeek(currentDate, { weekStartsOn: 1 });
//     const days = eachDayOfInterval({ start, end });

//     return (
//       <div className="space-y-6">
//         {/* Day headers */}
//         <div className="grid grid-cols-7 gap-2 border-b border-gray-200 pb-4">
//           {days.map(day => (
//             <div key={day.toISOString()} className="text-center">
//               <div className="text-sm font-medium text-gray-600">{format(day, "EEE")}</div>
//               <div className={`text-2xl font-bold mt-1 ${
//                 isToday(day) ? "text-blue-600" : "text-gray-900"
//               }`}>
//                 {format(day, "d")}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Tasks grid */}
//         <div className="grid grid-cols-7 gap-2">
//           {days.map(day => {
//             const dateStr = format(day, "yyyy-MM-dd");
//             const dayTasks = tasksByDate[dateStr] || [];
            
//             return (
//               <div key={day.toISOString()} className="space-y-2 min-h-[400px]">
//                 {dayTasks.length === 0 ? (
//                   <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-lg">
//                     No tasks
//                   </div>
//                 ) : (
//                   dayTasks.map(task => (
//                     <button
//                       key={task.id}
//                       onClick={() => {
//                         setSelectedTask(task);
//                         setShowTaskModal(true);
//                       }}
//                       className={`w-full text-left p-3 rounded-lg border ${getPriorityColor(task.priority)} ${
//                         task.completed ? "opacity-60" : ""
//                       } hover:shadow-md transition-shadow`}
//                     >
//                       <div className="flex items-start gap-2">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             toggleTaskCompletion(task.id, task.completed);
//                           }}
//                           className="mt-0.5 flex-shrink-0"
//                         >
//                           {task.completed ? (
//                             <CheckCircle className="w-4 h-4 text-green-500" />
//                           ) : (
//                             <Circle className="w-4 h-4 text-gray-400" />
//                           )}
//                         </button>
                        
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-1">
//                             {task.isRecurring && (
//                               <Repeat size={12} className="text-gray-500 flex-shrink-0" />
//                             )}
//                             <span className={`text-sm font-medium truncate ${
//                               task.completed ? "line-through" : ""
//                             }`}>
//                               {task.title}
//                             </span>
//                           </div>
                          
//                           <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
//                             <span>{getCategoryIcon(task.category)}</span>
//                             {task.dueTime && (
//                               <span className="flex items-center gap-0.5">
//                                 <Clock size={10} />
//                                 {task.dueTime}
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </button>
//                   ))
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

//   // Day View
//   const renderDayView = () => {
//     const dateStr = format(currentDate, "yyyy-MM-dd");
//     const dayTasks = tasksByDate[dateStr] || [];
    
//     // Sort tasks: incomplete first, then by time, then by priority
//     const sortedTasks = [...dayTasks].sort((a, b) => {
//       // Completed tasks at the bottom
//       if (a.completed !== b.completed) {
//         return a.completed ? 1 : -1;
//       }
      
//       // Sort by time if available
//       if (a.dueTime && b.dueTime) {
//         return a.dueTime.localeCompare(b.dueTime);
//       }
//       if (a.dueTime) return -1;
//       if (b.dueTime) return 1;
      
//       // Then by priority
//       const priorityWeight = { HIGH: 0, MEDIUM: 1, LOW: 2 };
//       return (priorityWeight[a.priority as keyof typeof priorityWeight] || 3) - 
//              (priorityWeight[b.priority as keyof typeof priorityWeight] || 3);
//     });

//     // Group by time slot
//     const tasksByTime: Record<string, Task[]> = {};
//     const tasksWithoutTime: Task[] = [];
    
//     sortedTasks.forEach(task => {
//       if (task.dueTime) {
//         const hour = task.dueTime.split(':')[0];
//         if (!tasksByTime[hour]) {
//           tasksByTime[hour] = [];
//         }
//         tasksByTime[hour].push(task);
//       } else {
//         tasksWithoutTime.push(task);
//       }
//     });

//     // Generate time slots from 6 AM to 10 PM
//     const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

//     return (
//       <div className="space-y-6">
//         {/* Day header */}
//         <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
//           <div className="text-sm text-gray-600">{format(currentDate, "EEEE")}</div>
//           <div className="text-4xl font-bold text-gray-900 mt-2">{format(currentDate, "d")}</div>
//           <div className="text-sm text-gray-600 mt-1">{format(currentDate, "MMMM yyyy")}</div>
//         </div>

//         {/* Tasks timeline */}
//         <div className="space-y-4">
//           {/* Tasks without time */}
//           {tasksWithoutTime.length > 0 && (
//             <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//               <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
//                 <CalendarIcon size={16} />
//                 All Day
//               </h3>
//               <div className="space-y-2">
//                 {tasksWithoutTime.map(task => (
//                   <TaskCard
//                     key={task.id}
//                     task={task}
//                     onToggle={toggleTaskCompletion}
//                     onClick={setSelectedTask}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Time slots */}
//           {timeSlots.map(hour => {
//             const hourStr = hour.toString().padStart(2, '0');
//             const tasksInSlot = tasksByTime[hourStr] || [];
            
//             if (tasksInSlot.length === 0 && tasksWithoutTime.length === 0) return null;
            
//             return (
//               <div key={hour} className="flex gap-4">
//                 <div className="w-16 text-right">
//                   <span className="text-sm font-medium text-gray-600">
//                     {hour > 12 ? hour - 12 : hour}:00
//                     <span className="text-xs ml-1">{hour >= 12 ? 'PM' : 'AM'}</span>
//                   </span>
//                 </div>
//                 <div className="flex-1 space-y-2">
//                   {tasksInSlot.map(task => (
//                     <TaskCard
//                       key={task.id}
//                       task={task}
//                       onToggle={toggleTaskCompletion}
//                       onClick={setSelectedTask}
//                     />
//                   ))}
//                 </div>
//               </div>
//             );
//           })}

//           {sortedTasks.length === 0 && (
//             <div className="text-center py-12">
//               <div className="text-gray-400 mb-2">📅</div>
//               <div className="text-gray-500">No tasks for this day</div>
//               <button
//                 onClick={() => window.location.href = '/dashboard/add-task'}
//                 className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800"
//               >
//                 Add Task
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // Task Card Component
//   const TaskCard = ({ task, onToggle, onClick }: { 
//     task: Task; 
//     onToggle: (id: string, completed: boolean) => void;
//     onClick: (task: Task) => void;
//   }) => (
//     <button
//       onClick={() => onClick(task)}
//       className={`w-full p-4 rounded-lg border ${getPriorityColor(task.priority)} ${
//         task.completed ? "opacity-60" : ""
//       } hover:shadow-md transition-shadow group`}
//     >
//       <div className="flex items-start gap-3">
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onToggle(task.id, task.completed);
//           }}
//           className="mt-0.5 flex-shrink-0"
//         >
//           {task.completed ? (
//             <CheckCircle className="w-5 h-5 text-green-500" />
//           ) : (
//             <Circle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
//           )}
//         </button>
        
//         <div className="flex-1 text-left">
//           <div className="flex items-center gap-2">
//             {task.isRecurring && (
//               <Repeat size={14} className="text-gray-500" />
//             )}
//             <span className={`font-medium ${
//               task.completed ? "line-through text-gray-500" : "text-gray-900"
//             }`}>
//               {task.title}
//             </span>
//           </div>
          
//           <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
//             <span className="flex items-center gap-1 text-gray-600">
//               {getCategoryIcon(task.category)} {task.category}
//             </span>
            
//             {task.dueTime && (
//               <span className="flex items-center gap-1 text-gray-600">
//                 <Clock size={14} />
//                 {task.dueTime}
//               </span>
//             )}
            
//             {isPast(parseISO(task.dueDate)) && !task.completed && (
//               <span className="flex items-center gap-1 text-red-600">
//                 <AlertCircle size={14} />
//                 Overdue
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
//     </button>
//   );

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="animate-pulse space-y-4">
//           <div className="h-10 bg-gray-200 rounded w-48"></div>
//           <div className="h-96 bg-gray-100 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
//           <CalendarIcon className="w-6 h-6" />
//           Calendar
//         </h1>
        
//         <div className="flex items-center gap-2">
//           <button
//             onClick={goToToday}
//             className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
//           >
//             Today
//           </button>
          
//           <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
//             <button
//               onClick={() => setView("month")}
//               className={`px-3 py-1.5 text-sm rounded-md transition ${
//                 view === "month" ? "bg-white shadow-sm" : "hover:bg-white/50"
//               }`}
//             >
//               Month
//             </button>
//             <button
//               onClick={() => setView("week")}
//               className={`px-3 py-1.5 text-sm rounded-md transition ${
//                 view === "week" ? "bg-white shadow-sm" : "hover:bg-white/50"
//               }`}
//             >
//               Week
//             </button>
//             <button
//               onClick={() => setView("day")}
//               className={`px-3 py-1.5 text-sm rounded-md transition ${
//                 view === "day" ? "bg-white shadow-sm" : "hover:bg-white/50"
//               }`}
//             >
//               Day
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <div className="flex items-center justify-between mb-6">
//         <button
//           onClick={() => navigateDate("prev")}
//           className="p-2 hover:bg-gray-100 rounded-lg transition"
//         >
//           <ChevronLeft className="w-5 h-5" />
//         </button>
        
//         <h2 className="text-lg font-semibold text-gray-900">
//           {getViewTitle()}
//         </h2>
        
//         <button
//           onClick={() => navigateDate("next")}
//           className="p-2 hover:bg-gray-100 rounded-lg transition"
//         >
//           <ChevronRight className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Calendar Views */}
//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         {view === "month" && renderMonthView()}
//         {view === "week" && renderWeekView()}
//         {view === "day" && renderDayView()}
//       </div>

//       {/* Task Detail Modal */}
//       <AnimatePresence>
//         {showTaskModal && selectedTask && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//             onClick={() => setShowTaskModal(false)}
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-xl max-w-md w-full p-6"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <h3 className="text-lg font-semibold flex items-center gap-2">
//                   {selectedTask.isRecurring && <Repeat size={16} className="text-gray-500" />}
//                   {selectedTask.title}
//                 </h3>
//                 <button
//                   onClick={() => setShowTaskModal(false)}
//                   className="p-1 hover:bg-gray-100 rounded-lg"
//                 >
//                   <ChevronLeft size={20} />
//                 </button>
//               </div>
              
//               <div className="space-y-4 mb-6">
//                 <div className="flex items-center gap-2 text-sm">
//                   <CalendarIcon className="w-4 h-4 text-gray-400" />
//                   <span>{format(parseISO(selectedTask.dueDate), "MMMM d, yyyy")}</span>
//                   {selectedTask.dueTime && (
//                     <>
//                       <Clock className="w-4 h-4 text-gray-400 ml-2" />
//                       <span>{selectedTask.dueTime}</span>
//                     </>
//                   )}
//                 </div>
                
//                 <div className="flex flex-wrap gap-2">
//                   <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedTask.priority)}`}>
//                     {selectedTask.priority}
//                   </span>
//                   <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
//                     {getCategoryIcon(selectedTask.category)} {selectedTask.category}
//                   </span>
//                   {selectedTask.isRecurring && (
//                     <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
//                       <Repeat size={12} />
//                       {selectedTask.recurrenceType}
//                     </span>
//                   )}
//                 </div>

//                 {selectedTask.estimatedEffort && (
//                   <div className="text-sm">
//                     <span className="text-gray-500">Estimated effort:</span>{' '}
//                     <span className="font-medium">{selectedTask.estimatedEffort} min</span>
//                   </div>
//                 )}

//                 {selectedTask.recurrenceEndDate && (
//                   <div className="text-sm">
//                     <span className="text-gray-500">Recurs until:</span>{' '}
//                     <span className="font-medium">
//                       {format(parseISO(selectedTask.recurrenceEndDate), "MMMM d, yyyy")}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               <div className="flex flex-col sm:flex-row gap-2">
//                 <button
//                   onClick={() => {
//                     toggleTaskCompletion(selectedTask.id, selectedTask.completed);
//                     setShowTaskModal(false);
//                   }}
//                   className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
//                 >
//                   {selectedTask.completed ? "Mark Incomplete" : "Mark Complete"}
//                 </button>
                
//                 <button
//                   onClick={() => {
//                     deleteTask(selectedTask.id);
//                   }}
//                   className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

/* eslint-disable react-hooks/set-state-in-effect */
// app/dashboard/calendar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isToday, isPast, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  Circle,
  AlertCircle,
  Clock,
  Repeat, // Add this import
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
  recurrenceType?: string; // Add this
  recurrenceEndDate?: string; // Add this
  parentTaskId?: string | null; // Add this
}

type ViewType = "month" | "week" | "day";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      console.log(data)
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, completed: !currentStatus } : t
      ));
      
      toast.success(!currentStatus ? "Task completed! 🎉" : "Task uncompleted");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setTasks(tasks.filter(t => t.id !== taskId));
      setShowTaskModal(false);
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  // Optimized task filtering using object lookup
  const tasksByDate = tasks.reduce((acc, task) => {
    const dateStr = format(parseISO(task.dueDate), "yyyy-MM-dd");
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return tasksByDate[dateStr] || [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "LOW": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "WORK": return "💼";
      case "STUDY": return "📚";
      case "PERSONAL": return "🏠";
      default: return "📌";
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const getViewTitle = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  // Month View
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay() + (startDate.getDay() === 0 ? -6 : 1));
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()) % 7);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
          <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isPastDate = isPast(day) && !isTodayDate;
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] bg-white p-2 ${
                !isCurrentMonth ? "bg-gray-50" : ""
              } ${isTodayDate ? "ring-2 ring-blue-200" : ""} ${
                isPastDate ? "opacity-60" : ""
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? "text-gray-900" : "text-gray-400"
              } ${isTodayDate ? "text-blue-600 font-bold" : ""}`}>
                {format(day, "d")}
              </div>
              
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                    className={`w-full text-left text-xs p-1 rounded border ${getPriorityColor(task.priority)} ${
                      task.completed ? "line-through opacity-60" : ""
                    } hover:shadow-sm transition-shadow`}
                  >
                    <div className="flex items-center gap-1 truncate">
                      {task.isRecurring && (
                        <Repeat size={10} className="flex-shrink-0 text-gray-500" />
                      )}
                      <span className="truncate">
                        {getCategoryIcon(task.category)} {task.title}
                      </span>
                    </div>
                    {task.dueTime && (
                      <div className="text-[10px] text-gray-600 mt-0.5 flex items-center gap-0.5">
                        <Clock size={8} />
                        {task.dueTime}
                      </div>
                    )}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 pl-1">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => (
            <div key={day.toISOString()} className="text-center">
              <div className="text-sm font-medium text-gray-600">{format(day, "EEE")}</div>
              <div className={`text-lg font-semibold mt-1 ${
                isToday(day) ? "text-blue-600" : "text-gray-900"
              }`}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            
            return (
              <div key={day.toISOString()} className="space-y-2 min-h-[300px]">
                {dayTasks.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-lg">
                    No tasks
                  </div>
                ) : (
                  dayTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskModal(true);
                      }}
                      className={`w-full text-left p-2 rounded-lg border ${getPriorityColor(task.priority)} ${
                        task.completed ? "opacity-60" : ""
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskCompletion(task.id, task.completed);
                          }}
                          className="mt-0.5 flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Circle className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {task.isRecurring && (
                              <Repeat size={10} className="text-gray-500 flex-shrink-0" />
                            )}
                            <span className={`text-sm font-medium truncate ${
                              task.completed ? "line-through" : ""
                            }`}>
                              {task.title}
                            </span>
                          </div>
                          {task.dueTime && (
                            <div className="text-xs text-gray-600 mt-1 flex items-center gap-0.5">
                              <Clock size={10} />
                              {task.dueTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const sortedTasks = [...dayTasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      if (!a.dueTime && !b.dueTime) return 0;
      if (!a.dueTime) return 1;
      if (!b.dueTime) return -1;
      return a.dueTime.localeCompare(b.dueTime);
    });

    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">{format(currentDate, "EEEE")}</div>
          <div className="text-3xl font-bold text-gray-900">{format(currentDate, "d")}</div>
          <div className="text-sm text-gray-600">{format(currentDate, "MMMM yyyy")}</div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {sortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No tasks for this day
            </div>
          ) : (
            sortedTasks.map(task => (
              <button
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setShowTaskModal(true);
                }}
                className={`w-full p-4 rounded-lg border ${getPriorityColor(task.priority)} ${
                  task.completed ? "opacity-60" : ""
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(task.id, task.completed);
                    }}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      {task.isRecurring && (
                        <Repeat size={14} className="text-gray-500" />
                      )}
                      <span className={`text-lg font-medium ${
                        task.completed ? "line-through text-gray-500" : "text-gray-900"
                      }`}>
                        {task.title}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        {getCategoryIcon(task.category)} {task.category}
                      </span>
                      {task.dueTime && (
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock size={14} />
                          {task.dueTime}
                        </span>
                      )}
                      {isPast(parseISO(task.dueDate)) && !task.completed && (
                        <span className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle size={14} /> Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          Calendar
        </h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Today
          </button>
          
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                view === "month" ? "bg-white shadow-sm" : "hover:bg-white/50"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                view === "week" ? "bg-white shadow-sm" : "hover:bg-white/50"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                view === "day" ? "bg-white shadow-sm" : "hover:bg-white/50"
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateDate("prev")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-900">
          {getViewTitle()}
        </h2>
        
        <button
          onClick={() => navigateDate("next")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Views */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {showTaskModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {selectedTask.isRecurring && (
                    <Repeat size={16} className="text-gray-500" />
                  )}
                  {selectedTask.title}
                </h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>{format(parseISO(selectedTask.dueDate), "MMMM d, yyyy")}</span>
                  {selectedTask.dueTime && (
                    <>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span>{selectedTask.dueTime}</span>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                    {getCategoryIcon(selectedTask.category)} {selectedTask.category}
                  </span>
                  {selectedTask.isRecurring && selectedTask.recurrenceType && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                      <Repeat size={12} />
                      {selectedTask.recurrenceType}
                    </span>
                  )}
                </div>

                {selectedTask.estimatedEffort && (
                  <div className="text-sm">
                    <span className="text-gray-500">Estimated effort:</span>{' '}
                    <span className="font-medium">{selectedTask.estimatedEffort} min</span>
                  </div>
                )}

                {selectedTask.recurrenceEndDate && (
                  <div className="text-sm">
                    <span className="text-gray-500">Recurs until:</span>{' '}
                    <span className="font-medium">
                      {format(parseISO(selectedTask.recurrenceEndDate), "MMMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    toggleTaskCompletion(selectedTask.id, selectedTask.completed);
                    setShowTaskModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
                >
                  {selectedTask.completed ? "Mark Incomplete" : "Mark Complete"}
                </button>
                
                <button
                  onClick={() => deleteTask(selectedTask.id)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}