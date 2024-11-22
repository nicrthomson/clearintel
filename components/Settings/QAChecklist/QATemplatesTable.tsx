"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, MoreHorizontal, Copy, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
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
import { QATemplate } from "@/lib/types/qa"

interface QATemplatesTableProps {
  templates: QATemplate[]
  onTemplateDeleted: () => void
}

export function QATemplatesTable({ templates, onTemplateDeleted }: QATemplatesTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<QATemplate | null>(null)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "ORGANIZATION" as "ORGANIZATION" | "USER"
  })

  console.log('Rendering QATemplatesTable with templates:', templates)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || template.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/templates/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      })

      if (!response.ok) throw new Error('Failed to create template')
      
      const template = await response.json()
      setShowNewDialog(false)
      router.push(`/settings/qa-checklist/${template.id}`)
    } catch (error) {
      console.error('Error creating template:', error)
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      })
    }
  }

  const handleDuplicate = async (template: QATemplate) => {
    try {
      const response = await fetch('/api/templates/qa/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id }),
      })

      if (!response.ok) throw new Error('Failed to duplicate template')
      
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      })
      onTemplateDeleted() // Refresh the list
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!templateToDelete?.id) return

    try {
      const response = await fetch(`/api/templates/qa/${templateToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete template')
      
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
      setShowDeleteDialog(false)
      setTemplateToDelete(null)
      onTemplateDeleted()
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ORGANIZATION">Organization</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowNewDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No templates found
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => {
                const categories = Array.from(
                  new Set(template.checklistItems.map(item => item.category))
                )
                
                return (
                  <TableRow key={template.id}>
                    <TableCell 
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => router.push(`/settings/qa-checklist/${template.id}`)}
                    >
                      {template.name}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {template.type}
                      </span>
                    </TableCell>
                    <TableCell>{template.checklistItems.length}</TableCell>
                    <TableCell>{categories.join(", ")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setTemplateToDelete(template)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>

            <div className="space-y-2">
              <Label>Template Type</Label>
              <RadioGroup
                value={newTemplate.type}
                onValueChange={(value: "ORGANIZATION" | "USER") => 
                  setNewTemplate({ ...newTemplate, type: value })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ORGANIZATION" id="organization" />
                  <Label htmlFor="organization">Organization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="USER" id="user" />
                  <Label htmlFor="user">User</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Create & Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
