"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface Task {
  text: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: string
  dueDate?: string
  important: boolean
}

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (task: Task) => void
  existingCategories: string[]
}

export default function AddTaskModal({ isOpen, onClose, onAdd, existingCategories }: AddTaskModalProps) {
  const [formData, setFormData] = useState<Task>({
    text: "",
    completed: false,
    priority: "medium",
    category: "",
    dueDate: "",
    important: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.text.trim()) {
      onAdd({
        ...formData,
        text: formData.text.trim(),
        dueDate: formData.dueDate || undefined,
      })
      setFormData({
        text: "",
        completed: false,
        priority: "medium",
        category: "",
        dueDate: "",
        important: false,
      })
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      text: "",
      completed: false,
      priority: "medium",
      category: "",
      dueDate: "",
      important: false,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Text */}
          <div className="space-y-2">
            <Label htmlFor="task-text">Task Description</Label>
            <Textarea
              id="task-text"
              placeholder="What needs to be done?"
              value={formData.text}
              onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
              className="resize-none"
              rows={3}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select or create category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  {existingCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="New category"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="flex-1"
              />
            </div>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Important Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="important" className="text-sm font-medium">
              Mark as Important
            </Label>
            <Switch
              id="important"
              checked={formData.important}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, important: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
