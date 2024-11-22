import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const caseId = searchParams.get("caseId");

    const where = {
      organization_id: session.user.organization_id,
      OR: [
        { resourceType: "CASE", resourceId: caseId },
        { details: { path: ['caseId'], equals: parseInt(caseId || "0") } }
      ]
    } as any;

    const resourceType = searchParams.get("resourceType");
    const action = searchParams.get("action");

    if (resourceType && resourceType !== 'ALL') {
      where.resourceType = resourceType;
    }
    if (action && action !== 'ALL') where.action = action;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      logs,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[AUDIT_LOG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organization_id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, resourceType, resourceId, details } = body;

    const log = await prisma.auditLog.create({
      data: {
        action,
        resourceType,
        resourceId: resourceId.toString(),
        details,
        user_id: session.user.id,
        organization_id: session.user.organization_id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error("[AUDIT_LOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 