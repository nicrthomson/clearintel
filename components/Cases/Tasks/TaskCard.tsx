"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreVertical,
  Clock,
  Calendar,
  Trash2,
  Edit,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizationUsers } from "@/app/hooks/useOrganizationUsers";
import type { Task } from "@/lib/types/task";

interface TaskCardProps {
  task: Task;
  caseId: number;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: number) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({
  task,
  caseId,
  onTaskUpdated,
  onTaskDeleted,
  onEdit,
}: TaskCardProps) {
  const { toast } = useToast();
  const { orgUsers } = useOrganizationUsers();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update task status");

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssigneeChange = async (userId: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assigned_to: parseInt(userId) }),
      });

      if (!response.ok) throw new Error("Failed to update task assignee");

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      toast({
        title: "Success",
        description: "Task assignee updated successfully",
      });
    } catch (error) {
      console.error("Error updating task assignee:", error);
      toast({
        title: "Error",
        description: "Failed to update task assignee",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      onTaskDeleted(task.id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChecklistItemToggle = async (itemId: number) => {
    if (!task.checklist) return;

    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checklist: updatedChecklist }),
      });

      if (!response.ok) throw new Error("Failed to update checklist");

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
    } catch (error) {
      console.error("Error updating checklist:", error);
      toast({
        title: "Error",
        description: "Failed to update checklist",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  function getPriorityColor(priority: string) {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  }

  return (
    <Card className={`p-4 ${isUpdating ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium">{task.name}</h3>
            <span className={`text-sm ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={task.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isUpdating}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
        {task.dueDate && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {task.estimatedHours && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Est: {task.estimatedHours}h</span>
          </div>
        )}
        {task.actualHours !== null && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>Actual: {task.actualHours}h</span>
          </div>
        )}
        <div className="flex items-center">
          <User className="h-4 w-4 mr-1" />
          <Select
            value={task.assignedTo?.id?.toString()}
            onValueChange={handleAssigneeChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {orgUsers?.users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {task.checklist && task.checklist.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>
              {task.checklist.filter((item) => item.completed).length}/
              {task.checklist.length} tasks
            </span>
          </div>
          <Progress
            value={
              (task.checklist.filter((item) => item.completed).length /
                task.checklist.length) *
              100
            }
          />
          <div className="space-y-1 mt-2">
            {task.checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleChecklistItemToggle(item.id)}
                  disabled={isUpdating}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className={item.completed ? "line-through" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
