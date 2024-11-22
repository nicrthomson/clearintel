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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { QAChecklistItem } from "@/types/qa";

const checklistItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  required: z.boolean(),
  order: z.number().int().min(0),
});

type ChecklistItemFormValues = z.infer<typeof checklistItemSchema>;

interface NewQAChecklistItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: QAChecklistItem | null;
  onItemSaved: (item: QAChecklistItem) => void;
}

const categories = [
  "Evidence",
  "Case",
  "Equipment",
  "Documentation",
  "Analysis",
  "Report",
  "Other",
];

export function NewQAChecklistItemDialog({
  open,
  onOpenChange,
  item,
  onItemSaved,
}: NewQAChecklistItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ChecklistItemFormValues>({
    resolver: zodResolver(checklistItemSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      category: item?.category || "",
      required: item?.required || false,
      order: item?.order || 0,
    },
  });

  const onSubmit = async (data: ChecklistItemFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(
        item
          ? `/api/settings/qa-checklist/${item.id}`
          : "/api/settings/qa-checklist",
        {
          method: item ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Failed to save checklist item");

      const savedItem = await response.json();
      onItemSaved(savedItem);
      toast({
        title: "Success",
        description: `Checklist item ${item ? "updated" : "added"} successfully`,
      });
    } catch (error) {
      console.error("Error saving checklist item:", error);
      toast({
        title: "Error",
        description: `Failed to ${item ? "update" : "add"} checklist item`,
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
            {item ? "Edit Checklist Item" : "Add Checklist Item"}
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
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Required</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={value}
                      onChange={(e) => onChange(parseInt(e.target.value))}
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
                {loading ? "Saving..." : item ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
