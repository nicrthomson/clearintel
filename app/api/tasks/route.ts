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
    const limit = parseInt(searchParams.get("limit") || "5");
    const status = searchParams.get("status");

    const where = {
      case: {
        organization_id: session.user.organization_id
      }
    } as any;

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        case: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: limit
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 