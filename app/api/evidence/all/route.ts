import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { serializeBigInt } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evidence = await prisma.evidence.findMany({
      where: {
        case: {
          user_id: session.user.id,
          organization_id: session.user.organization_id,
        },
      },
      include: {
        type: true,
        case: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(serializeBigInt({ evidence }));
  } catch (error) {
    console.error("[EVIDENCE_GET_ALL]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
