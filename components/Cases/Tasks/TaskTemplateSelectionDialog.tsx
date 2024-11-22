"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useOrganizationUsers } from "@/app/hooks/useOrganizationUsers";
import type { TaskTemplate } from "@/lib/types/task";

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface TaskTemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: number;
  onTasksAdded: (tasks: any[]) => void;
}

interface TemplateSelection {
  templateId: number;
  assignedUserId?: number;
}

export function TaskTemplateSelectionDialog({
  open,
  onOpenChange,
  caseId,
  onTasksAdded,
}: TaskTemplateSelectionDialogProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateSelection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { orgUsers, isLoading: usersLoading } = useOrganizationUsers();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/settings/task-templates");
      if (!response.ok) throw new Error("Failed to fetch task templates");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching task templates:", error);
      toast({
        title: "Error",
        description: "Failed to load task templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateSelection = (templateId: number) => {
    setSelectedTemplates((prev) =>
      prev.some((t) => t.templateId === templateId)
        ? prev.filter((t) => t.templateId !== templateId)
        : [...prev, { templateId }]
    );
  };

  const updateAssignedUser = (templateId: number, userId: number) => {
    setSelectedTemplates((prev) =>
      prev.map((t) =>
        t.templateId === templateId
          ? { ...t, assignedUserId: userId }
          : t
      )
    );
  };

  const handleAddTasks = async () => {
    if (selectedTemplates.length === 0) {
      toast({
        title: "Warning",
        description: "Please select at least one template",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedTemplatesToAdd = templates.filter((template) =>
        selectedTemplates.some((st) => st.templateId === template.id)
      );

      const tasks = await Promise.all(
        selectedTemplatesToAdd.map(async (template) => {
          const selection = selectedTemplates.find(
            (st) => st.templateId === template.id
          );
          const response = await fetch(`/api/cases/${caseId}/tasks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: template.name,
              description: template.description,
              estimatedHours: template.estimatedHours,
              checklist: template.checklist,
              status: "Pending",
              priority: "Medium",
              assigned_to: selection?.assignedUserId,
            }),
          });

          if (!response.ok) throw new Error("Failed to create task");
          return response.json();
        })
      );

      onTasksAdded(tasks);
      toast({
        title: "Success",
        description: `Added ${tasks.length} tasks successfully`,
      });
      onOpenChange(false);
      setSelectedTemplates([]);
    } catch (error) {
      console.error("Error adding tasks:", error);
      toast({
        title: "Error",
        description: "Failed to add tasks",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Task Templates</DialogTitle>
        </DialogHeader>

        {loading || usersLoading ? (
          <div className="flex justify-center items-center h-32">Loading...</div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Estimated Hours</TableHead>
                  <TableHead>Checklist Items</TableHead>
                  <TableHead>Assign To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => {
                  const isSelected = selectedTemplates.some(
                    (t) => t.templateId === template.id
                  );
                  const selection = selectedTemplates.find(
                    (t) => t.templateId === template.id
                  );

                  return (
                    <TableRow
                      key={template.id}
                      className={isSelected ? "bg-muted/50" : undefined}
                      onClick={() => toggleTemplateSelection(template.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTemplateSelection(template.id)}
                        />
                      </TableCell>
                      <TableCell>{template.name}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>{template.description}</TableCell>
                      <TableCell>{template.estimatedHours || "N/A"}</TableCell>
                      <TableCell>
                        {Array.isArray(template.checklist)
                          ? template.checklist.length
                          : typeof template.checklist === "string"
                          ? JSON.parse(template.checklist).length
                          : 0}{" "}
                        items
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {isSelected && orgUsers?.users && (
                          <Select
                            value={selection?.assignedUserId?.toString()}
                            onValueChange={(value) =>
                              updateAssignedUser(template.id, parseInt(value))
                            }
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {orgUsers.users.map((user: User) => (
                                <SelectItem
                                  key={user.id}
                                  value={user.id.toString()}
                                >
                                  {user.name || user.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {templates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No templates found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddTasks}>
            Add Selected Tasks ({selectedTemplates.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
