"use client"

import { useEffect, useState } from "react";

interface EvidenceType {
  id: number;
  name: string;
  description: string | null;
  organization_id: number;
}

export function useEvidenceTypes() {
  const [types, setTypes] = useState<EvidenceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTypes() {
      try {
        console.log("[useEvidenceTypes] Starting fetch");
        setLoading(true);
        const response = await fetch("/api/evidence/types");
        console.log("[useEvidenceTypes] Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("[useEvidenceTypes] Error response:", errorText);
          throw new Error(errorText || "Failed to fetch evidence types");
        }
        
        const data = await response.json();
        console.log("[useEvidenceTypes] Fetched types:", data);
        setTypes(data);
        setError(null);
      } catch (err) {
        console.error("[useEvidenceTypes] Error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setTypes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTypes();
  }, []);

  return { types, loading, error };
}
