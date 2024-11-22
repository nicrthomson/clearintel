import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultHTMLTemplate } from "../templates/default";
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import Handlebars from 'handlebars';
import { registerHandlebarsHelpers } from "@/lib/handlebars-helpers";

export const dynamic = 'force-dynamic';

// Register Handlebars helpers at the start
registerHandlebarsHelpers();

function serializeBigInt(data: any): any {
  if (typeof data === 'bigint') {
    return Number(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }
  
  return data;
}

const defaultCSS = `
  /* Font Faces */
  @font-face {
    font-family: 'Helvetica';
    src: url('fonts/Helvetica.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Helvetica';
    src: url('fonts/Helvetica-Bold.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'SignatureFont';
    src: url('fonts/SignatureFont.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  /* Variables */
  :root {
    --primary-text: #1a1a1a;
    --secondary-text: #4a4a4a;
    --border-color: #e0e0e0;
    --background-light: #f8f8f8;
    --section-spacing: 2rem;
  }
  
  /* Base Styles */
  body {
    font-family: 'Helvetica', sans-serif;
    line-height: 1.8;
    color: var(--primary-text);
    max-width: 1200px;
    margin: 80px auto;
    padding: 40px;
    background: white;
  }
  
  /* Typography */
  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: var(--primary-text);
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
  }
  
  h2 {
    font-size: 2rem;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    color: var(--primary-text);
    page-break-before: always;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-top: 2rem;
    color: var(--secondary-text);
  }

  /* Document Properties */
  .document-meta {
    margin-bottom: 2rem;
  }

  .confidential-mark, .draft-mark {
    font-size: 1.2rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    margin: 1rem 0;
    border-radius: 4px;
    text-align: center;
  }

  .confidential-mark {
    background: #ffebee;
    color: #c62828;
    border: 2px solid #ef5350;
  }

  .draft-mark {
    background: #fff3e0;
    color: #ef6c00;
    border: 2px solid #ff9800;
  }

  /* Header & Footer */
  .page-header, .page-footer {
    position: fixed;
    left: 0;
    right: 0;
    padding: 1rem 2rem;
    background: white;
  }

  .page-header {
    top: 0;
    border-bottom: 1px solid var(--border-color);
  }

  .page-footer {
    bottom: 0;
    border-top: 1px solid var(--border-color);
  }

  .header-logo, .footer-logo {
    max-height: 50px;
    width: auto;
  }

  .header-text, .footer-text {
    margin: 0.5rem 0;
  }

  .page-number {
    font-size: 0.9rem;
    color: var(--secondary-text);
  }

  /* Table of Contents */
  .toc {
    background: var(--background-light);
    padding: 2rem;
    margin: 2rem 0;
    border-radius: 8px;
  }

  .toc-item {
    margin: 0.5rem 0;
    padding-left: 1rem;
  }

  .toc a {
    color: var(--primary-text);
    text-decoration: none;
  }

  .toc a:hover {
    text-decoration: underline;
  }

  /* Section Spacing */
  section {
    margin-bottom: var(--section-spacing);
    padding-bottom: var(--section-spacing);
    border-bottom: 1px solid var(--border-color);
  }

  /* Lists and Info Blocks */
  .info-list {
    list-style: none;
    padding: 0;
    margin: 1.5rem 0;
  }
  
  .info-list li {
    margin-bottom: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
  }

  /* Evidence and Notes */
  .evidence-item, .activity, .note {
    background: white;
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .note-item {
    background: white;
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }

  .note-content {
    margin: 1rem 0;
    line-height: 1.6;
  }

  .note-author, .note-timestamp {
    color: var(--secondary-text);
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }

  .chain-of-custody {
    margin-top: 1.5rem;
    padding: 1rem;
    background: var(--background-light);
    border-radius: 6px;
  }

  /* Gallery */
  .evidence-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .gallery-item {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    transition: transform 0.2s;
  }

  .gallery-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  .gallery-item img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 4px;
  }

  .gallery-item .caption {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: var(--secondary-text);
    text-align: center;
  }

  /* Cover Page */
  .cover-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    page-break-after: always;
  }

  .cover-logo {
    max-width: 200px;
    margin-bottom: 3rem;
  }

  .cover-meta {
    margin: 2rem 0;
    font-size: 1.2rem;
    color: var(--secondary-text);
  }

  /* Signature Section */
  .signature-section {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border-color);
  }
  
  .typed-signature {
    margin: 2rem 0;
  }
  
  .signature-text {
    font-family: 'SignatureFont', cursive;
    font-size: 2.5rem;
    color: var(--primary-text);
    border-bottom: 1px solid var(--primary-text);
    display: inline-block;
    padding: 0 2rem 0.5rem;
  }

  /* Signature specific style */
  .signature {
    font-family: 'SignatureFont', cursive;
    font-size: 24px;
    margin-top: 20px;
    color: #000;
  }

  .signature-block {
    margin-top: 40px;
    border-top: 1px solid #ccc;
    padding-top: 10px;
  }

  .signature-name {
    font-family: 'Helvetica', sans-serif;
    font-size: 14px;
    color: #666;
    margin-top: 5px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 2rem 0;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }

  th {
    background: var(--background-light);
    font-weight: bold;
    color: var(--primary-text);
  }

  tr:nth-child(even) {
    background: var(--background-light);
  }

  /* Print Styles */
  @media print {
    body {
      padding: 0;
      margin: 80px 40px;
    }

    h2 {
      page-break-before: always;
    }

    .evidence-gallery {
      page-break-inside: avoid;
    }

    .signature-section {
      page-break-inside: avoid;
    }

    .page-header, .page-footer {
      position: fixed;
      background: white;
    }
  }

  .gallery-modal {
    display: none;
    position: fixed;
    z-index: 999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.9);
  }

  .modal-content {
    margin: auto;
    display: block;
    max-width: 90%;
    max-height: 90vh;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .modal-caption {
    color: #f1f1f1;
    text-align: center;
    padding: 10px;
    position: fixed;
    bottom: 0;
    width: 100%;
  }

  .close-modal {
    position: absolute;
    right: 25px;
    top: 15px;
    color: #f1f1f1;
    font-size: 35px;
    cursor: pointer;
  }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.1);
    color: white;
    padding: 16px;
    border: none;
    cursor: pointer;
    font-size: 20px;
  }

  .prev-btn {
    left: 20px;
  }

  .next-btn {
    right: 20px;
  }

  @media print {
    .gallery-modal {
      display: none !important;
    }
  }
`;

interface Evidence {
  name: string;
  type: {
    name: string;
  };
  filePath: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organization_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('Full request body:', body);
    console.log('Options from request:', body.options);

    const { templateId, caseId } = body;

    // Get template data first to determine file type
    let template;
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
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
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
        notes: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        user: true,
        organization: true,
        evidence: {
          include: {
            type: true,
            chainOfCustody: {
              include: {
                user: true
              }
            },
            evidenceLocation: true
          }
        }
      }
    });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Create case-specific directory name
    const caseDirName = `case${caseId}-${caseData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const reportDir = path.join(process.cwd(), 'reports', caseDirName);
    await fs.mkdir(reportDir, { recursive: true });

    const graphicsDir = path.join(reportDir, 'graphics');
    const fontsDir = path.join(reportDir, 'fonts');
    await fs.mkdir(graphicsDir, { recursive: true });
    await fs.mkdir(fontsDir, { recursive: true });

    // Copy fonts
    const fontFiles = ['Helvetica.ttf', 'Helvetica-Bold.ttf', 'SignatureFont.ttf'];
    for (const font of fontFiles) {
      try {
        const sourcePath = path.join(process.cwd(), 'public', 'fonts', font);
        const destPath = path.join(fontsDir, font);
        await fs.copyFile(sourcePath, destPath);
      } catch (error) {
        console.error(`Failed to copy font ${font}:`, error);
      }
    }

    // Create a map to track filename occurrences
    const fileNameCounter = new Map<string, number>();

    // Copy evidence files to graphics directory
    for (const evidence of caseData.evidence) {
      if (evidence.type.name === "Image" && evidence.filePath) {
        // Remove any duplicate 'uploads/evidence' in the path
        const normalizedPath = evidence.filePath.replace(/uploads\/evidence\/uploads\/evidence/, 'uploads/evidence');
        const sourcePath = path.join(process.cwd(), normalizedPath);
        
        // Get original name without timestamp
        const originalNameParts = evidence.name.split('_');
        let baseName = originalNameParts[0];
        const extension = path.extname(baseName); // Get extension from the base name to avoid double extensions
        baseName = baseName.replace(extension, ''); // Remove extension from base name
        
        // Create final filename with counter if needed
        let finalName = baseName + extension;
        if (fileNameCounter.has(finalName)) {
          const count = fileNameCounter.get(finalName)! + 1;
          fileNameCounter.set(finalName, count);
          finalName = `${baseName}-${count}${extension}`;
        } else {
          fileNameCounter.set(finalName, 1);
        }
        
        const destPath = path.join(graphicsDir, finalName);
        
        try {
          console.log('Copying file:', {
            from: sourcePath,
            to: destPath,
            originalPath: evidence.filePath,
            normalizedPath,
            finalName
          });
          await fs.copyFile(sourcePath, destPath);
          
          // Update the evidence name to match the new filename
          evidence.name = finalName;
        } catch (error) {
          console.error(`Failed to copy file ${sourcePath}:`, error);
        }
      }
    }

    // Generate HTML from selected template sections
    const htmlSections = template.sections
      .filter((section: any) => !body.sections || body.sections.includes(section.id))
      .map((section: any) => {
        // Pre-compile the template
        const compiledTemplate = Handlebars.compile(section.content);
        
        // Prepare template data with serialized BigInts
        const templateData = {
          case: serializeBigInt({
            ...caseData,
            evidence: caseData.evidence.map(evidence => ({
              ...evidence,
              filePath: evidence.filePath
            }))
          }),
          user: session.user,
          organization: caseData.organization,
          currentDate: new Date().toLocaleDateString(),
          options: body.options
        };

        console.log('Section ID:', section.id);
        if (section.id === 'evidence_gallery') {
          console.log('Evidence Gallery Data:', {
            evidence: templateData.case.evidence.map((e: Evidence) => ({
              name: e.name,
              type: e.type.name,
              filePath: e.filePath
            }))
          });
        }
        
        // Execute the template with data
        const result = compiledTemplate(templateData);
        console.log('Compiled Result:', result);
        return result;
      })
      .join('\n');

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
    `;

    // Write HTML file
    const filePath = path.join(reportDir, 'index.html');
    await fs.writeFile(filePath, finalHTML, 'utf-8');

    // Create zip file
    const zip = new AdmZip();
    
    // Add all files from the report directory
    zip.addLocalFolder(reportDir);

    // Save zip file
    const zipFileName = `${caseDirName}.zip`;
    const zipFilePath = path.join(process.cwd(), 'reports', zipFileName);
    zip.writeZip(zipFilePath);

    // Create report record in database
    const report = await prisma.generatedReport.create({
      data: {
        name: zipFileName,
        fileType: 'zip',
        filePath: zipFileName, // Store just the filename since we know it's in the reports directory
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
            id: templateId < 0 ? (await createTemporaryTemplate(template, session.user.organization_id)) : templateId
          }
        }
      },
      include: {
        user: true,
        case: true,
        template: true
      }
    });

    // Clean up temporary directory after zip is created
    await fs.rm(reportDir, { recursive: true, force: true });

    // Return success response with serialized data
    return NextResponse.json({ 
      success: true,
      report: serializeBigInt(report)
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

async function createTemporaryTemplate(template: any, organizationId: number) {
  const defaultTemplate = await prisma.reportTemplate.create({
    data: {
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      sections: template.sections,
      metadata: template.metadata,
      organizationId
    }
  });

  return defaultTemplate.id;
}
