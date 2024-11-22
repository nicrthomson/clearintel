"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, AlertCircle, FileIcon, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBytes, formatDate } from "@/lib/utils"
import Link from "next/link"

interface E01Success {
  metadata: {
    ewf?: Record<string, string>
    media?: Record<string, string>
    digest_hash?: Record<string, string>
  }
  mediaInfo: {
    ewf?: Record<string, string>
    media?: Record<string, string>
    digest_hash?: Record<string, string>
  }
  acquisitionInfo: {
    ewf?: Record<string, string>
    media?: Record<string, string>
    digest_hash?: Record<string, string>
  }
  dfxml: string
  toolsInfo: {
    version: string | null
    available: boolean
  }
}

interface E01Error {
  error: string
  details: string
  toolsInfo: {
    version: string | null
    available: boolean
    error: true
  }
}

type E01Info = E01Success | E01Error

interface ImageInfo {
  id: number
  name: string
  description?: string | null
  imageType: string
  symlinkPath: string
  size: number
  createdAt: string
  fileStats: {
    size: number
    created: string
    modified: string
    accessed: string
    isFile: boolean
    extension: string
    basename: string
    directory: string
  }
  e01Info?: E01Info
  user: {
    name: string | null
    email: string
  }
}

function isE01Error(info: E01Info): info is E01Error {
  return 'error' in info
}

export default function ImageViewerPage() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null)

  useEffect(() => {
    loadImageInfo()
  }, [params.id, params.imageId])

  const loadImageInfo = async () => {
    try {
      const response = await fetch(`/api/cases/${params.id}/images/${params.imageId}`)
      if (!response.ok) {
        throw new Error("Failed to load image information")
      }
      const data = await response.json()
      setImageInfo(data)
    } catch (error) {
      console.error("Error loading image:", error)
      setError(error instanceof Error ? error.message : "Failed to load image")
    } finally {
      setLoading(false)
    }
  }

  const renderMetadataSection = (title: string, data?: Record<string, Record<string, string>>) => {
    if (!data) return null
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-3 border-b">
          <h2 className="font-semibold">{title}</h2>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-6">
            {Object.entries(data).map(([section, values]) => (
              <div key={section} className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground capitalize">
                  {section.replace(/_/g, ' ')}
                </h3>
                {Object.entries(values).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </dt>
                    <dd className="mt-1 text-sm">
                      {value}
                    </dd>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !imageInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <p className="text-lg text-muted-foreground">
          {error || "Image not found"}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/case/${params.id}?tab=images`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Images
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{imageInfo.name}</h1>
          {imageInfo.description && (
            <p className="text-muted-foreground mt-1">{imageInfo.description}</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Type: {imageInfo.imageType}</p>
          <p>Size: {formatBytes(imageInfo.size)}</p>
          <p>Added by: {imageInfo.user.name || imageInfo.user.email}</p>
          <p>Added on: {formatDate(imageInfo.createdAt)}</p>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-lg border bg-card">
          <div className="p-3 border-b">
            <h2 className="font-semibold">File Information</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                File Name
              </dt>
              <dd className="mt-1 text-sm font-mono break-all">
                {imageInfo.fileStats.basename}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Location
              </dt>
              <dd className="mt-1 text-sm font-mono break-all">
                {imageInfo.fileStats.directory}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                File Type
              </dt>
              <dd className="mt-1 text-sm">
                {imageInfo.imageType} Image ({imageInfo.fileStats.extension})
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                File Size
              </dt>
              <dd className="mt-1 text-sm">
                {formatBytes(imageInfo.fileStats.size)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1 text-sm">
                {formatDate(imageInfo.fileStats.created)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Modified
              </dt>
              <dd className="mt-1 text-sm">
                {formatDate(imageInfo.fileStats.modified)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Last Accessed
              </dt>
              <dd className="mt-1 text-sm">
                {formatDate(imageInfo.fileStats.accessed)}
              </dd>
            </div>
          </div>
        </div>

        {imageInfo.imageType === 'E01' && imageInfo.e01Info && (
          <>
            {isE01Error(imageInfo.e01Info) ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Reading E01 File</AlertTitle>
                <AlertDescription>
                  There was an error reading the E01 file. Please ensure the file is not corrupted
                  and you have the necessary permissions.
                  <div className="mt-2">
                    <p className="font-mono text-sm">{imageInfo.e01Info.details}</p>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="metadata" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                  <TabsTrigger value="media">Media Info</TabsTrigger>
                  <TabsTrigger value="acquisition">Acquisition Info</TabsTrigger>
                  <TabsTrigger value="dfxml">DFXML</TabsTrigger>
                </TabsList>

                <TabsContent value="metadata" className="space-y-4">
                  {renderMetadataSection("E01 Image Metadata", imageInfo.e01Info.metadata)}
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  {renderMetadataSection("Media Information", imageInfo.e01Info.mediaInfo)}
                </TabsContent>

                <TabsContent value="acquisition" className="space-y-4">
                  {renderMetadataSection("Acquisition Information", imageInfo.e01Info.acquisitionInfo)}
                </TabsContent>

                <TabsContent value="dfxml" className="space-y-4">
                  <div className="rounded-lg border bg-card">
                    <div className="p-3 border-b">
                      <h2 className="font-semibold">DFXML Output</h2>
                    </div>
                    <ScrollArea className="h-[600px]">
                      <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                        {imageInfo.e01Info.dfxml}
                      </pre>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  )
}
