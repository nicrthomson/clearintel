// import { NextRequest, NextResponse } from "next/server"
// import { dialog } from "@electron/remote"

// export async function POST(req: NextRequest) {
//   try {
//     const { title, filters } = await req.json()

//     const result = await dialog.showOpenDialog({
//       title: title || 'Select File',
//       properties: ['openFile'],
//       filters: filters || [],
//     })

//     return NextResponse.json({
//       canceled: result.canceled,
//       filePath: result.filePaths[0],
//     })
//   } catch (error) {
//     console.error('Error opening file dialog:', error)
//     return new NextResponse("Failed to open file dialog", { status: 500 })
//   }
// }
