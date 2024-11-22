"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Clock, User, FileText, CheckSquare, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  id: number;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface AuditLogFilters {
  resourceType?: string;
  action?: string;
  user_id?: string;
  startDate?: string;
  endDate?: string;
}

function getActionIcon(resourceType: string) {
  switch (resourceType) {
    case "EVIDENCE":
      return <FileText className="h-4 w-4" />;
    case "TASK":
      return <CheckSquare className="h-4 w-4" />;
    case "NOTE":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function formatAction(log: AuditLog): string {
  const actor = log.user.name || log.user.email;
  
  switch (log.action) {
    case "CREATE":
      return `${actor} created ${log.resourceType.toLowerCase()}`;
    case "UPDATE":
      return `${actor} updated ${log.resourceType.toLowerCase()}`;
    case "DELETE":
      return `${actor} deleted ${log.resourceType.toLowerCase()}`;
    case "COMPLETE":
      return `${actor} marked ${log.resourceType.toLowerCase()} as complete`;
    default:
      return `${actor} performed ${log.action} on ${log.resourceType.toLowerCase()}`;
  }
}

export function AuditLogs({ caseId }: { caseId: number }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  useEffect(() => {
    fetchLogs(page, filters);
  }, []);

  const fetchLogs = async (pageNum: number, filters: AuditLogFilters) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', pageNum.toString());
    params.append('resourceId', caseId.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(Math.ceil(data.total / 20));
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Select
            value={filters.resourceType}
            onValueChange={(value) => {
              setFilters({ ...filters, resourceType: value });
              setPage(1);
              fetchLogs(1, { ...filters, resourceType: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EVIDENCE">Evidence</SelectItem>
              <SelectItem value="TASK">Tasks</SelectItem>
              <SelectItem value="NOTE">Notes</SelectItem>
              <SelectItem value="CASE">Case</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.action}
            onValueChange={(value) => {
              setFilters({ ...filters, action: value });
              setPage(1);
              fetchLogs(1, { ...filters, action: value });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CREATE">Created</SelectItem>
              <SelectItem value="UPDATE">Updated</SelectItem>
              <SelectItem value="DELETE">Deleted</SelectItem>
              <SelectItem value="COMPLETE">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div>Loading audit logs...</div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1">{getActionIcon(log.resourceType)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{formatAction(log)}</p>
                  {log.details && (
                    <p className="text-sm text-muted-foreground">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <User className="h-3 w-3 inline-block mr-1" />
                    {log.user.name} • {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 