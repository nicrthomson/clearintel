import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QAChecklistItem, Prisma } from "@prisma/client"

interface ChecklistItemInput {
  name: string
  description?: string | null
  category: string
  required?: boolean
  order: number
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const organizationId = session?.user?.organization_id
    if (!organizationId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { items } = await request.json() as { items: ChecklistItemInput[] }

    // Find existing items first
    const existingItems = await prisma.qAChecklistItem.findMany({
      where: {
        organization_id: organizationId,
        template_id: null,
        name: {
          in: items.map(item => item.name)
        },
        category: {
          in: items.map(item => item.category)
        }
      }
    })

    // Filter out items that already exist
    const newItems = items.filter(item => 
      !existingItems.some(existing => 
        existing.name === item.name && 
        existing.category === item.category
      )
    )

    // Create only new items
    let createdItems: QAChecklistItem[] = []
    if (newItems.length > 0) {
      const result = await prisma.qAChecklistItem.createMany({
        data: newItems.map(item => ({
          name: item.name,
          description: item.description || null,
          category: item.category,
          required: item.required || false,
          order: item.order,
          organization_id: organizationId,
          value: null,
          notes: null,
        })),
        skipDuplicates: true,
      })

      // Fetch the newly created items
      if (result.count > 0) {
        const newlyCreated = await prisma.qAChecklistItem.findMany({
          where: {
            organization_id: organizationId,
            template_id: null,
            name: {
              in: newItems.map(item => item.name)
            },
            category: {
              in: newItems.map(item => item.category)
            }
          }
        })
        createdItems = newlyCreated
      }
    }

    // Return both existing and newly created items
    const allItems = [...existingItems, ...createdItems]

    // Sort items by order
    allItems.sort((a, b) => a.order - b.order)

    return NextResponse.json(allItems)
  } catch (error) {
    console.error("[QA_CHECKLIST_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const organizationId = session?.user?.organization_id
    if (!organizationId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const items = await prisma.qAChecklistItem.findMany({
      where: {
        organization_id: organizationId,
        template_id: null,
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
      ],
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("[QA_CHECKLIST_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
