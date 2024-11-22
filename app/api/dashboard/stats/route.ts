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
    const [totalCases, totalEvidence, pendingTasks] = await Promise.all([
      prisma.case.count({
        where: {
          organization_id: session.user.organization_id,
          status: { not: "Closed" }
        }
      }),
      prisma.evidence.count({
        where: {
          case: {
            organization_id: session.user.organization_id
          }
        }
      }),
      prisma.task.count({
        where: {
          case: {
            organization_id: session.user.organization_id
          },
          status: "Pending"
        }
      })
    ]);

    return NextResponse.json({
      totalCases,
      totalEvidence,
      pendingTasks
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 