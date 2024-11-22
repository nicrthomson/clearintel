import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const organizationId = session.user.organization_id

    const data = await request.json()
    const templateId = data.templateId

    // Get the source template with its checklist items
    const sourceTemplate = await prisma.qATemplate.findUnique({
      where: { id: templateId },
      include: {
        checklistItems: true,
      },
    })

    if (!sourceTemplate) {
      return new NextResponse("Template not found", { status: 404 })
    }

    if (sourceTemplate.organization_id !== organizationId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create new template with copied data
    const newTemplate = await prisma.$transaction(async (prisma) => {
      // First create the template
      const template = await prisma.qATemplate.create({
        data: {
          name: `${sourceTemplate.name} (Copy)`,
          organization_id: organizationId,
        },
      })

      // Then create the checklist items
      await Promise.all(
        sourceTemplate.checklistItems.map((item) =>
          prisma.qAChecklistItem.create({
            data: {
              name: item.name,
              description: item.description,
              category: item.category,
              required: item.required,
              order: item.order,
              organization_id: organizationId,
              template_id: template.id,
            },
          })
        )
      )

      // Return the template with its items
      return prisma.qATemplate.findUnique({
        where: { id: template.id },
        include: {
          checklistItems: {
            orderBy: [
              { category: 'asc' },
              { order: 'asc' },
            ],
          },
        },
      })
    })

    return NextResponse.json(newTemplate)
  } catch (error) {
    console.error("[QA_TEMPLATE_DUPLICATE] Error:", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
