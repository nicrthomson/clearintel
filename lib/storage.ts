import fs from "fs/promises"
import path from "path"

const REPORTS_DIR = path.join(process.cwd(), "public", "reports")

export async function uploadReport(
  buffer: Buffer,
  caseId: number,
  fileName: string
): Promise<string> {
  // Create case directory if it doesn't exist
  const caseDir = path.join(REPORTS_DIR, caseId.toString())
  await fs.mkdir(caseDir, { recursive: true })

  // Save file
  const filePath = path.join(caseDir, fileName)
  await fs.writeFile(filePath, buffer)

  // Return relative path for storage in database
  return `/reports/${caseId}/${fileName}`
} 