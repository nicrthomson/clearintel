"use client"

import { useState } from "react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PenTool } from "lucide-react"
import { DigitalSignature } from "./DigitalSignature"
import { toast } from "@/components/ui/use-toast"

interface ChainOfCustodyRecord {
  id: number
  action: string
  reason?: string
  location?: string
  signature?: string
  user: {
    name?: string | null
    email: string
  }
  createdAt: string
}

interface ChainOfCustodyProps {
  records: ChainOfCustodyRecord[]
  evidenceId: number
  onUpdate: () => void
}

export function ChainOfCustody({ records, evidenceId, onUpdate }: ChainOfCustodyProps) {
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)

  const handleSignatureComplete = async (
    signature: string,
    action: string,
    reason: string,
    location: string
  ) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/custody`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reason,
          location,
          signature,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to record custody action')
      }

      toast({
        title: "Action Recorded",
        description: "The custody action has been recorded successfully.",
      })

      onUpdate()
    } catch (error) {
      console.error('Error recording custody action:', error)
      toast({
        title: "Error",
        description: "Failed to record the custody action. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chain of Custody</h3>
        <Button onClick={() => setShowSignatureDialog(true)}>
          <PenTool className="h-4 w-4 mr-2" />
          Record Action
        </Button>
      </div>
      
      <div className="border rounded-md p-4">
        <div className="space-y-6">
          {records.map((record) => (
            <div
              key={record.id}
              className="relative pl-8 pb-6 last:pb-0 border-l-2 border-border last:border-l-0"
            >
              <div className="absolute left-0 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-primary" />
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {record.action} by {record.user.name || record.user.email}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(record.createdAt)}
                  </span>
                </div>
                
                {record.reason && (
                  <p className="text-sm text-muted-foreground">
                    {record.reason}
                  </p>
                )}
                
                {record.location && (
                  <p className="text-sm">
                    Location: {record.location}
                  </p>
                )}

                {record.signature && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Digital Signature:</p>
                    <img 
                      src={record.signature} 
                      alt="Digital Signature" 
                      className="max-w-[200px] border rounded p-1 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <p className="text-center text-muted-foreground">
              No chain of custody records found
            </p>
          )}
        </div>
      </div>

      <DigitalSignature
        open={showSignatureDialog}
        onOpenChange={setShowSignatureDialog}
        evidenceId={evidenceId}
        onSignatureComplete={handleSignatureComplete}
      />
    </div>
  )
}
