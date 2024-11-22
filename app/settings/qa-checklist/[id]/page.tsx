import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QATemplateEditor } from "@/components/Settings/QAChecklist/QATemplateEditor"
import { QATemplate, QAChecklistItem } from "@/lib/types/qa"

interface QAChecklistPageProps {
  params: {
    id: string
  }
}

async function getTemplate(id: string): Promise<QATemplate | null> {
  const template = await prisma.qATemplate.findUnique({
    where: { id: parseInt(id) },
    include: {
      checklistItems: {
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
        ],
      },
    },
  })

  if (!template) return null

  return {
    ...template,
    type: template.type as "ORGANIZATION" | "USER",
    checklistItems: template.checklistItems.map(item => ({
      ...item,
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    })),
    createdAt: template.createdAt || new Date(),
    updatedAt: template.updatedAt || new Date(),
  }
}

export default async function QAChecklistPage({ params }: QAChecklistPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.organization_id) return null

  const template = await getTemplate(params.id)
  if (!template) return null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Template</h3>
        <p className="text-sm text-muted-foreground">
          Edit your quality assurance template and checklist items.
        </p>
      </div>

      <QATemplateEditor template={template} />
    </div>
  )
}
