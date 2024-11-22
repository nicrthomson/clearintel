"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewTaskTemplateDialog } from "./NewTaskTemplateDialog";
import type { TaskTemplate } from "@/lib/types/task";

// Helper function to safely parse JSON
const safeJsonParse = (jsonString: string | null) => {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return [];
  }
};

export function TaskTemplates() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const { toast } = useToast();

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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`/api/settings/task-templates/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");
      
      setTemplates(templates.filter((template) => template.id !== id));
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingTemplate(null);
    setDialogOpen(false);
  };

  const handleTemplateSaved = (savedTemplate: TaskTemplate) => {
    if (editingTemplate) {
      setTemplates(
        templates.map((template) =>
          template.id === savedTemplate.id ? savedTemplate : template
        )
      );
    } else {
      setTemplates([savedTemplate, ...templates]);
    }
    handleDialogClose();
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Task Templates</h2>
        <Button onClick={() => setDialogOpen(true)}>Add Template</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Estimated Hours</TableHead>
              <TableHead>Checklist Items</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.category}</TableCell>
                <TableCell>{template.description}</TableCell>
                <TableCell>{template.estimatedHours || "N/A"}</TableCell>
                <TableCell>
                  {Array.isArray(template.checklist) 
                    ? template.checklist.length 
                    : safeJsonParse(template.checklist).length} items
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {templates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No templates found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewTaskTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onTemplateSaved={handleTemplateSaved}
      />
    </div>
  );
}
