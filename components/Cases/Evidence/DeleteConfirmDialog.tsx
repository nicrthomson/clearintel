"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemCount: number
  onConfirm: () => Promise<void>
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemCount,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  // Reset progress when dialog opens
  useEffect(() => {
    if (open) {
      setProgress(0)
    }
  }, [open])

  // Simulate progress during deletion
  useEffect(() => {
    if (!deleting) {
      return
    }

    // Start at current progress
    let currentProgress = progress

    // Calculate time per percent based on item count
    // More items = slower progress to show work being done
    const timePerPercent = Math.max(20, Math.min(50, itemCount * 2))

    const interval = setInterval(() => {
      if (currentProgress < 90) {
        // Slow down as we get closer to 90%
        const increment = currentProgress > 70 ? 0.5 : 1
        currentProgress += increment
        setProgress(currentProgress)
      }
    }, timePerPercent)

    return () => clearInterval(interval)
  }, [deleting, itemCount, progress])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to confirm
      if (e.key === 'Enter' && !e.shiftKey && !deleting) {
        e.preventDefault()
        handleConfirm()
      }
      // Escape to cancel (handled by Dialog component)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, deleting])

  const handleConfirm = async () => {
    if (deleting) return

    try {
      setDeleting(true)
      await onConfirm()
      // Set to 100% when complete
      setProgress(100)
      // Short delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      onOpenChange(false)
      toast({
        title: "Success",
        description: `Successfully deleted ${itemCount} item${itemCount === 1 ? '' : 's'}`,
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete items",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setProgress(0)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!deleting) {
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent onPointerDownOutside={e => {
        // Prevent closing by clicking outside while deleting
        if (deleting) {
          e.preventDefault()
        }
      }}>
        <DialogHeader>
          <DialogTitle>
            {deleting ? "Deleting Evidence..." : "Confirm Deletion"}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            {deleting ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting {itemCount} item{itemCount === 1 ? '' : 's'}...</span>
                </div>
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {Math.round(progress)}%
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p>
                  Are you sure you want to delete {itemCount} evidence item{itemCount === 1 ? '' : 's'}?
                </p>
                <p className="text-destructive font-medium">
                  This action cannot be undone.
                </p>
                <div className="text-xs text-muted-foreground pt-2">
                  Press Enter to confirm or Escape to cancel
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
