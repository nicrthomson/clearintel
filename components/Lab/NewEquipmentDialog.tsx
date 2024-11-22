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
import type { Equipment } from "@/lib/db/types";

const equipmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  serialNumber: z.string().nullable(),
  status: z.string().min(1, "Status is required"),
  location: z.string().nullable(),
  lastCalibration: z.string().nullable(),
  nextCalibration: z.string().nullable(),
  lastMaintenance: z.string().nullable(),
  nextMaintenance: z.string().nullable(),
  notes: z.string().nullable(),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

interface NewEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment?: Equipment | null;
  onEquipmentSaved: (equipment: Equipment) => void;
}

const equipmentTypes = [
  "Workstation",
  "Write Blocker",
  "Imaging Device",
  "Mobile Device Reader",
  "Network Equipment",
  "Storage Device",
  "Other",
];

const equipmentStatuses = [
  "Available",
  "In Use",
  "Maintenance",
  "Calibration",
  "Out of Service",
];

export function NewEquipmentDialog({
  open,
  onOpenChange,
  equipment,
  onEquipmentSaved,
}: NewEquipmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: equipment?.name || "",
      type: equipment?.type || "",
      serialNumber: equipment?.serialNumber || null,
      status: equipment?.status || "Available",
      location: equipment?.location || null,
      lastCalibration: equipment?.lastCalibration ? new Date(equipment.lastCalibration).toISOString().split('T')[0] : null,
      nextCalibration: equipment?.nextCalibration ? new Date(equipment.nextCalibration).toISOString().split('T')[0] : null,
      lastMaintenance: equipment?.lastMaintenance ? new Date(equipment.lastMaintenance).toISOString().split('T')[0] : null,
      nextMaintenance: equipment?.nextMaintenance ? new Date(equipment.nextMaintenance).toISOString().split('T')[0] : null,
      notes: equipment?.notes || null,
    },
  });

  const onSubmit = async (data: EquipmentFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(
        equipment
          ? `/api/lab/equipment/${equipment.id}`
          : "/api/lab/equipment",
        {
          method: equipment ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error("Failed to save equipment");

      const savedEquipment = await response.json();
      onEquipmentSaved(savedEquipment);
      toast({
        title: "Success",
        description: `Equipment ${equipment ? "updated" : "added"} successfully`,
      });
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast({
        title: "Error",
        description: `Failed to ${equipment ? "update" : "add"} equipment`,
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
            {equipment ? "Edit Equipment" : "Add Equipment"}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
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
              name="serialNumber"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {equipmentStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
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
              name="location"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} value={value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lastCalibration"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Last Calibration</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextCalibration"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Next Calibration</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastMaintenance"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Last Maintenance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextMaintenance"
                render={({ field: { value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Next Maintenance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={value || ""} />
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
                {loading ? "Saving..." : equipment ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
