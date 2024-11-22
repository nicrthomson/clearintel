import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const caseId = parseInt(params.id);
    if (isNaN(caseId)) {
      return new NextResponse("Invalid case ID", { status: 400 });
    }

    const notes = await prisma.note.findMany({
      where: {
        case_id: caseId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("[NOTES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const { title, content } = json;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        case_id: parseInt(params.id),
        user_id: session.user.id,
      },
      include: {
        user: true,
      },
    });

    // Add audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "NOTE",
        resourceId: note.id.toString(),
        details: {
          title,
          content: content.substring(0, 100),
          caseId: parseInt(params.id),
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 