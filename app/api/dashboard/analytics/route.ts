import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [evidenceTimeline] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE_TRUNC('day', "created_at") as date,
               COUNT(*) as count
        FROM evidence
        WHERE organization_id = ${session.user.organization_id}
        GROUP BY DATE_TRUNC('day', "created_at")
        ORDER BY date DESC
        LIMIT 30
      `
    ]);

    return NextResponse.json({
      evidenceTimeline
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
