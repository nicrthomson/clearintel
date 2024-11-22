import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as db from "@/lib/db/index"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("caseId")

    if (!caseId) {
      return new NextResponse("Case ID is required", { status: 400 })
    }

    const notes = await db.getNotesByCaseId(parseInt(caseId))
    
    // Convert BigInt to Number before serializing
    const serializedNotes = JSON.parse(JSON.stringify(notes, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value
    ))
    
    return NextResponse.json(serializedNotes)
  } catch (error) {
    console.error("Error in GET /api/notes:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const { content, caseId, title } = json;

    if (!content || !caseId || !title) {
      return new NextResponse(
        JSON.stringify({ error: "Content, title, and case ID are required" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        case_id: parseInt(caseId),
        user_id: session.user.id,
      },
      include: {
        user: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "NOTE",
        resourceId: note.id.toString(),
        details: { 
          title,
          content: content.substring(0, 100),
          caseId: parseInt(caseId)
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_POST]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}