"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface MessageFormProps {
  contactId: number
}

export function MessageForm({ contactId }: MessageFormProps) {
  const [message, setMessage] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && files.length === 0) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("message", message)
    formData.append("contactId", contactId.toString())
    files.forEach(file => formData.append("files", file))

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send message")
      }

      setMessage("")
      setFiles([])
      router.refresh()
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully."
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t p-3">
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs"
            >
              <span className="truncate max-w-[100px]">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-9 w-9"
          disabled={isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
} 