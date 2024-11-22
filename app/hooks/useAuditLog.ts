"use client";

export function useAuditLog() {
  const logAction = async (data: {
    action: string;
    resourceType: string;
    resourceId: string | number;
    details?: Record<string, any>;
  }) => {
    try {
      await fetch("/api/audit-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  };

  return { logAction };
} 