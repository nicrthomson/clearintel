import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { FolderOpen, Info } from "lucide-react"

interface NewImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caseId: number
  onSuccess: () => void
}

export default function NewImageDialog({
  open,
  onOpenChange,
  caseId,
  onSuccess,
}: NewImageDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [path, setPath] = useState("")
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // If no name is set, use the file name without extension
    if (!name) {
      const fileName = file.name
      const fileNameWithoutExt = fileName.split('.')[0]
      setName(fileNameWithoutExt)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !path) return

    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          symlinkPath: path,
          imageType: path.toLowerCase().endsWith(".e01") ? "E01" : 
                    path.toLowerCase().endsWith(".dd") ? "DD" : 
                    "Other",
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Failed to add forensic image")
      }

      toast({
        title: "Success",
        description: "Forensic image added successfully",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add forensic image",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Forensic Image</DialogTitle>
          <DialogDescription>
            Add a reference to a forensic image file on your system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Image name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="path">File Path</Label>
            <div className="flex gap-2">
              <Input
                id="path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/path/to/image.e01"
                required
                className="flex-1"
              />
              <input
                type="file"
                className="hidden"
                accept=".e01,.dd,.raw,.img,.001"
                onChange={handleFileSelect}
                id="file-select"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => document.getElementById('file-select')?.click()}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            <div className="rounded-md bg-muted p-4 text-sm space-y-2">
              <div className="flex gap-2 items-start">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Browser Security Note:</p>
                  <p>Due to browser security restrictions, we can't automatically get the full file path. You'll need to enter it manually.</p>
                </div>
              </div>
              <p className="font-medium mt-2">How to get the file path:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>macOS:</strong> Right-click the file → Hold Option key → Copy as Pathname</li>
                <li><strong>Windows:</strong> Shift + Right-click → Copy as path</li>
                <li><strong>Linux:</strong> Right-click → Properties → Copy path or use pwd command in terminal</li>
              </ul>
              <p>The Browse button will help auto-fill the name, but you'll need to paste the full path manually.</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Image"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
