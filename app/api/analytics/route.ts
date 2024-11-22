import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [caseStats, evidenceTypeStats, activityStats, evidenceTimeline] = await Promise.all([
      prisma.case.groupBy({
        by: ['status'],
        _count: true,
        where: {
          organization_id: session.user.organization_id
        }
      }),
      prisma.evidence.groupBy({
        by: ['type_id'],
        _count: true,
        _sum: {
          size: true
        },
        where: {
          case: {
            organization_id: session.user.organization_id
          }
        }
      }),
      prisma.activity.groupBy({
        by: ['description'],
        _count: true,
        where: {
          case: {
            organization_id: session.user.organization_id
          }
        },
        orderBy: {
          description: 'desc'
        },
        take: 5
      }),
      prisma.evidence.groupBy({
        by: ['createdAt'],
        _count: true,
        where: {
          case: {
            organization_id: session.user.organization_id
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ]);

    const evidenceTypes = await prisma.evidenceType.findMany({
      where: {
        organization_id: session.user.organization_id
      }
    });

    const typeNameMap = new Map(evidenceTypes.map(type => [type.id, type.name]));

    return NextResponse.json(serializeBigInt({
      caseStats: caseStats.map(stat => ({
        status: stat.status,
        _count: stat._count
      })),
      evidenceTypeStats: evidenceTypeStats.map(stat => ({
        type_id: stat.type_id,
        typeName: typeNameMap.get(stat.type_id) || 'Unknown',
        _count: stat._count,
        _sum: { size: stat._sum.size }
      })),
      activityStats,
      evidenceTimeline: evidenceTimeline.map(item => ({
        date: item.createdAt,
        count: item._count
      }))
    }));
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 