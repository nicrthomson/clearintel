import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const { items } = await request.json()

    // Create all responses in a single transaction
    const responses = await prisma.$transaction(
      items.map((item: any) => 
        prisma.qAChecklistResponse.create({
          data: {
            case: {
              connect: {
                id: caseId,
              },
            },
            checklistItem: {
              connect: {
                id: item.checklistItemId,
              },
            },
            completed: item.completed,
            notes: item.notes,
            value: "",
            completedBy: {
              connect: {
                id: session.user.id,
              },
            },
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
      )
    )

    return NextResponse.json(responses)
  } catch (error) {
    console.error("[QA_RESPONSES_BATCH_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
