"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Notes } from "@/components/Cases/Notes"
import { Overview } from "@/components/Cases/Overview"
import { EvidenceList } from "@/components/Cases/Evidence/EvidenceList"
import { QAReview } from "@/components/Cases/QAReview"
import { TaskList } from "@/components/Cases/Tasks/TaskList"
import type { CaseWithRelations } from "@/lib/db/types"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { EditCaseDialog } from "@/components/Cases/EditCaseDialog"
import { Reports } from "@/components/Cases/Reports/Reports"
import { AuditLogs } from "@/components/Cases/AuditLogs"
import ImagesTable from "@/components/Cases/Images/ImagesTable"
import { useForensicImages } from "@/app/hooks/useForensicImages"

interface CasePageProps {
  params: {
    id: string
  }
}

export default function CasePage({ params }: CasePageProps) {
  const [caseData, setCaseData] = useState<CaseWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { images, refresh } = useForensicImages(parseInt(params.id));

  const loadCase = async () => {
    try {
      console.log('Fetching case:', params.id);
      const response = await fetch(`/api/cases/${params.id}`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to load case');
      }
      
      const data = await response.json();
      console.log('Case data:', data);
      setCaseData(data);
    } catch (error) {
      console.error('Error loading case:', error);
      setError(error instanceof Error ? error.message : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <p className="text-lg text-muted-foreground">
          {error || 'Case not found'}
        </p>
        <button
          onClick={() => router.push('/cases')}
          className="text-primary hover:underline"
        >
          Return to cases
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{caseData.name}</h1>
        <div className="text-sm text-muted-foreground">
          {caseData.status}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <div className="flex items-center justify-between border-b">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="qa-review">QA Review</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="audit-logs">Logs</TabsTrigger>
          </TabsList>
          <EditCaseDialog 
            caseData={caseData} 
            onCaseUpdated={(data: any) => setCaseData({ ...caseData, ...data })} 
          />
        </div>
          
        <TabsContent value="overview">
          <Overview 
            caseData={caseData} 
            onUpdate={(data: any) => setCaseData({ ...caseData, ...data })} 
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TaskList caseId={caseData.id} />
        </TabsContent>
        
        <TabsContent value="notes">
          <Notes caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="evidence">
          <EvidenceList 
            caseId={caseData.id} 
            evidence={caseData.evidence || []} 
            onEvidenceCreated={loadCase}
          />
        </TabsContent>

        <TabsContent value="images">
          <ImagesTable 
            caseId={caseData.id}
            images={images}
            mutate={refresh}          
          />
        </TabsContent>

        <TabsContent value="qa-review">
          <QAReview caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="timeline">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Timeline view coming soon
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Reports caseId={Number(params.id)} />
        </TabsContent>

        <TabsContent value="audit-logs">
          <AuditLogs caseId={Number(params.id)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
