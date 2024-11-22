"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface CustodyAction {
  id: number
  name: string
  description: string | null
}

interface DigitalSignatureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evidenceId: number
  onSignatureComplete: (signature: string, action: string, reason: string, location: string) => Promise<void>
}

export function DigitalSignature({
  open,
  onOpenChange,
  evidenceId,
  onSignatureComplete,
}: DigitalSignatureProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [typedName, setTypedName] = useState("")
  const [typedDate, setTypedDate] = useState(new Date().toISOString().split('T')[0])
  const [actions, setActions] = useState<CustodyAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadActions()
    }
  }, [open])

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

  const generateSignature = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    canvas.width = 600
    canvas.height = 200
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw name
    ctx.font = 'italic 40px "Dancing Script"'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.fillText(typedName, canvas.width / 2, 80)
    
    // Draw date
    ctx.font = '20px Arial'
    ctx.fillText(new Date(typedDate).toLocaleDateString(), canvas.width / 2, 120)

    return canvas.toDataURL()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!typedName) {
      toast({
        title: "Name Required",
        description: "Please type your name before submitting.",
        variant: "destructive",
      })
      return
    }

    const signature = generateSignature()
    if (!signature) {
      toast({
        title: "Error",
        description: "Failed to generate signature. Please try again.",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData(formRef.current!)
    const action = formData.get('action') as string
    const reason = formData.get('reason') as string
    const location = formData.get('location') as string

    try {
      await onSignatureComplete(signature, action, reason, location)
      onOpenChange(false)
      setTypedName("")
      setTypedDate(new Date().toISOString().split('T')[0])
      if (formRef.current) {
        formRef.current.reset()
      }
    } catch (error) {
      console.error('Error saving signature:', error)
      toast({
        title: "Error",
        description: "Failed to save signature. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Digital Signature</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <select
              id="action"
              name="action"
              className="w-full border rounded-md p-2"
              required
            >
              {actions.map((action) => (
                <option key={action.id} value={action.name}>
                  {action.name}
                  {action.description && ` - ${action.description}`}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Enter the reason for this action..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="Current location of the evidence"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="typedName">Type your full name</Label>
              <Input
                id="typedName"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Your full name"
                className="font-signature text-lg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typedDate">Date</Label>
              <Input
                id="typedDate"
                type="date"
                value={typedDate}
                onChange={(e) => setTypedDate(e.target.value)}
                required
              />
            </div>
            <div className="border rounded-md p-4 bg-gray-50">
              <p className={cn(
                "text-center font-signature text-2xl",
                typedName ? "text-black" : "text-gray-400"
              )}>
                {typedName || "Your signature will appear here"}
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {typedDate ? new Date(typedDate).toLocaleDateString() : "Date"}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTypedName("")
                setTypedDate(new Date().toISOString().split('T')[0])
              }}
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
