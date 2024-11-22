import { prisma } from "@/lib/prisma"
import { ReportTemplate, ReportData, CaseWithRelations } from "@/lib/types/report"
import Handlebars from "handlebars"

export async function generateReport(
  template: ReportTemplate,
  caseId: number,
  userId: number
): Promise<{ content: string; type: string }> {
  // Get case data with relations
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      user: true,
      evidence: {
        include: {
          type: true,
          chainOfCustody: {
            include: {
              user: true
            }
          }
        }
      },
      activities: {
        include: {
          user: true
        }
      },
      notes: {
        include: {
          user: true
        }
      },
      tasks: {
        include: {
          assignedTo: true
        }
      }
    }
  }) as CaseWithRelations | null

  if (!caseData) {
    throw new Error("Case not found")
  }

  // Get user and organization
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user?.organization_id) {
    throw new Error("User or organization not found")
  }

  const organization = await prisma.organization.findUnique({
    where: { id: user.organization_id }
  })

  if (!organization) {
    throw new Error("Organization not found")
  }

  // Prepare template data
  const data: ReportData = {
    case: caseData,
    user,
    organization,
    currentDate: new Date().toLocaleDateString()
  }

  // Compile and render each section
  const compiledSections = template.sections.map(section => {
    const compiledTemplate = Handlebars.compile(section.content)
    return {
      ...section,
      content: compiledTemplate(data)
    }
  })

  // Join sections based on template type
  let content: string
  if (template.type === 'html') {
    content = `
      <style>${template.metadata.styling.css || ''}</style>
      ${compiledSections.map(s => s.content).join('\n')}
    `
  } else {
    content = compiledSections.map(s => s.content).join('\n\n')
  }

  return {
    content,
    type: template.type
  }
}
