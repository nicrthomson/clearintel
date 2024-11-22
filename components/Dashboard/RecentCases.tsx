"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Case {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  evidenceCount: number;
}

export function RecentCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/cases?limit=5')
      .then(res => res.json())
      .then(setCases);
  }, []);

  return (
    <div className="space-y-4">
      {cases.map(case_ => (
        <div
          key={case_.id}
          className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
          onClick={() => router.push(`/case/${case_.id}`)}
        >
          <div>
            <p className="font-medium">{case_.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(case_.createdAt)} • {case_.evidenceCount} items
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {case_.status}
          </div>
        </div>
      ))}
    </div>
  );
} 