import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAllDefaultTemplates } from "@/lib/defaultQATemplates"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const organizationId = session.user.organization_id
    const defaultTemplates = getAllDefaultTemplates()

    // Create all templates in a transaction
    const createdTemplates = await prisma.$transaction(async (tx) => {
      const results = []

      for (const template of defaultTemplates) {
        // Check if template already exists
        const existing = await tx.qATemplate.findFirst({
          where: {
            organization_id: organizationId,
            name: template.name,
          },
        })

        if (!existing) {
          // Create template
          const createdTemplate = await tx.qATemplate.create({
            data: {
              name: template.name,
              type: template.type,
              organization: {
                connect: {
                  id: organizationId,
                },
              },
            },
          })

          // Create checklist items
          await tx.qAChecklistItem.createMany({
            data: template.checklistItems.map(item => ({
              name: item.name,
              description: item.description || null,
              category: item.category,
              required: item.required || false,
              order: item.order,
              organization_id: organizationId,
              template_id: createdTemplate.id,
            })),
          })

          // Fetch complete template with items
          const completeTemplate = await tx.qATemplate.findUnique({
            where: { id: createdTemplate.id },
            include: {
              checklistItems: {
                orderBy: [
                  { category: 'asc' },
                  { order: 'asc' },
                ],
              },
            },
          })

          if (completeTemplate) {
            results.push(completeTemplate)
          }
        }
      }

      return results
    })

    return NextResponse.json({
      message: `Created ${createdTemplates.length} default templates`,
      templates: createdTemplates,
    })
  } catch (error) {
    console.error("[QA_TEMPLATES_CREATE_DEFAULTS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
