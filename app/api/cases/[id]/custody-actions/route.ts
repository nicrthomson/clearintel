import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    if (isNaN(caseId)) {
      return new NextResponse("Invalid case ID", { status: 400 })
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

    const actions = await prisma.caseAction.findMany({
      where: {
        case_id: caseId,
      },
      orderBy: {
        order: 'asc',
      },
    })

    return NextResponse.json(actions)
  } catch (error) {
    console.error("[CASE_ACTIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description } = json

    const action = await prisma.caseAction.create({
      data: {
        name,
        description,
        case_id: parseInt(params.id),
      },
    })

    // Add audit log for custody action creation
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "CUSTODY_ACTION",
        resourceId: action.id.toString(),
        details: { 
          name, 
          description,
          caseId: parseInt(params.id)
        },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    })

    return NextResponse.json(action)
  } catch (error) {
    console.error("[CASE_ACTION_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
