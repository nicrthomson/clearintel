import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    // For organization templates, filter by organization_id and optionally by type
    const templates = await prisma.qATemplate.findMany({
      where: {
        organization_id: session.user.organization_id,
        ...(type && type !== "all" ? {
          type: type.toUpperCase() as "ORGANIZATION" | "USER",
          ...(type.toUpperCase() === "USER" ? { user_id: session.user.id } : {})
        } : {})
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

    // Log the results for debugging
    console.log(`Found ${templates.length} templates for organization ${session.user.organization_id}`)
    templates.forEach(template => {
      console.log(`- ${template.name} (${template.type}): ${template.checklistItems.length} items`)
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("[QA_TEMPLATES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organization_id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const data = await request.json()

    // Create the template
    const template = await prisma.qATemplate.create({
      data: {
        name: data.name,
        type: data.type,
        organization_id: session.user.organization_id,
        ...(data.type === "USER" ? {
          user_id: session.user.id
        } : {})
      },
    })

    // Create checklist items if provided
    if (data.checklistItems?.length > 0) {
      await prisma.qAChecklistItem.createMany({
        data: data.checklistItems.map((item: any, index: number) => ({
          name: item.name,
          description: item.description || null,
          category: item.category,
          required: item.required || false,
          order: index,
          organization_id: session.user.organization_id,
          template_id: template.id,
        })),
      })
    }

    // Return the template with its checklist items
    const templateWithItems = await prisma.qATemplate.findUnique({
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

    return NextResponse.json(templateWithItems)
  } catch (error) {
    console.error("[QA_TEMPLATES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
