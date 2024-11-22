import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const responseId = parseInt(params.responseId)

    // Delete the specific response
    await prisma.qAChecklistResponse.delete({
      where: {
        id: responseId,
        case_id: caseId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QA_RESPONSE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const responseId = parseInt(params.responseId)
    const data = await request.json()

    const response = await prisma.qAChecklistResponse.update({
      where: {
        id: responseId,
        case_id: caseId,
      },
      data: {
        completed: data.completed,
        notes: data.notes,
        ...(data.completed ? {
          completedBy: {
            connect: {
              id: session.user.id,
            },
          },
        } : {}),
      },
      include: {
        checklistItem: true,
        completedBy: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("[QA_RESPONSE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
