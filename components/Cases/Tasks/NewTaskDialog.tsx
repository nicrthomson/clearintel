"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface NewTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: number
  onTaskCreated: (task: any) => void
}

export function NewTaskDialog({
  open,
  onOpenChange,
  caseId,
  onTaskCreated,
}: NewTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    estimatedHours: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/cases/${caseId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const task = await response.json()
      onTaskCreated(task)
      toast({
        title: "Task Created",
        description: "The new task has been created successfully.",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create the task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              min="0"
              value={formData.estimatedHours}
              onChange={(e) =>
                setFormData({ ...formData, estimatedHours: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
