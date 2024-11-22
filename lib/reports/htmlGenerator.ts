import { promises as fs } from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import type { CaseData } from '../types/case'
import { ReportTemplate, User } from '@prisma/client'

interface GenerateHTMLReportParams {
  template: ReportTemplate & {
    sections: any[]
    metadata: any
  }
  variables: Record<string, any>
  outputPath: string
  case: CaseData
  user: User
}

export async function generateHTMLReport({
  template,
  variables,
  outputPath,
  case: caseData,
  user
}: GenerateHTMLReportParams): Promise<void> {
  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  // Generate HTML content
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${template.name}</title>
      <style>
        ${template.metadata.styling.css || defaultCSS}
      </style>
    </head>
    <body>
      ${template.sections.map(section => {
        const compile = Handlebars.compile(section.content)
        return compile({
          ...variables,
          case: caseData,
          user,
          currentDate: new Date().toLocaleDateString(),
          organization: user.organization_id ? user.organization_id : null
        })
      }).join('\n')}
    </body>
    </html>
  `

  // Save the HTML file
  await fs.writeFile(outputPath, html, 'utf-8')
}

const defaultCSS = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1, h2, h3 { color: #333; }
  .info-list {
    list-style: none;
    padding: 0;
  }
  .info-list li {
    margin-bottom: 8px;
  }
` 