import jsPDF from 'jspdf'
import { promises as fs } from 'fs'
import path from 'path'
import Handlebars from 'handlebars'
import type { CaseData } from '../types/case'
import { ReportTemplate, User } from '@prisma/client'

interface GeneratePDFReportParams {
  template: ReportTemplate & {
    sections: any[]
    metadata: any
  }
  variables: Record<string, any>
  outputPath: string
  case: CaseData
  user: User
}

export async function generatePDFReport({
  template,
  variables,
  outputPath,
  case: caseData,
  user
}: GeneratePDFReportParams): Promise<void> {
  // Ensure output directory exists
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Load Helvetica fonts
  doc.addFont('public/fonts/Helvetica.ttf', 'Helvetica', 'normal')
  doc.addFont('public/fonts/Helvetica-Bold.ttf', 'Helvetica', 'bold')
  doc.addFont('public/fonts/Helvetica-Oblique.ttf', 'Helvetica', 'italic')
  doc.addFont('public/fonts/Helvetica-BoldOblique.ttf', 'Helvetica', 'bolditalic')

  // Set default font
  doc.setFont('Helvetica', 'normal')
  
  // Initialize position
  let y = 20
  const margin = 20
  const pageWidth = doc.internal.pageSize.width
  const maxWidth = pageWidth - (margin * 2)

  // Compile and process each section
  for (const section of template.sections) {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    // Compile section content with Handlebars
    const compile = Handlebars.compile(section.content)
    const content = compile({
      ...variables,
      case: caseData,
      user,
      currentDate: new Date().toLocaleDateString(),
      organization: user.organization_id ? user.organization_id : null
    })

    // Apply section styling
    if (section.title) {
      doc.setFont('Helvetica', 'bold')
      doc.setFontSize(template.metadata.styling.headerSize || 16)
      doc.text(section.title, margin, y)
      y += 10
    }

    // Process content
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(template.metadata.styling.fontSize || 11)
    
    // Split content into lines and render
    const lines = doc.splitTextToSize(content, maxWidth)
    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += template.metadata.styling.lineHeight || 7
    })

    y += 10 // Add spacing between sections
  }

  // Save the PDF
  const pdfBytes = doc.output()
  await fs.writeFile(outputPath, pdfBytes, 'binary')
} 