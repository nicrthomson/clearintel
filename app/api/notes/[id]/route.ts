import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as db from "@/lib/db/index"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()
    await db.updateNote(parseInt(params.id), data)

    const updatedNote = await db.getNotesByCaseId(data.caseId)
    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Error in PATCH /api/notes/[id]:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await db.deleteNote(parseInt(params.id))
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error in DELETE /api/notes/[id]:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const noteId = parseInt(params.id);
    if (isNaN(noteId)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid note ID" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const json = await request.json();
    const { title, content } = json;

    if (!title || !content) {
      return new NextResponse(
        JSON.stringify({ error: "Title and content are required" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const note = await prisma.note.update({
      where: {
        id: noteId,
        user_id: session.user.id,
      },
      data: {
        title,
        content,
      },
      include: {
        user: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "NOTE",
        resourceId: note.id.toString(),
        details: { 
          title,
          content: content.substring(0, 100)
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("[NOTES_PUT]", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
