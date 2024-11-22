"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/utils"

interface FileViewerProps {
  fileName: string
  originalName: string
  size: number
  mimeType?: string
}

export function FileViewer({ fileName, originalName, size, mimeType }: FileViewerProps) {
  const [loading, setLoading] = useState(false)

  const isImage = mimeType?.startsWith("image/")
  const isPDF = mimeType === "application/pdf"

  const downloadFile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/evidence/files/${fileName}`)
      if (!response.ok) throw new Error("Download failed")

      // Create a blob from the response
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = originalName
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{originalName}</h3>
          <p className="text-sm text-muted-foreground">
            {formatBytes(size)}
            {mimeType && ` • ${mimeType}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadFile}
          disabled={loading}
        >
          {loading ? "Downloading..." : "Download"}
        </Button>
      </div>

      {isImage && (
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={`/api/evidence/files/${fileName}`}
            alt={originalName}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      )}

      {isPDF && (
        <div className="relative aspect-[8.5/11] bg-muted rounded-lg overflow-hidden">
          <iframe
            src={`/api/evidence/files/${fileName}`}
            className="absolute inset-0 w-full h-full"
            title={originalName}
          />
        </div>
      )}
    </div>
  )
}
