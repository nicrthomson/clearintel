import { Suspense } from "react"
import { QATemplatesWrapper } from "@/components/Settings/QAChecklist/QATemplatesWrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { QATemplate } from "@/lib/types/qa"
import { headers } from "next/headers"

async function getTemplates(organizationId: number): Promise<QATemplate[]> {
  console.log('Fetching templates for organization:', organizationId);

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

  console.log(`Found ${templates.length} templates`);
  templates.forEach(template => {
    console.log(`- ${template.name} (${template.type}): ${template.checklistItems.length} items`);
  });

  // Ensure all templates have the correct type
  const typedTemplates: QATemplate[] = templates.map(template => ({
    ...template,
    type: template.type as "ORGANIZATION" | "USER",
  }))

  return typedTemplates
}

export default async function QAChecklistPage() {
  const session = await getServerSession(authOptions)
  console.log('Session:', {
    userId: session?.user?.id,
    organizationId: session?.user?.organization_id,
  });

  if (!session?.user?.organization_id) {
    console.log('No organization ID found in session');
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please log in to view QA templates.</p>
      </div>
    );
  }

  const templates = await getTemplates(session.user.organization_id)
  console.log('Templates loaded:', templates.length);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">QA Templates</h3>
        <p className="text-sm text-muted-foreground">
          Manage your quality assurance templates and checklist items.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <QATemplatesWrapper templates={templates} />
      </Suspense>
    </div>
  )
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0
