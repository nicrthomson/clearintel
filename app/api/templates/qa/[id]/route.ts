import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const template = await request.json()
    const templateId = parseInt(params.id)

    // Update template
    const updatedTemplate = await prisma.qATemplate.update({
      where: { 
        id: templateId,
        organization_id: session.user.organization_id,
      },
      data: {
        name: template.name,
        type: template.type,
        ...(template.type === "USER" ? {
          user: {
            connect: {
              id: session.user.id
            }
          }
        } : {
          user: {
            disconnect: true
          }
        })
      },
    })

    // Delete existing checklist items
    await prisma.qAChecklistItem.deleteMany({
      where: {
        template_id: templateId,
      },
    })

    // Create new checklist items
    if (template.checklistItems?.length > 0) {
      await prisma.qAChecklistItem.createMany({
        data: template.checklistItems.map((item: any, index: number) => ({
          name: item.name,
          description: item.description || null,
          category: item.category,
          required: item.required || false,
          order: index,
          organization_id: session.user.organization_id,
          template_id: templateId,
        })),
      })
    }

    // Return the updated template with its checklist items
    const templateWithItems = await prisma.qATemplate.findUnique({
      where: { id: templateId },
      include: {
        checklistItems: {
          orderBy: [
            { category: 'asc' },
            { order: 'asc' },
          ],
        },
      },
    })

    return NextResponse.json(templateWithItems)
  } catch (error) {
    console.error("[QA_TEMPLATE_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const templateId = parseInt(params.id)

    // Delete checklist items first
    await prisma.qAChecklistItem.deleteMany({
      where: {
        template_id: templateId,
      },
    })

    // Delete template
    await prisma.qATemplate.delete({
      where: {
        id: templateId,
        organization_id: session.user.organization_id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[QA_TEMPLATE_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
