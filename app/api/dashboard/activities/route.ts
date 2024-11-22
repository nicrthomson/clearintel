import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        organization_id: session.user.organization_id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error("[AUDIT_LOGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}