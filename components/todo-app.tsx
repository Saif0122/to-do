"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TaskItem from "./task-item"
import TaskStats from "./task-stats"
import AddTaskModal from "./add-task-modal"

interface Task {
  id: number
  text: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: string
  dueDate?: string
  createdAt: string
  important: boolean
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("modernTodoTasks")
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("modernTodoTasks", JSON.stringify(tasks))
  }, [tasks])

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const toggleImportant = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, important: !task.important } : task)))
  }

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  // Filter tasks based on search term, category, and active tab
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || task.category === filterCategory

    let matchesTab = true
    switch (activeTab) {
      case "active":
        matchesTab = !task.completed
        break
      case "completed":
        matchesTab = task.completed
        break
      case "important":
        matchesTab = task.important
        break
    }

    return matchesSearch && matchesCategory && matchesTab
  })

  const categories = Array.from(new Set(tasks.map((task) => task.category))).filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Tasks
        </h1>
        <p className="text-gray-600">Stay organized and productive</p>
      </div>

      {/* Stats */}
      <TaskStats tasks={tasks} />

      {/* Main Content */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-1 gap-2 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[140px] border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Task Button */}
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">
                All ({tasks.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="data-[state=active]:bg-white">
                Active ({tasks.filter((t) => !t.completed).length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                Done ({tasks.filter((t) => t.completed).length})
              </TabsTrigger>
              <TabsTrigger value="important" className="data-[state=active]:bg-white">
                Important ({tasks.filter((t) => t.important).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {/* Tasks List */}
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || filterCategory !== "all" ? "No matching tasks" : "No tasks yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || filterCategory !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Add your first task to get started!"}
                    </p>
                    {!searchTerm && filterCategory === "all" && (
                      <Button
                        onClick={() => setIsAddModalOpen(true)}
                        variant="outline"
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Task
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                      onToggleImportant={toggleImportant}
                      onUpdate={updateTask}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addTask}
        existingCategories={categories}
      />
    </div>
  )
}
