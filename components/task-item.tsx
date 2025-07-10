"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Trash2, Edit3, Star, Calendar, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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

interface TaskItemProps {
  task: Task
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  onToggleImportant: (id: number) => void
  onUpdate: (id: number, updates: Partial<Task>) => void
}

export default function TaskItem({ task, onToggle, onDelete, onToggleImportant, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onUpdate(task.id, { text: editText.trim() })
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(task.text)
    setIsEditing(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flag className="h-3 w-3" />
      case "medium":
        return <Flag className="h-3 w-3" />
      case "low":
        return <Flag className="h-3 w-3" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  return (
    <div
      className={cn(
        "group p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
        task.completed ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-gray-200 hover:border-indigo-200",
        isOverdue && "border-red-200 bg-red-50",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Completion Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(task.id)}
          className={cn(
            "p-0 h-6 w-6 rounded-full hover:bg-transparent",
            task.completed ? "text-green-500" : "text-gray-400 hover:text-green-500",
          )}
        >
          {task.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
        </Button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex gap-2 mb-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit()
                  if (e.key === "Escape") handleCancelEdit()
                }}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="mb-2">
              <p className={cn("text-sm font-medium leading-relaxed", task.completed && "line-through text-gray-500")}>
                {task.text}
              </p>
            </div>
          )}

          {/* Task Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Category */}
            {task.category && (
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {task.category}
              </Badge>
            )}

            {/* Priority */}
            <Badge className={cn("border", getPriorityColor(task.priority))}>
              {getPriorityIcon(task.priority)}
              <span className="ml-1 capitalize">{task.priority}</span>
            </Badge>

            {/* Due Date */}
            {task.dueDate && (
              <Badge
                className={cn(
                  "border",
                  isOverdue ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200",
                )}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}

            {/* Created Date */}
            <span className="text-gray-500">Created {formatDate(task.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleImportant(task.id)}
            className={cn(
              "p-1 h-8 w-8",
              task.important ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500",
            )}
          >
            <Star className={cn("h-4 w-4", task.important && "fill-current")} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="p-1 h-8 w-8 text-gray-400 hover:text-blue-500"
          >
            <Edit3 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="p-1 h-8 w-8 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
