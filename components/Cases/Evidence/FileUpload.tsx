"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/utils"

interface FileUploadProps {
  onUploadComplete: (fileData: {
    fileName: string
    originalName: string
    size: number
    md5: string
    sha256: string
    path: string
    mimeType?: string
  }) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0])
      setUploadProgress(0)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  })

  const uploadFile = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setUploadProgress(10) // Start progress

      const formData = new FormData()
      formData.append("file", selectedFile)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/evidence/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Upload failed")
      }

      setUploadProgress(100)
      const data = await response.json()
      
      onUploadComplete({
        fileName: data.fileName,
        originalName: data.originalName,
        size: data.size,
        md5: data.md5,
        sha256: data.sha256,
        path: data.path,
        mimeType: selectedFile.type,
      })

      // Reset after successful upload
      setTimeout(() => {
        setSelectedFile(null)
        setUploadProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
      throw error
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-border"
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="space-y-2">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatBytes(selectedFile.size)}
            </p>
            {selectedFile.type && (
              <p className="text-sm text-muted-foreground">
                Type: {selectedFile.type}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground">
              {isDragActive
                ? "Drop the file here"
                : "Drag and drop a file here, or click to select"}
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="space-y-4">
          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress === 100 ? "Upload complete!" : "Uploading..."}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null)
                setUploadProgress(0)
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFile}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
