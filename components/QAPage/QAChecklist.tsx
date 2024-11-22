"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle2, Circle, AlertCircle, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { defaultTemplate } from "@/lib/defaultTemplate"
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

interface QAChecklistItem {
  id: number
  name: string
  description?: string | null
  category: string
  required: boolean
  order: number
}

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

  useEffect(() => {
    loadQAResponses()
  }, [caseId])

  async function loadQAResponses() {
    try {
      // First check if we have any checklist items
      const checklistResponse = await fetch('/api/settings/qa-checklist')
      const checklistItems = await checklistResponse.json()

      if (checklistItems.length === 0) {
        // Create initial checklist items from template
        await Promise.all(defaultTemplate.checklistItems.map(item =>
          fetch('/api/settings/qa-checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        ))
      }

      // Now load the responses
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

  async function applyTemplate() {
    try {
      setLoading(true)
      
      // Delete existing responses
      await Promise.all(responses.map(response => 
        fetch(`/api/cases/${caseId}/qa-responses/${response.id}`, { method: 'DELETE' })
      ))

      // Get existing checklist items
      const checklistResponse = await fetch('/api/settings/qa-checklist')
      const existingItems = await checklistResponse.json()

      // Create responses using existing checklist items
      await Promise.all(existingItems.map((item: QAChecklistItem) =>
        fetch(`/api/cases/${caseId}/qa-responses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checklistItemId: item.id,
            completed: false,
            notes: null
          }),
        })
      ))

      await loadQAResponses()
      setShowTemplateDialog(false)
      toast({
        title: "Template Applied",
        description: "The QA checklist template has been applied successfully.",
      })
    } catch (error) {
      console.error('Error applying template:', error)
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Quality Assurance Review</h2>
        <div className="flex items-center space-x-4">
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
          <Button variant="outline" size="sm" onClick={() => setShowTemplateDialog(true)}>
            <FileCheck className="h-4 w-4 mr-2" />
            Apply Template
          </Button>
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
                    {response.completed && response.completedBy?.name && (
                      <p className="text-sm text-muted-foreground">
                        Completed by {response.completedBy.name}
                      </p>
                    )}
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

      <AlertDialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all existing QA responses with the default template. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyTemplate}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
