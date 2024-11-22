import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const actions = await prisma.caseAction.findMany({
      where: {
        case: {
          user: {
            organization_id: session.user.organization_id
          }
        }
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await request.json()
    const { name, description, case_id } = json

    if (!case_id) {
      return new NextResponse("Case ID is required", { status: 400 })
    }

    // Verify case belongs to user's organization
    const caseExists = await prisma.case.findFirst({
      where: {
        id: case_id,
        user: {
          organization_id: session.user.organization_id
        }
      }
    })

    if (!caseExists) {
      return new NextResponse("Case not found", { status: 404 })
    }

    // Get max order for this case
    const maxOrder = await prisma.caseAction.findFirst({
      where: {
        case_id,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    })

    const action = await prisma.caseAction.create({
      data: {
        name,
        description,
        case_id,
        order: (maxOrder?.order || 0) + 1,
      },
    })

    // Add audit log for custody action creation
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resourceType: "CUSTODY_ACTION",
        resourceId: action.id.toString(),
        details: { name, description, case_id },
        user_id: session.user.id,
        organization_id: session.user.organization_id || 0,
      },
    });

    return NextResponse.json(action)
  } catch (error) {
    console.error("[CASE_ACTION_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
