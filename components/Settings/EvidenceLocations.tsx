"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Plus, Grip, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface EvidenceLocation {
  id: number
  name: string
  description: string | null
  isDefault: boolean
  order: number
}

export function EvidenceLocations() {
  const [locations, setLocations] = useState<EvidenceLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newLocation, setNewLocation] = useState({ name: "", description: "" })

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    try {
      const response = await fetch('/api/settings/evidence-locations')
      if (!response.ok) throw new Error('Failed to load evidence locations')
      const data = await response.json()
      setLocations(data)
    } catch (error) {
      console.error('Error loading evidence locations:', error)
      toast({
        title: "Error",
        description: "Failed to load evidence locations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch('/api/settings/evidence-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLocation),
      })

      if (!response.ok) throw new Error('Failed to create evidence location')

      const created = await response.json()
      setLocations([...locations, created])
      setShowNewDialog(false)
      setNewLocation({ name: "", description: "" })

      toast({
        title: "Location Created",
        description: "The evidence location has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating evidence location:', error)
      toast({
        title: "Error",
        description: "Failed to create evidence location",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/settings/evidence-locations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete evidence location')

      setLocations(locations.filter(location => location.id !== id))
      toast({
        title: "Location Deleted",
        description: "The evidence location has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting evidence location:', error)
      toast({
        title: "Error",
        description: "Failed to delete evidence location",
        variant: "destructive",
      })
    }
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(locations)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))

    setLocations(updatedItems)

    try {
      await fetch('/api/settings/evidence-locations/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems }),
      })
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Evidence Locations</h2>
          <p className="text-sm text-muted-foreground">
            Manage evidence storage locations and their order
          </p>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="locations">
          {(provided) => (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {locations.map((location, index) => (
                  <Draggable
                    key={location.id}
                    draggableId={location.id.toString()}
                    index={index}
                  >
                    {(provided) => (
                      <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <TableCell>
                          <div {...provided.dragHandleProps}>
                            <Grip className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell>{location.name}</TableCell>
                        <TableCell>{location.description}</TableCell>
                        <TableCell>
                          {!location.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(location.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TableBody>
            </Table>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Evidence Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newLocation.description}
                onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                placeholder="Enter location description"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowNewDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
