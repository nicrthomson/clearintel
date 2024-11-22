import { NextRequest, NextResponse } from "next/server"
import { readdir } from "fs/promises"
import path from "path"
import { homedir } from "os"

export async function POST(req: NextRequest) {
  try {
    const { startPath } = await req.json()
    const basePath = startPath || homedir()

    const files = await readdir(basePath, { withFileTypes: true })
    const items = files.map(file => ({
      name: file.name,
      path: path.join(basePath, file.name),
      isDirectory: file.isDirectory(),
      type: path.extname(file.name).toLowerCase()
    }))
    .filter(item => 
      item.isDirectory || 
      ['.e01', '.dd', '.raw', '.img', '.001'].includes(item.type)
    )
    .sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      currentPath: basePath,
      items,
      parentPath: path.dirname(basePath)
    })
  } catch (error) {
    console.error('Error reading directory:', error)
    return new NextResponse("Failed to read directory", { status: 500 })
  }
}
