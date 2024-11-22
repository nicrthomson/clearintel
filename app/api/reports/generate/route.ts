import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Handlebars from "handlebars"
import { defaultHTMLTemplate } from "../templates/default"
import fs from 'fs/promises'
import path from 'path'

// Register Handlebars helpers
Handlebars.registerHelper({
  'not': function(value) {
    return !value;
  },
  'or': function() {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  'and': function() {
    return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
  },
  'eq': function(a, b) {
    return a === b;
  }
});

Handlebars.registerHelper('getImageUrl', function(filePath) {
  if (!filePath) return '';
  // Convert absolute path to relative path with proper parent directory traversal
  const filename = path.basename(filePath);
  return `/uploads/evidence/${filename}`;   
});

function serializeBigInt(data: any): any {
  if (typeof data === 'bigint') {
    return Number(data)
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeBigInt)
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    )
  }
  
  return data
}

const defaultCSS = `
  @font-face {
    font-family: 'Helvetica';
    src: url('/fonts/Helvetica.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Helvetica';
    src: url('/fonts/Helvetica-Bold.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

  @import url('https://fonts.googleapis.com/css2?family=Whisper&display=swap');
  
  body {
    font-family: 'Helvetica', sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1, h2, h3 {
    font-family: 'Helvetica', sans-serif;
    font-weight: bold;
    color: #2c3e50;
    margin-top: 1.5em;
  }
  
  .info-list {
    list-style: none;
    padding: 0;
  }
  
  .info-list li {
    margin-bottom: 0.5em;
  }
  
  .evidence-item, .activity, .note {
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 4px;
  }
  
  .chain-of-custody {
    margin-top: 10px;
    padding: 10px;
    background: #f8f9fa;
  }
  
  .signature-section {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 2px solid #ddd;
  }
  
  .typed-signature {
    margin: 30px 0;
  }
  
  .signature-text {
    font-family: 'Whisper', cursive;
    font-size: 36px;
    color: #000;
    border-bottom: 1px solid #000;
    display: inline-block;
    padding: 0 20px 5px;
  }
  
  .examiner-title {
    font-weight: bold;
    margin: 10px 0 5px;
  }
  
  .organization {
    color: #666;
    margin-bottom: 10px;
  }
  
  .contact-info {
    font-size: 0.9em;
    color: #666;
    margin-top: 15px;
  }

  .evidence-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }

  .gallery-item {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
  }

  .gallery-item img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 2px;
  }

  .gallery-item .caption {
    margin-top: 8px;
    font-size: 0.9em;
    color: #666;
    text-align: center;
  }
`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Full request body:', body)
    console.log('Options from request:', body.options)

    const { templateId, caseId } = body

    // Get template data first to determine file type
    let template
    if (templateId === -1 || templateId === -2) {
      template = {
        ...defaultHTMLTemplate,
        css: defaultCSS,
        type: 'html'
      };
    } else {
      const dbTemplate = await prisma.reportTemplate.findUnique({
        where: { id: templateId }
      });
      if (!dbTemplate) {
        return new NextResponse(
          JSON.stringify({ error: "Template not found" }), 
          { status: 404 }
        );
      }
      template = {
        ...dbTemplate,
        type: dbTemplate.type,
        css: defaultCSS,
        metadata: typeof dbTemplate.metadata === 'string' ? JSON.parse(dbTemplate.metadata) : dbTemplate.metadata,
        sections: typeof dbTemplate.sections === 'string' ? JSON.parse(dbTemplate.sections) : dbTemplate.sections
      };
    }

    // First get case data
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        user: true,
        organization: true,
        evidence: {
          include: {
            type: true,
            evidenceLocation: true,
            chainOfCustody: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!caseData) {
      return new NextResponse(
        JSON.stringify({ error: "Case not found" }), 
        { status: 404 }
      )
    }

    // Then create directories and copy files
    const reportId = `report_${caseId}_${Date.now()}`
    const reportDir = path.join(process.cwd(), 'public', 'reports', reportId)
    await fs.mkdir(reportDir, { recursive: true })

    const evidenceDir = path.join(reportDir, 'uploads', 'evidence')
    await fs.mkdir(evidenceDir, { recursive: true })

    // Copy evidence files
    for (const evidence of caseData.evidence) {
      if (evidence.type.name === "Image" && evidence.filePath) {
        const sourcePath = path.join(process.cwd(), evidence.filePath)
        const destPath = path.join(evidenceDir, path.basename(evidence.filePath))
        try {
          await fs.copyFile(sourcePath, destPath)
        } catch (error) {
          console.error(`Failed to copy file ${sourcePath}:`, error)
        }
      }
    }

    // Use the template's type to determine file extension
    const fileType = template.type.toLowerCase()
    const fileName = `index.${fileType}`
    const filePath = path.join(reportDir, fileName)
    const publicPath = `/reports/${reportId}`

    // Generate HTML from selected template sections
    const htmlSections = template.sections
      .filter((section: any) => !body.sections || body.sections.includes(section.id))
      .map((section: any) => {
        const compiledTemplate = Handlebars.compile(section.content)
        const templateData = {
          case: caseData,
          user: session.user,
          organization: caseData.organization,
          currentDate: new Date().toLocaleDateString(),
          options: body.options
        }
        console.log('Section ID:', section.id)
        console.log('Template Data:', templateData)
        const result = compiledTemplate(templateData)
        console.log('Compiled Result:', result)
        return result
      })
      .join('\n')

    // Combine sections with CSS
    const finalHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${template.css}</style>
        </head>
        <body>
          ${htmlSections}
        </body>
      </html>
    `

    // Write HTML file
    await fs.writeFile(filePath, finalHTML, 'utf-8')

    let report;
    // For default templates, create a temporary template record
    if (templateId < 0) {
      const defaultTemplate = await prisma.reportTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          type: template.type,
          category: template.category,
          sections: template.sections,
          metadata: template.metadata,
          organizationId: session.user.organization_id
        }
      })

      report = await prisma.generatedReport.create({
        data: {
          name: fileName,
          fileType: fileType,
          filePath: publicPath,
          metadata: {
            generatedAt: new Date(),
            templateType: templateId < 0 ? 'default' : 'custom',
            sections: template.sections.length
          },
          user: {
            connect: {
              id: session.user.id
            }
          },
          case: {
            connect: {
              id: caseId
            }
          },
          template: {
            connect: {
              id: defaultTemplate.id
            }
          }
        },
        include: {
          user: true,
          case: true,
          template: true
        }
      })

      // Clean up the temporary template
      await prisma.reportTemplate.delete({
        where: { id: defaultTemplate.id }
      })
    } else {
      // For custom templates, connect to existing template
      report = await prisma.generatedReport.create({
        data: {
          name: fileName,
          fileType: fileType,
          filePath: publicPath,
          metadata: {
            generatedAt: new Date(),
            templateType: templateId < 0 ? 'default' : 'custom',
            sections: template.sections.length
          },
          user: {
            connect: {
              id: session.user.id
            }
          },
          case: {
            connect: {
              id: caseId
            }
          },
          template: {
            connect: {
              id: templateId
            }
          }
        },
        include: {
          user: true,
          case: true,
          template: true
        }
      })
    }

    // Serialize the response data
    const serializedReport = serializeBigInt(report)

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        report: serializedReport
      }), 
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
      JSON.stringify({ 
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
