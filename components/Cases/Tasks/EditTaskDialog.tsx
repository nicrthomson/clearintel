"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useOrganizationUsers } from "@/app/hooks/useOrganizationUsers";
import type { Task } from "@/lib/types/task";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: number;
  onTaskUpdated: (task: Task) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  caseId,
  onTaskUpdated,
}: EditTaskDialogProps) {
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description || "",
    priority: task.priority,
    estimatedHours: task.estimatedHours || "",
    actualHours: task.actualHours || "",
    dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    assigned_to: task.assignedTo?.id || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { orgUsers } = useOrganizationUsers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          estimatedHours: formData.estimatedHours
            ? parseInt(formData.estimatedHours.toString())
            : null,
          actualHours: formData.actualHours
            ? parseInt(formData.actualHours.toString())
            : null,
          assigned_to: formData.assigned_to
            ? parseInt(formData.assigned_to.toString())
            : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      const updatedTask = await response.json();
      onTaskUpdated(updatedTask);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    field: string,
    value: string | number | null | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assign To</Label>
              <Select
                value={formData.assigned_to?.toString()}
                onValueChange={(value) => handleChange("assigned_to", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
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

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => handleChange("estimatedHours", e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualHours">Actual Hours</Label>
              <Input
                id="actualHours"
                type="number"
                value={formData.actualHours}
                onChange={(e) => handleChange("actualHours", e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
