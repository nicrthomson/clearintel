"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { GripVertical, Plus, ArrowLeft, X } from "lucide-react"
import Link from "next/link"
import { QATemplate, QAChecklistItem, QAChecklistItemCreate } from "@/lib/types/qa"

interface QATemplateEditorProps {
  template: QATemplate
}

export function QATemplateEditor({ template: initialTemplate }: QATemplateEditorProps) {
  const router = useRouter()
  const [template, setTemplate] = useState(initialTemplate)
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [newItem, setNewItem] = useState<Partial<QAChecklistItemCreate>>({
    name: "",
    description: "",
    category: "",
    required: false,
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const saveTemplate = useCallback(async (templateToSave: QATemplate) => {
    if (saving) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/templates/qa/${templateToSave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateToSave),
      })

      if (!response.ok) throw new Error('Failed to save template')
      
      const updatedTemplate = await response.json()
      setTemplate(updatedTemplate)
      router.refresh()
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [router, saving])

  // Auto-save whenever template changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (JSON.stringify(template) !== JSON.stringify(initialTemplate)) {
        saveTemplate(template)
      }
    }, 500) // Debounce saves

    return () => clearTimeout(saveTimeout)
  }, [template, initialTemplate, saveTemplate])

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.category) return

    const item: QAChecklistItemCreate = {
      name: newItem.name,
      description: newItem.description || null,
      category: newItem.category,
      required: newItem.required || false,
      order: template.checklistItems.length,
    }

    const updatedTemplate = {
      ...template,
      checklistItems: [...template.checklistItems, item as QAChecklistItem],
    }

    await saveTemplate(updatedTemplate)

    setNewItem({
      name: "",
      description: "",
      category: newItem.category, // Keep the same category for consecutive items
      required: false,
    })

    setShowNewItemDialog(false)
  }

  const handleUpdateItem = async (index: number, updates: Partial<QAChecklistItem>) => {
    const newItems = [...template.checklistItems]
    newItems[index] = { ...newItems[index], ...updates }
    
    const updatedTemplate = {
      ...template,
      checklistItems: newItems,
    }

    setTemplate(updatedTemplate)
  }

  const handleRemoveItem = async (index: number) => {
    const newItems = [...template.checklistItems]
    newItems.splice(index, 1)
    // Update order for remaining items
    newItems.forEach((item, i) => {
      item.order = i
    })

    const updatedTemplate = {
      ...template,
      checklistItems: newItems,
    }

    await saveTemplate(updatedTemplate)
  }

  const handleMoveItem = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= template.checklistItems.length) return

    const newItems = [...template.checklistItems]
    const [movedItem] = newItems.splice(fromIndex, 1)
    newItems.splice(toIndex, 0, movedItem)

    // Update order for all items
    newItems.forEach((item, i) => {
      item.order = i
    })

    const updatedTemplate = {
      ...template,
      checklistItems: newItems,
    }

    await saveTemplate(updatedTemplate)
  }

  // Group items by category
  const groupedItems = template.checklistItems.reduce<Record<string, QAChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/settings/qa-checklist"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Templates
          </Link>
          <h3 className="text-lg font-medium">{template.name}</h3>
          <p className="text-sm text-muted-foreground">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded mr-2">
              {template.type}
            </span>
            {template.checklistItems.length} items in {Object.keys(groupedItems).length} categories
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowNewItemDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedItems).map(([category, items]) => (
          <Card key={category} className="p-6">
            <h4 className="text-sm font-medium mb-4">{category}</h4>
            <div className="space-y-4">
              {items.map((item: QAChecklistItem, index: number) => {
                const globalIndex = template.checklistItems.findIndex((i: QAChecklistItem) => i === item)
                return (
                  <div
                    key={item.id || index}
                    className={`flex items-start space-x-4 bg-secondary/20 p-4 rounded-md transition-all ${
                      draggedIndex === globalIndex ? 'opacity-50' : ''
                    } ${draggedIndex !== null ? 'cursor-move' : ''}`}
                    data-item-index={globalIndex}
                    draggable
                    onDragStart={(e: React.DragEvent) => {
                      setDraggedIndex(globalIndex)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', globalIndex.toString())
                      
                      // Create a drag image
                      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
                      dragImage.style.position = 'absolute'
                      dragImage.style.top = '-1000px'
                      document.body.appendChild(dragImage)
                      e.dataTransfer.setDragImage(dragImage, 20, 20)
                      
                      setTimeout(() => {
                        document.body.removeChild(dragImage)
                      }, 0)
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null)
                    }}
                    onDragOver={(e: React.DragEvent) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      
                      // Add visual feedback for drop target
                      e.currentTarget.classList.add('bg-secondary/40')
                    }}
                    onDragLeave={(e: React.DragEvent) => {
                      e.currentTarget.classList.remove('bg-secondary/40')
                    }}
                    onDrop={(e: React.DragEvent) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('bg-secondary/40')
                      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
                      const toIndex = globalIndex
                      if (fromIndex !== toIndex) {
                        handleMoveItem(fromIndex, toIndex)
                      }
                    }}
                  >
                    <button className="mt-1 cursor-move">
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`item-${globalIndex}-name`}>Name</Label>
                        <Input
                          id={`item-${globalIndex}-name`}
                          value={item.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(globalIndex, { name: e.target.value })}
                          className="h-8"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`item-${globalIndex}-description`}>Description</Label>
                        <Textarea
                          id={`item-${globalIndex}-description`}
                          value={item.description ?? ""}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleUpdateItem(globalIndex, { description: e.target.value })}
                          className="h-20"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${globalIndex}-required`}
                          checked={item.required}
                          onCheckedChange={(checked: boolean) => 
                            handleUpdateItem(globalIndex, { required: checked })
                          }
                        />
                        <Label htmlFor={`item-${globalIndex}-required`}>Required</Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(globalIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-item-category">Category</Label>
              <Input
                id="new-item-category"
                value={newItem.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, category: e.target.value })}
                list="categories"
              />
              <datalist id="categories">
                {Object.keys(groupedItems).map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-item-description">Description</Label>
              <Textarea
                id="new-item-description"
                value={newItem.description ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-item-required"
                checked={newItem.required}
                onCheckedChange={(checked: boolean) => 
                  setNewItem({ ...newItem, required: checked })
                }
              />
              <Label htmlFor="new-item-required">Required</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
