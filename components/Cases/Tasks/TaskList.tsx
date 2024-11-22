"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { NewTaskDialog } from "./NewTaskDialog"
import { TaskTemplateSelectionDialog } from "./TaskTemplateSelectionDialog"
import { TaskCard } from "./TaskCard"
import { EditTaskDialog } from "./EditTaskDialog"
import type { Task } from "@/lib/types/task"

interface TaskListProps {
  caseId: number
}

export function TaskList({ caseId }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
  }, [caseId])

  async function loadTasks() {
    try {
      const response = await fetch(`/api/cases/${caseId}/tasks`)
      if (!response.ok) {
        throw new Error('Failed to load tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error loading tasks:', error)
      setError(error instanceof Error ? error.message : 'Failed to load tasks')
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask])
    setShowNewTaskDialog(false)
    toast({
      title: "Success",
      description: "Task created successfully",
    })
  }

  const handleTasksAdded = (newTasks: Task[]) => {
    setTasks([...tasks, ...newTasks])
    setShowTemplateDialog(false)
    toast({
      title: "Success",
      description: `Added ${newTasks.length} tasks successfully`,
    })
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t))
    toast({
      title: "Success",
      description: "Task updated successfully",
    })
  }

  const handleTaskDeleted = (taskId: number) => {
    setTasks(tasks.filter(t => t.id !== taskId))
    toast({
      title: "Success",
      description: "Task deleted successfully",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={loadTasks}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tasks</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowTemplateDialog(true)} variant="outline">
            <Users className="h-4 w-4 mr-2" />
            User Tasks
          </Button>
          <Button onClick={() => setShowNewTaskDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            caseId={caseId}
            onTaskUpdated={handleTaskUpdated}
            onTaskDeleted={handleTaskDeleted}
            onEdit={(task) => setEditingTask(task)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found. Create a new task or add from templates.
          </div>
        )}
      </div>

      <NewTaskDialog
        open={showNewTaskDialog}
        onOpenChange={setShowNewTaskDialog}
        caseId={caseId}
        onTaskCreated={handleTaskCreated}
      />

      <TaskTemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        caseId={caseId}
        onTasksAdded={handleTasksAdded}
      />

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={true}
          onOpenChange={(open) => !open && setEditingTask(null)}
          caseId={caseId}
          onTaskUpdated={(updatedTask) => {
            handleTaskUpdated(updatedTask)
            setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
