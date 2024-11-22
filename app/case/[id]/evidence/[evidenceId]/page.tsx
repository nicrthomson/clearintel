"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, FileIcon, HardDrive, Image, FileText } from "lucide-react"
import { ChainOfCustody } from "@/components/Cases/Evidence/ChainOfCustody"
import { FileViewer } from "@/components/Cases/Evidence/FileViewer"
import { formatBytes, formatDate } from "@/lib/utils"
import type { ChainOfCustodyRecord } from "@/lib/db/types"

interface EvidenceType {
  id: number
  name: string
}

interface Evidence {
  id: number
  name: string
  evidenceNumber: string
  description?: string | null
  type: EvidenceType
  type_id: number
  case_id: number
  status: string
  location?: string | null
  storageLocation?: string | null
  md5Hash?: string | null
  sha256Hash?: string | null
  acquisitionDate?: string | null
  size?: bigint | null
  filePath?: string | null
  originalName?: string | null
  mimeType?: string | null
  createdAt: string
  updatedAt: string
}

interface EvidencePageProps {
  params: {
    id: string
    evidenceId: string
  }
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <FileIcon className="h-6 w-6" />
  
  if (mimeType.startsWith('image/')) {
    return <Image className="h-6 w-6" />
  }
  
  if (mimeType.includes('pdf')) {
    return <FileText className="h-6 w-6" />
  }
  
  if (mimeType.includes('disk') || mimeType.includes('drive')) {
    return <HardDrive className="h-6 w-6" />
  }
  
  return <FileIcon className="h-6 w-6" />
}

export default function EvidencePage({ params }: EvidencePageProps) {
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [custodyRecords, setCustodyRecords] = useState<ChainOfCustodyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadEvidence() {
      try {
        const [evidenceRes, custodyRes] = await Promise.all([
          fetch(`/api/evidence/${params.evidenceId}`),
          fetch(`/api/evidence/${params.evidenceId}/custody`)
        ])

        if (!evidenceRes.ok || !custodyRes.ok) {
          throw new Error('Failed to load evidence data')
        }

        const [evidenceData, custodyData] = await Promise.all([
          evidenceRes.json(),
          custodyRes.json()
        ])

        setEvidence(evidenceData)
        setCustodyRecords(custodyData)
      } catch (error) {
        console.error('Error loading evidence:', error)
        setError(error instanceof Error ? error.message : 'Failed to load evidence')
      } finally {
        setLoading(false)
      }
    }

    loadEvidence()
  }, [params.evidenceId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !evidence) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <p className="text-lg text-muted-foreground">
          {error || 'Evidence not found'}
        </p>
        <Button
          onClick={() => router.back()}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{evidence.name}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          {evidence.status}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          {getFileIcon(evidence.mimeType || null)}
          <span className="text-sm text-muted-foreground">
            {evidence.mimeType || 'Unknown type'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Evidence Number</p>
            <p className="font-medium">{evidence.evidenceNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium">{evidence.type.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{evidence.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{evidence.location || 'N/A'}</p>
          </div>
          {evidence.size && (
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="font-medium">{formatBytes(Number(evidence.size))}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Added</p>
            <p className="font-medium">{formatDate(evidence.createdAt)}</p>
          </div>
        </div>

        {(evidence.md5Hash || evidence.sha256Hash) && (
          <div className="space-y-2 pt-4 border-t mb-6">
            {evidence.md5Hash && (
              <div>
                <p className="text-sm text-muted-foreground">MD5 Hash</p>
                <p className="font-mono text-sm break-all">{evidence.md5Hash}</p>
              </div>
            )}
            {evidence.sha256Hash && (
              <div>
                <p className="text-sm text-muted-foreground">SHA256 Hash</p>
                <p className="font-mono text-sm break-all">{evidence.sha256Hash}</p>
              </div>
            )}
          </div>
        )}

        {evidence.description && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-1">{evidence.description}</p>
          </div>
        )}
      </Card>

      <Tabs defaultValue="file" className="space-y-4">
        <TabsList>
          <TabsTrigger value="file">File</TabsTrigger>
          <TabsTrigger value="custody">Chain of Custody</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          {evidence.filePath && evidence.originalName && evidence.size && (
            <FileViewer
              fileName={evidence.filePath}
              originalName={evidence.originalName}
              size={Number(evidence.size)}
              mimeType={evidence.mimeType || undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="custody">
          <Card className="p-6">
            <ChainOfCustody
              records={custodyRecords}
              evidenceId={evidence.id}
              onUpdate={() => {
                fetch(`/api/evidence/${params.evidenceId}/custody`)
                  .then(res => res.json())
                  .then(data => setCustodyRecords(data))
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
