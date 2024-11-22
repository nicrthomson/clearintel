import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { Session } from "next-auth"
import { authOptions } from "@/lib/auth"
import { defaultHTMLTemplate } from "./default"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const templates = await prisma.reportTemplate.findMany({
      where: {
        OR: [
          { organizationId: session.user.organization_id || undefined },
          { organizationId: 0 }
        ],
        type: 'html'
      }
    })

    const now = new Date()

    const processedTemplates = templates.map(template => ({
      ...template,
      metadata: typeof template.metadata === 'string' ? JSON.parse(template.metadata) : template.metadata,
      sections: typeof template.sections === 'string' ? JSON.parse(template.sections) : template.sections
    }))

    const hasHTMLTemplate = processedTemplates.length > 0
    if (!hasHTMLTemplate) {
      processedTemplates.push({
        ...defaultHTMLTemplate,
        id: -1,
        createdAt: now,
        updatedAt: now,
        metadata: defaultHTMLTemplate.metadata,
        sections: defaultHTMLTemplate.sections,
        description: defaultHTMLTemplate.description || null,
        organizationId: session.user.organization_id || null,
        version: defaultHTMLTemplate.metadata.version
      })
    }

    return new NextResponse(
      JSON.stringify(processedTemplates), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error("API Error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
