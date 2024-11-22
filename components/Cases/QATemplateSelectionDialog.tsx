"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { QATemplate } from "@/lib/types/qa"
import { toast } from "@/components/ui/use-toast"

interface QATemplateSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTemplateSelect: (templateId: number) => void
}

export function QATemplateSelectionDialog({
  open,
  onOpenChange,
  onTemplateSelect,
}: QATemplateSelectionDialogProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<QATemplate[]>([])

  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  async function loadTemplates() {
    try {
      setLoading(true)
      const response = await fetch(`/api/templates/qa?type=${typeFilter}`)
      if (!response.ok) {
        throw new Error('Failed to load templates')
      }
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [typeFilter])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[600px] h-[90vh] sm:h-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 py-4">
          <DialogTitle>Select QA Template</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-4 px-6 py-4 border-y">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>
          <div className="flex-none">
            <RadioGroup
              value={typeFilter}
              onValueChange={setTypeFilter}
              className="flex flex-row sm:flex-col gap-4"
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ORGANIZATION" id="org" />
                <Label htmlFor="org">Organization</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="USER" id="user" />
                <Label htmlFor="user">User</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-20rem)] sm:h-[400px]">
            <div className="space-y-4 p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => onTemplateSelect(template.id)}
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium group-hover:text-primary transition-colors">
                        {template.name}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {template.checklistItems.length} items
                      </div>
                    </div>
                    <div>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {template.type}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
