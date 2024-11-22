import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { defaultHTMLTemplate } from "./default";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.reportTemplate.findMany({
      where: {
        OR: [
          { organizationId: session.user.organization_id || undefined },
          { organizationId: 0 }
        ],
        type: 'html'
      }
    });

    const now = new Date();

    const processedTemplates = templates.map(template => ({
      ...template,
      metadata: typeof template.metadata === 'string' ? JSON.parse(template.metadata) : template.metadata,
      sections: typeof template.sections === 'string' ? JSON.parse(template.sections) : template.sections
    }));

    const hasHTMLTemplate = processedTemplates.length > 0;
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
      });
    }

    return NextResponse.json(processedTemplates);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
