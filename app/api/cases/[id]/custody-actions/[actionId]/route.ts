import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; actionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const actionId = parseInt(params.actionId)
    if (isNaN(caseId) || isNaN(actionId)) {
      return new NextResponse("Invalid ID", { status: 400 })
    }

    // Check if case exists and belongs to user
    const caseExists = await prisma.case.findFirst({
      where: {
        id: caseId,
        user_id: session.user.id,
      },
    })

    if (!caseExists) {
      return new NextResponse("Case not found", { status: 404 })
    }

    // Check if action exists and belongs to case
    const action = await prisma.caseAction.findFirst({
      where: {
        id: actionId,
        case_id: caseId,
      },
    })

    if (!action) {
      return new NextResponse("Action not found", { status: 404 })
    }

    await prisma.caseAction.delete({
      where: {
        id: actionId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[CASE_ACTION_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; actionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const actionId = parseInt(params.actionId)
    if (isNaN(caseId) || isNaN(actionId)) {
      return new NextResponse("Invalid ID", { status: 400 })
    }

    // Check if case exists and belongs to user
    const caseExists = await prisma.case.findFirst({
      where: {
        id: caseId,
        user_id: session.user.id,
      },
    })

    if (!caseExists) {
      return new NextResponse("Case not found", { status: 404 })
    }

    const json = await request.json()
    const { name, description, order } = json

    const action = await prisma.caseAction.update({
      where: {
        id: actionId,
      },
      data: {
        name,
        description,
        order,
      },
    })

    return NextResponse.json(action)
  } catch (error) {
    console.error("[CASE_ACTION_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
