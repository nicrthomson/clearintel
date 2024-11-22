"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Grip, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

interface EvidenceType {
  id: number
  name: string
  description: string | null
  isDefault: boolean
  order: number
}

export function EvidenceSettings() {
  const [types, setTypes] = useState<EvidenceType[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newType, setNewType] = useState({ name: "", description: "" })

  useEffect(() => {
    loadTypes()
  }, [])

  async function loadTypes() {
    try {
      const response = await fetch('/api/settings/evidence-types')
      if (!response.ok) throw new Error('Failed to load evidence types')
      const data = await response.json()
      setTypes(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load evidence types",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch('/api/settings/evidence-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newType),
      })

      if (!response.ok) throw new Error('Failed to create evidence type')

      const created = await response.json()
      setTypes([...types, created])
      setShowNewDialog(false)
      setNewType({ name: "", description: "" })

      toast({
        title: "Type Created",
        description: "The evidence type has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create evidence type",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/settings/evidence-types/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete evidence type')

      setTypes(types.filter(type => type.id !== id))
      toast({
        title: "Type Deleted",
        description: "The evidence type has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete evidence type",
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(types)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setTypes(items)

    try {
      await fetch('/api/settings/evidence-types/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Evidence Types</h2>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="evidence-types">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
              {types.map((type, index) => (
                <Draggable key={type.id} draggableId={type.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Card className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div {...provided.dragHandleProps}>
                                <Grip className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <h3 className="font-medium">{type.name}</h3>
                              {type.isDefault && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            {type.description && (
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            )}
                          </div>
                          {!type.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(type.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Evidence Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                placeholder="Enter type name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newType.description}
                onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                placeholder="Enter type description"
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
