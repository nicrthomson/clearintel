"use client"

import { useState, useEffect } from "react";
import { EvidenceList } from "@/components/Cases/Evidence/EvidenceList";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface Evidence {
  id: number;
  name: string;
  evidenceNumber: string;
  type: {
    id: number;
    name: string;
  };
  status: string;
  storageLocation: string | null;
  size: bigint | null;
  createdAt: Date;
  mimeType: string | null;
  filePath: string | null;
  case: {
    id: number;
    name: string;
  };
}

export default function EvidencePage() {
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const { toast } = useToast();

  const fetchEvidence = async () => {
    try {
      const response = await fetch("/api/evidence/all");
      if (!response.ok) throw new Error("Failed to fetch evidence");
      const data = await response.json();
      setEvidence(data.evidence);
    } catch (error) {
      console.error("Error fetching evidence:", error);
      toast({
        title: "Error",
        description: "Failed to load evidence items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  if (loading) {
    return (
      <div className="container py-6 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Evidence</h1>
        <p className="text-muted-foreground">
          View and manage evidence across all cases
        </p>
      </div>
      
      <EvidenceList 
        caseId={0} // Special case for all evidence view
        evidence={evidence}
        onEvidenceCreated={fetchEvidence}
      />
    </div>
  );
}
