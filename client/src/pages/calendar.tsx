
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  date: string;
  color: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('calendar_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [
      { id: 1, title: "Physics Quiz", date: "2024-12-15", color: "bg-blue-500" },
      { id: 2, title: "Chemistry Lab", date: "2024-12-18", color: "bg-green-500" },
      { id: 3, title: "Biology Review", date: "2024-12-20", color: "bg-purple-500" },
    ];
  });

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Fill remaining slots
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasTask = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.some(task => task.date === dateStr);
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateStr);
  };

  const handleAddTask = () => {
    if (!taskTitle.trim() || !selectedDate) return;

    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500", "bg-pink-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newTask: Task = {
      id: Date.now(),
      title: taskTitle,
      date: selectedDate.toISOString().split('T')[0],
      color: randomColor
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('calendar_tasks', JSON.stringify(updatedTasks));
    setTaskTitle("");
    setShowTaskModal(false);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowTaskModal(true);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-[#18181b] text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Study Calendar</h1>
            <p className="text-gray-400">Plan and track your study schedule</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedDate(new Date());
              setShowTaskModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Calendar Card */}
        <Card className="bg-[#27272a] border-gray-800 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("prev")}
                  className="w-10 h-10 p-0 hover:bg-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  className="w-10 h-10 p-0 hover:bg-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-bold text-gray-300 py-3">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayData, index) => {
                const { date, isCurrentMonth } = dayData;
                const dayTasks = getTasksForDate(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "aspect-square p-2 rounded-xl cursor-pointer transition-all duration-200 relative text-sm font-semibold",
                      "hover:bg-gray-700 hover:scale-105",
                      !isCurrentMonth && "text-gray-600",
                      isCurrentMonth && "text-white",
                      isToday(date) && "bg-blue-600 border-2 border-blue-400",
                    )}
                  >
                    <div className="relative">
                      {date.getDate()}
                      {hasTask(date) && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {dayTasks.slice(0, 3).map((task, i) => (
                            <div
                              key={i}
                              className={cn("w-1.5 h-1.5 rounded-full", task.color)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 text-xs mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-300 font-medium">Physics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-300 font-medium">Chemistry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-gray-300 font-medium">Biology</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-[#27272a] border-gray-800 w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
                  Add Task
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTaskModal(false)}
                  className="w-8 h-8 p-0 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="task-title" className="text-sm font-medium text-gray-300">
                    Task Title
                  </Label>
                  <Input
                    id="task-title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    className="mt-1 bg-[#18181b] border-gray-700 text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-300">
                    Selected Date
                  </Label>
                  <div className="mt-1 p-3 bg-[#18181b] rounded-md border border-gray-700 text-white font-medium">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleAddTask}
                    disabled={!taskTitle.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 font-bold"
                  >
                    Add Task
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today's Tasks */}
        <Card className="bg-[#27272a] border-gray-800 shadow-2xl mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Today's Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTasksForDate(new Date()).length > 0 ? (
                getTasksForDate(new Date()).map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 rounded-lg bg-[#18181b] border border-gray-700">
                    <div className={cn("w-1 h-12 rounded-full", task.color)}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-sm text-gray-400">Today</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-500 font-bold">
                        Start
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-red-600 hover:bg-red-500 text-white border-red-600"
                        onClick={() => {
                          const updatedTasks = tasks.filter(t => t.id !== task.id);
                          setTasks(updatedTasks);
                          localStorage.setItem('calendar_tasks', JSON.stringify(updatedTasks));
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tasks scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
