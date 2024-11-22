import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  action,
  resourceType,
  resourceId,
  details,
  userId,
  organizationId,
}: {
  action: string;
  resourceType: string;
  resourceId: string | number;
  details?: Record<string, any>;
  userId: number;
  organizationId: number;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId: resourceId.toString(),
        details,
        user_id: userId,
        organization_id: organizationId,
      },
    });
  } catch (error) {
    console.error("[CREATE_AUDIT_LOG]", error);
  }
} 