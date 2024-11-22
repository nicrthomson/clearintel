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
import { NewEquipmentDialog } from "@/components/Lab/NewEquipmentDialog";
import { formatDate } from "@/lib/utils";
import type { Equipment as EquipmentType } from "@/lib/db/types";

export function Equipment() {
  const [equipment, setEquipment] = useState<EquipmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
  const { toast } = useToast();

  const fetchEquipment = async () => {
    try {
      const response = await fetch("/api/lab/equipment");
      if (!response.ok) throw new Error("Failed to fetch equipment");
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const response = await fetch(`/api/lab/equipment/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete equipment");
      
      setEquipment(equipment.filter((eq) => eq.id !== id));
      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (equipment: EquipmentType) => {
    setEditingEquipment(equipment);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingEquipment(null);
    setDialogOpen(false);
  };

  const handleEquipmentSaved = (savedEquipment: EquipmentType) => {
    if (editingEquipment) {
      setEquipment(
        equipment.map((eq) =>
          eq.id === savedEquipment.id ? savedEquipment : eq
        )
      );
    } else {
      setEquipment([savedEquipment, ...equipment]);
    }
    handleDialogClose();
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Equipment</h2>
        <Button onClick={() => setDialogOpen(true)}>Add Equipment</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Next Calibration</TableHead>
              <TableHead>Next Maintenance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((eq) => (
              <TableRow key={eq.id}>
                <TableCell>{eq.name}</TableCell>
                <TableCell>{eq.type}</TableCell>
                <TableCell>{eq.serialNumber}</TableCell>
                <TableCell>{eq.status}</TableCell>
                <TableCell>{eq.location}</TableCell>
                <TableCell>
                  {eq.nextCalibration ? formatDate(eq.nextCalibration) : "N/A"}
                </TableCell>
                <TableCell>
                  {eq.nextMaintenance ? formatDate(eq.nextMaintenance) : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(eq)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(eq.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {equipment.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No equipment found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NewEquipmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        equipment={editingEquipment}
        onEquipmentSaved={handleEquipmentSaved}
      />
    </div>
  );
}
