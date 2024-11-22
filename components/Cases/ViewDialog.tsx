"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ViewDialogProps {
  title: string
  content: string
}

export function ViewDialog({ title, content }: ViewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-wrap">{content || 'No content available'}</div>
      </DialogContent>
    </Dialog>
  )
}
