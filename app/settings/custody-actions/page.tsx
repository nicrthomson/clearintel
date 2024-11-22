"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Plus, Grip, Trash } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CustodyAction {
  id: number
  name: string
  description: string | null
  isDefault: boolean
  order: number
}

export default function CustodyActionsPage() {
  const [actions, setActions] = useState<CustodyAction[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newAction, setNewAction] = useState({ name: "", description: "" })

  useEffect(() => {
    loadActions()
  }, [])

  async function loadActions() {
    try {
      const response = await fetch('/api/settings/custody-actions')
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
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    try {
      const response = await fetch('/api/settings/custody-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAction),
      })

      if (!response.ok) throw new Error('Failed to create custody action')

      const created = await response.json()
      setActions([...actions, created])
      setShowNewDialog(false)
      setNewAction({ name: "", description: "" })

      toast({
        title: "Action Created",
        description: "The custody action has been created successfully.",
      })
    } catch (error) {
      console.error('Error creating custody action:', error)
      toast({
        title: "Error",
        description: "Failed to create custody action",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/settings/custody-actions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete custody action')

      setActions(actions.filter(action => action.id !== id))
      toast({
        title: "Action Deleted",
        description: "The custody action has been deleted successfully.",
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
        <h1 className="text-2xl font-bold">Custody Actions</h1>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      <div className="grid gap-4">
        {actions.map((action) => (
          <Card key={action.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Grip className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{action.name}</h3>
                  {action.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                {action.description && (
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                )}
              </div>
              {!action.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(action.id)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custody Action</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newAction.name}
                onChange={(e) => setNewAction({ ...newAction, name: e.target.value })}
                placeholder="Enter action name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAction.description}
                onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                placeholder="Enter action description"
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
