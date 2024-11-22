import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Get organization ID from query params
    const { searchParams } = new URL(request.url)
    const organizationId = parseInt(searchParams.get('org') || '1')

    console.log('Checking templates for organization:', organizationId)

    // Get all templates for the organization
    const templates = await prisma.qATemplate.findMany({
      where: {
        organization_id: organizationId,
      },
      include: {
        checklistItems: {
          orderBy: [
            { category: 'asc' },
            { order: 'asc' },
          ],
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    })

    // Get all users in the organization
    const users = await prisma.user.findMany({
      where: {
        organization_id: organizationId,
      },
      select: {
        id: true,
        email: true,
        organization_id: true,
        isOrgAdmin: true,
      },
    })

    console.log(`Found ${templates.length} templates`)
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.type}): ${template.checklistItems.length} items`)
      template.checklistItems.forEach(item => {
        console.log(`  - ${item.name} (${item.category})`)
      })
    })

    return NextResponse.json({
      organization,
      users,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        itemCount: template.checklistItems.length,
        items: template.checklistItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          required: item.required,
          order: item.order,
        })),
        categories: Array.from(new Set(template.checklistItems.map(item => item.category))),
      })),
      templateCount: templates.length,
    })
  } catch (error) {
    console.error("[DEBUG_QA_TEMPLATES]", error)
    return NextResponse.json({
      error: "Internal error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
