"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Settings2, GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface CustodyAction {
  id: number
  name: string
  description: string | null
  order: number
  isDefault: boolean
}

interface CustodyActionManagerProps {
  caseId: number
}

interface SortableRowProps {
  action: CustodyAction
  onDelete: (id: number) => void
}

function SortableRow({ action, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[40px]">
        <Button 
          variant="ghost" 
          size="sm" 
          className="cursor-grab" 
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell>{action.name}</TableCell>
      <TableCell>{action.description}</TableCell>
      <TableCell>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(action.id)}
        >
          Delete
        </Button>
      </TableCell>
    </TableRow>
  )
}

export function CustodyActionManager({ caseId }: CustodyActionManagerProps) {
  const [open, setOpen] = useState(false)
  const [actions, setActions] = useState<CustodyAction[]>([])
  const [newActionName, setNewActionName] = useState("")
  const [newActionDescription, setNewActionDescription] = useState("")
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (open) {
      loadActions()
    }
  }, [open, caseId])

  const loadActions = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/custody-actions`)
      if (!response.ok) throw new Error('Failed to load custody actions')
      const data = await response.json()
      setActions(data)
    } catch (error) {
      console.error('Error loading custody actions:', error)
      toast({
        title: "Error",
        description: "Failed to load custody actions",
        variant: "destructive",
      })
    }
  }

  const handleAddAction = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/custody-actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newActionName,
          description: newActionDescription || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to add custody action')
      
      await loadActions()
      setNewActionName("")
      setNewActionDescription("")
      
      toast({
        title: "Success",
        description: "Custody action added successfully",
      })
    } catch (error) {
      console.error('Error adding custody action:', error)
      toast({
        title: "Error",
        description: "Failed to add custody action",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAction = async (actionId: number) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/custody-actions/${actionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete custody action')
      
      await loadActions()
      
      toast({
        title: "Success",
        description: "Custody action deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting custody action:', error)
      toast({
        title: "Error",
        description: "Failed to delete custody action",
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = actions.findIndex(action => action.id === active.id)
    const newIndex = actions.findIndex(action => action.id === over.id)
    
    const newActions = arrayMove(actions, oldIndex, newIndex)
    setActions(newActions)

    try {
      const response = await fetch(`/api/cases/${caseId}/custody-actions/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: newIndex + 1,
        }),
      })

      if (!response.ok) throw new Error('Failed to reorder custody action')
      
      await loadActions()
    } catch (error) {
      console.error('Error reordering custody action:', error)
      toast({
        title: "Error",
        description: "Failed to reorder custody action",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Manage Actions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Custody Actions</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div>
                <Input
                  placeholder="Action name"
                  value={newActionName}
                  onChange={(e) => setNewActionName(e.target.value)}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description (optional)"
                  value={newActionDescription}
                  onChange={(e) => setNewActionDescription(e.target.value)}
                />
              </div>
              <div>
                <Button 
                  onClick={handleAddAction}
                  disabled={!newActionName.trim()}
                >
                  Add Action
                </Button>
              </div>
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={actions.map(action => action.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {actions.map((action) => (
                      <SortableRow
                        key={action.id}
                        action={action}
                        onDelete={handleDeleteAction}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                {actions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No custody actions defined
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
