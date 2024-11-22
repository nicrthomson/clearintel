"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle2, Circle, AlertCircle, FileCheck, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { QATemplateSelectionDialog } from "./QATemplateSelectionDialog"
import { QATemplate, QAChecklistItem } from "@/lib/types/qa"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface QAResponse {
  id: number
  checklistItem: QAChecklistItem
  completed: boolean
  notes?: string | null
  completedBy?: {
    name?: string | null
  } | null
  completedAt?: string | null
}

interface QAReviewProps {
  caseId: number
}

export function QAReview({ caseId }: QAReviewProps) {
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<QAResponse[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<Partial<QAChecklistItem>>({
    name: "",
    description: "",
    category: "",
    required: false,
  })
  const [applyingTemplate, setApplyingTemplate] = useState(false)

  useEffect(() => {
    loadQAResponses()
  }, [caseId])

  async function loadQAResponses() {
    try {
      const response = await fetch(`/api/cases/${caseId}/qa-responses`)
      if (!response.ok) {
        throw new Error('Failed to load QA responses')
      }
      const data = await response.json()
      setResponses(data)
    } catch (error) {
      console.error('Error loading QA responses:', error)
      setError(error instanceof Error ? error.message : 'Failed to load QA responses')
    } finally {
      setLoading(false)
    }
  }

  async function handleTemplateSelect(templateId: number) {
    setSelectedTemplateId(templateId)
    setShowTemplateDialog(false)
    setShowConfirmDialog(true)
  }

  async function applyTemplate() {
    if (!selectedTemplateId) return

    try {
      setApplyingTemplate(true)
      setShowConfirmDialog(false)

      // Delete all existing responses
      const deleteResponse = await fetch(`/api/cases/${caseId}/qa-responses`, { method: 'DELETE' })
      if (!deleteResponse.ok) {
        throw new Error('Failed to delete existing responses')
      }

      // Create new responses from template
      const createResponse = await fetch(`/api/cases/${caseId}/qa-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId
        }),
      })

      if (!createResponse.ok) {
        throw new Error('Failed to apply template')
      }

      await loadQAResponses()
      toast({
        title: "Template Applied",
        description: "The template has been applied successfully.",
      })
    } catch (error) {
      console.error('Error applying template:', error)
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      })
    } finally {
      setApplyingTemplate(false)
      setSelectedTemplateId(null)
    }
  }

  async function addNewItem() {
    if (!newItem.name || !newItem.category) return

    try {
      // First create the checklist item
      const createItemResponse = await fetch('/api/settings/qa-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            name: newItem.name,
            description: newItem.description,
            category: newItem.category,
            required: newItem.required,
            order: responses.length,
          }]
        }),
      })

      if (!createItemResponse.ok) {
        throw new Error('Failed to create checklist item')
      }

      const [createdItem] = await createItemResponse.json()

      // Then create the response
      const createResponseResponse = await fetch(`/api/cases/${caseId}/qa-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checklistItemId: createdItem.id
        }),
      })

      if (!createResponseResponse.ok) {
        throw new Error('Failed to create response')
      }

      const newResponse = await createResponseResponse.json()
      setResponses([...responses, newResponse])
      setShowNewItemDialog(false)
      setNewItem({
        name: "",
        description: "",
        category: newItem.category, // Keep the same category for consecutive items
        required: false,
      })

      toast({
        title: "Success",
        description: "New item added successfully",
      })
    } catch (error) {
      console.error('Error adding new item:', error)
      toast({
        title: "Error",
        description: "Failed to add new item",
        variant: "destructive",
      })
    }
  }

  async function deleteResponse(responseId: number) {
    try {
      const response = await fetch(`/api/cases/${caseId}/qa-responses/${responseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      setResponses(responses.filter(r => r.id !== responseId))
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting item:', error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  async function updateResponse(responseId: number, completed: boolean, notes?: string) {
    try {
      const response = await fetch(`/api/cases/${caseId}/qa-responses/${responseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed, notes }),
      })

      if (!response.ok) {
        throw new Error('Failed to update QA response')
      }

      const updatedResponse = await response.json()
      setResponses(responses.map(r => 
        r.id === responseId ? updatedResponse : r
      ))

      toast({
        title: "QA Review Updated",
        description: "The checklist item has been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating QA response:', error)
      toast({
        title: "Error",
        description: "Failed to update the checklist item. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  const groupedResponses = responses.reduce((acc, response) => {
    const category = response.checklistItem.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(response)
    return acc
  }, {} as Record<string, QAResponse[]>)

  const categories = Object.keys(groupedResponses)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Quality Assurance Review</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center">
              <Circle className="h-4 w-4 mr-1" />
              <span>Pending</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowNewItemDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTemplateDialog(true)}
              disabled={applyingTemplate}
            >
              {applyingTemplate ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4 mr-2" />
              )}
              Apply Template
            </Button>
          </div>
        </div>
      </div>

      {Object.entries(groupedResponses).map(([category, items]) => (
        <Card key={category} className="p-4">
          <h3 className="text-sm font-medium mb-4">{category}</h3>
          <div className="space-y-4">
            {items.map((response) => (
              <div key={response.id} className="flex items-start space-x-4">
                <Checkbox
                  checked={response.completed}
                  onCheckedChange={(checked) => {
                    updateResponse(response.id, checked as boolean, response.notes || undefined)
                  }}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{response.checklistItem.name}</p>
                      {response.checklistItem.description && (
                        <p className="text-sm text-muted-foreground">
                          {response.checklistItem.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {response.completed && response.completedBy?.name && (
                        <p className="text-sm text-muted-foreground">
                          Completed by {response.completedBy.name}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteResponse(response.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Add notes..."
                    value={response.notes || ''}
                    onChange={(e) => {
                      updateResponse(response.id, response.completed, e.target.value || undefined)
                    }}
                    className="h-20"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <QATemplateSelectionDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        onTemplateSelect={handleTemplateSelect}
      />

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to apply this template? This will remove all existing checklist items and replace them with the template&apos;s items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyTemplate}>Apply Template</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-item-name">Name</Label>
              <Input
                id="new-item-name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-item-category">Category</Label>
              <Input
                id="new-item-category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                list="categories"
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-item-description">Description</Label>
              <Textarea
                id="new-item-description"
                value={newItem.description ?? ""}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-item-required"
                checked={newItem.required}
                onCheckedChange={(checked) => 
                  setNewItem({ ...newItem, required: checked as boolean })
                }
              />
              <Label htmlFor="new-item-required">Required</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addNewItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
