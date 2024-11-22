import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

// Helper function to serialize BigInt
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Download request for report:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.organization_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('User session:', {
      userId: session.user.id,
      organizationId: session.user.organization_id
    });

    // Get report with related data
    const report = await prisma.generatedReport.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            organization_id: true
          }
        },
        case: {
          select: {
            id: true,
            name: true,
            organization_id: true
          }
        },
        template: true
      }
    });

    if (!report) {
      console.log('Report not found:', params.id);
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    console.log('Found report:', {
      id: report.id,
      name: report.name,
      caseId: report.case.id,
      filePath: report.filePath
    });

    // Check ownership and organization access
    if (
      report.userId !== session.user.id || 
      report.case.organization_id !== session.user.organization_id
    ) {
      console.log('Access denied:', {
        reportUserId: report.userId,
        sessionUserId: session.user.id,
        reportOrgId: report.case.organization_id,
        sessionOrgId: session.user.organization_id
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Construct the full file path to the zip file
    const fullPath = path.join(process.cwd(), 'reports', report.name);
    console.log('Attempting to read file:', fullPath);
    
    try {
      // Read the file
      const fileContent = await readFile(fullPath);
      console.log('File read successful, size:', fileContent.length);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `report_${report.case.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp}.zip`;
      console.log('Generated filename:', filename);

      // Add audit log for download
      await prisma.auditLog.create({
        data: {
          action: "DOWNLOAD",
          resourceType: "REPORT",
          resourceId: report.id.toString(),
          details: {
            reportName: report.name,
            caseId: report.case.id,
            downloadedAt: new Date().toISOString()
          },
          user_id: session.user.id,
          organization_id: session.user.organization_id
        },
      });

      console.log('Download audit log created');

      // Return the zip file
      return new NextResponse(fileContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
          'Content-Length': fileContent.length.toString()
        }
      });

    } catch (fileError) {
      console.error("File read error:", fileError);
      return NextResponse.json({ 
        error: "File not found",
        details: "The report file could not be found on the server"
      }, { status: 404 });
    }

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
