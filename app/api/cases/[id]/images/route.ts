import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { stat } from "fs/promises"
import path from "path"
import { serializeBigInt } from "@/lib/utils"

// Validate file path to ensure it's safe
function isValidFilePath(filePath: string): boolean {
  try {
    // Normalize path and ensure it's absolute
    const normalizedPath = path.normalize(filePath)
    if (!path.isAbsolute(normalizedPath)) {
      return false
    }

    // Check for common forensic image extensions
    const ext = path.extname(normalizedPath).toLowerCase()
    const validExtensions = ['.e01', '.dd', '.raw', '.img', '.001']
    return validExtensions.includes(ext)
  } catch {
    return false
  }
}

// Validate file exists and get its size
async function validateFile(filePath: string): Promise<{ valid: boolean; size?: number }> {
  try {
    const stats = await stat(filePath)
    return {
      valid: stats.isFile(),
      size: stats.size
    }
  } catch {
    return { valid: false }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const images = await prisma.forensicImage.findMany({
      where: {
        case_id: caseId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(serializeBigInt(images))
  } catch (error) {
    console.error("Error fetching forensic images:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const data = await req.json()

    // Basic validation
    if (!data.name || !data.symlinkPath) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Validate file path format and extension
    if (!isValidFilePath(data.symlinkPath)) {
      return new NextResponse("Invalid file path or unsupported file type", { status: 400 })
    }

    // Validate file exists and get its size
    const fileValidation = await validateFile(data.symlinkPath)
    if (!fileValidation.valid) {
      return new NextResponse("File not found or inaccessible", { status: 400 })
    }

    // Create the forensic image record
    const image = await prisma.forensicImage.create({
      data: {
        name: data.name,
        description: data.description,
        imageType: path.extname(data.symlinkPath).slice(1).toUpperCase(),
        symlinkPath: data.symlinkPath,
        size: fileValidation.size,
        case_id: caseId,
        user_id: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(serializeBigInt(image))
  } catch (error) {
    console.error("Error creating forensic image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
