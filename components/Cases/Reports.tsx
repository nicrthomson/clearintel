"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { NewReportDialog } from "./Reports/NewReportDialog"
import type { GeneratedReport } from "@/lib/db/types/reports"

interface ReportsProps {
  caseId: number
}

export function Reports({ caseId }: ReportsProps) {
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchReports = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/reports`)
      if (!response.ok) {
        if (response.status === 404) {
          // No reports yet, that's okay
          setReports([])
          return
        }
        throw new Error("Failed to fetch reports")
      }
      const data = await response.json()
      setReports(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch reports")
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [caseId])

  if (loading) {
    return <div>Loading reports...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error loading reports: {error}</p>
        <Button 
          variant="outline" 
          onClick={fetchReports} 
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Reports</h2>
        <Button onClick={() => setDialogOpen(true)}>
          Generate New Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reports generated yet
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{report.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(`/api/reports/${report.id}/download`)}
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      )}

      <NewReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        caseId={caseId}
        onSuccess={fetchReports}
      />
    </div>
  )
} 