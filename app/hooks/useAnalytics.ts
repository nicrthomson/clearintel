"use client";

import { useState, useEffect } from "react";

interface CaseStats {
  status: string;
  _count: number;
}

interface EvidenceTypeStats {
  typeName: string;
  _count: number;
}

interface EvidenceTimelineStats {
  date: string;
  count: number;
}

interface AnalyticsData {
  caseStats: CaseStats[];
  evidenceTypeStats: EvidenceTypeStats[];
  evidenceTimeline: EvidenceTimelineStats[];
}

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return { data, loading };
} 