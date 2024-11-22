import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments but remove any duplicate 'uploads/evidence'
    const filePath = params.path
      .join('/')
      .replace(/uploads\/evidence\/uploads\/evidence/, 'uploads/evidence');
    
    // Ensure the path is within the uploads directory
    const fullPath = path.join(process.cwd(), filePath);
    if (!fullPath.startsWith(path.join(process.cwd(), 'uploads/evidence'))) {
      return new NextResponse("Invalid file path", { status: 400 });
    }

    try {
      const file = await fs.readFile(fullPath);
      const contentType = path.extname(fullPath) === '.png' ? 'image/png' : 'application/octet-stream';
      
      return new NextResponse(file, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } catch (error) {
      console.error("[EVIDENCE_FILES_GET] File read error:", error);
      return new NextResponse("File not found", { status: 404 });
    }
  } catch (error) {
    console.error("[EVIDENCE_FILES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
