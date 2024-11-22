import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/files";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save file and get metadata
    const fileData = await saveUploadedFile(buffer, file.name);

    // Return file details
    return NextResponse.json({
      ...fileData,
      mimeType: file.type || "",
    });
  } catch (error) {
    console.error("[EVIDENCE_UPLOAD]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error", 
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
