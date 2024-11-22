"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { TaskTemplate } from "@/lib/types/task";

const taskTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  estimatedHours: z.number().min(0).optional(),
  checklist: z.array(z.object({
    text: z.string(),
    required: z.boolean(),
  })).optional().or(z.string()).nullable(),
});

type TaskTemplateFormValues = z.infer<typeof taskTemplateSchema>;

interface NewTaskTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: TaskTemplate | null;
  onTemplateSaved: (template: TaskTemplate) => void;
}

const categories = [
  "Investigation",
  "Analysis",
  "Documentation",
  "Evidence Processing",
  "Quality Control",
  "Other",
];

export function NewTaskTemplateDialog({
  open,
  onOpenChange,
  template,
  onTemplateSaved,
}: NewTaskTemplateDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskTemplateFormValues>({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      category: template?.category || "",
      estimatedHours: template?.estimatedHours || undefined,
      checklist: template?.checklist || [],
    },
  });

  const onSubmit = async (data: TaskTemplateFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(
        template
          ? `/api/settings/task-templates/${template.id}`
          : "/api/settings/task-templates",
        {
          method: template ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Failed to save template");

      const savedTemplate = await response.json();
      onTemplateSaved(savedTemplate);
      toast({
        title: "Success",
        description: `Template ${template ? "updated" : "added"} successfully`,
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: `Failed to ${template ? "update" : "add"} template`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Task Template" : "Add Task Template"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Estimated Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={value || ""}
                      onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : template ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
