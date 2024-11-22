import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { serializeBigInt } from "@/lib/utils"
import { stat } from "fs/promises"
import { exec } from "child_process"
import { promisify } from "util"
import path from "path"

const execAsync = promisify(exec)

async function getE01Info(filePath: string) {
  try {
    // Get general metadata using ewfinfo
    const { stdout: metadataOutput } = await execAsync(`ewfinfo "${filePath}"`)
    const metadata = parseEwfInfo(metadataOutput)

    // Get media information using ewfinfo -m
    const { stdout: mediaOutput } = await execAsync(`ewfinfo -m "${filePath}"`)
    const mediaInfo = parseEwfInfo(mediaOutput)

    // Get acquisition information using ewfinfo -i
    const { stdout: acquisitionOutput } = await execAsync(`ewfinfo -i "${filePath}"`)
    const acquisitionInfo = parseEwfInfo(acquisitionOutput)

    // Get DFXML output for more detailed information
    const { stdout: dfxmlOutput } = await execAsync(`ewfinfo -f dfxml "${filePath}"`)

    return {
      metadata,
      mediaInfo,
      acquisitionInfo,
      dfxml: dfxmlOutput,
      toolsInfo: {
        version: await getToolVersion(),
        available: true
      }
    }
  } catch (error) {
    console.error('Error reading E01 file:', error)
    return {
      error: "Failed to read E01 file",
      details: error instanceof Error ? error.message : "Unknown error",
      toolsInfo: {
        version: await getToolVersion(),
        available: true,
        error: true
      }
    }
  }
}

async function getToolVersion() {
  try {
    const { stdout } = await execAsync('ewfinfo -V')
    return stdout.trim()
  } catch {
    return null
  }
}

function parseEwfInfo(output: string) {
  const metadata: Record<string, any> = {}
  const lines = output.split('\n')
  let currentSection = ''

  for (const line of lines) {
    // Skip empty lines and the version line
    if (!line.trim() || line.startsWith('ewfinfo')) continue

    // Check if this is a section header
    if (!line.startsWith('\t')) {
      currentSection = line.trim()
        .toLowerCase()
        .replace(/\s+information$/, '')  // Remove "information" from section names
        .replace(/[^a-z0-9]/g, '_')      // Convert non-alphanumeric to underscore
      continue
    }

    // Parse the value line
    const parts = line.trim().split(/\t:\s+/)
    if (parts.length === 2) {
      const [key, value] = parts
      const cleanKey = key.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')             // Replace multiple underscores with single
        .replace(/^_|_$/g, '')           // Remove leading/trailing underscores

      // Add to the appropriate section
      if (!metadata[currentSection]) {
        metadata[currentSection] = {}
      }
      metadata[currentSection][cleanKey] = value
    }
  }

  return metadata
}

async function getFileStats(filePath: string) {
  try {
    const stats = await stat(filePath)
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
    }
  } catch (error) {
    console.error('Error getting file stats:', error)
    return null
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const caseId = parseInt(params.id)
    const imageId = parseInt(params.imageId)

    const image = await prisma.forensicImage.findFirst({
      where: {
        id: imageId,
        case_id: caseId,
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

    if (!image) {
      return new NextResponse("Image not found", { status: 404 })
    }

    // Get basic file information
    const fileStats = await getFileStats(image.symlinkPath)
    if (!fileStats) {
      return new NextResponse("File not accessible", { status: 404 })
    }

    // Basic file metadata
    const fileInfo = {
      ...image,
      fileStats: {
        ...fileStats,
        extension: path.extname(image.symlinkPath).toLowerCase(),
        basename: path.basename(image.symlinkPath),
        directory: path.dirname(image.symlinkPath),
      },
    }

    // If it's an E01 file, get additional information using libewf tools
    if (image.imageType === 'E01') {
      const e01Info = await getE01Info(image.symlinkPath)
      return NextResponse.json(serializeBigInt({
        ...fileInfo,
        e01Info,
      }))
    }

    return NextResponse.json(serializeBigInt(fileInfo))
  } catch (error) {
    console.error("Error fetching image info:", error)
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    )
  }
}
