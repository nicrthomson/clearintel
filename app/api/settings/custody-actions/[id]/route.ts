import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return new NextResponse("Invalid ID", { status: 400 })
    }

    // Check if action exists and belongs to user's organization
    const action = await prisma.caseAction.findFirst({
      where: {
        id,
        case: {
          user: {
            organization_id: session.user.organization_id
          }
        }
      },
    })

    if (!action) {
      return new NextResponse("Action not found", { status: 404 })
    }

    await prisma.caseAction.delete({
      where: {
        id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CASE_ACTION_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
