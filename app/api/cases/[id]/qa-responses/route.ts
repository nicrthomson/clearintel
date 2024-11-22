import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QAChecklistItem } from "@prisma/client"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(null, { status: 401 })
    }

    const caseId = parseInt(params.id)
    if (isNaN(caseId)) {
      return new NextResponse(null, { status: 400 })
    }

    const responses = await prisma.qAChecklistResponse.findMany({
      where: {
        case_id: caseId,
      },
      include: {
        checklistItem: true,
        completedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          checklistItem: {
            category: 'asc',
          },
        },
        {
          checklistItem: {
            order: 'asc',
          },
        },
      ],
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching QA responses:', error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(null, { status: 401 })
    }

    const caseId = parseInt(params.id)
    if (isNaN(caseId)) {
      return new NextResponse(null, { status: 400 })
    }

    const body = await req.json()
    const { templateId, checklistItemId } = body

    // If templateId is provided, apply template
    if (templateId) {
      const template = await prisma.qATemplate.findUnique({
        where: { id: templateId },
        include: {
          checklistItems: {
            orderBy: { order: 'asc' },
          },
        },
      })

      if (!template) {
        return new NextResponse(null, { status: 404 })
      }

      // Create responses for each checklist item
      const responses = await prisma.$transaction(
        template.checklistItems.map((item: QAChecklistItem) =>
          prisma.qAChecklistResponse.create({
            data: {
              case_id: caseId,
              checklist_item_id: item.id,
              completed: false,
              completed_by: session.user.id,
              value: '', // Required by schema
            },
          })
        )
      )

      return NextResponse.json(responses)
    }
    
    // If checklistItemId is provided, create single response
    if (checklistItemId) {
      const response = await prisma.qAChecklistResponse.create({
        data: {
          case_id: caseId,
          checklist_item_id: checklistItemId,
          completed: false,
          completed_by: session.user.id,
          value: '', // Required by schema
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
    }

    return new NextResponse("Either templateId or checklistItemId must be provided", { status: 400 })
  } catch (error) {
    console.error('Error creating QA responses:', error)
    return new NextResponse(null, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(null, { status: 401 })
    }

    const caseId = parseInt(params.id)
    if (isNaN(caseId)) {
      return new NextResponse(null, { status: 400 })
    }

    await prisma.qAChecklistResponse.deleteMany({
      where: {
        case_id: caseId,
      },
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error('Error deleting QA responses:', error)
    return new NextResponse(null, { status: 500 })
  }
}
