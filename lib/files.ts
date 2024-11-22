import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export const UPLOADS_DIR = "uploads/evidence";

export async function ensureUploadsDirectory() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
    throw error;
  }
}

export async function saveUploadedFile(file: Buffer, originalName: string) {
  await ensureUploadsDirectory();

  // Clean the original filename
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  
  // Split name and extension
  const nameParts = cleanName.split('.');
  const ext = nameParts.pop() || "";
  const baseName = nameParts.join('.');
  
  // Add timestamp to ensure uniqueness while preserving original name
  const timestamp = Date.now();
  const fileName = `${baseName}_${timestamp}.${ext}`;
  const filePath = join(UPLOADS_DIR, fileName);

  // Calculate hashes while writing
  const md5Hash = crypto.createHash("md5");
  const sha256Hash = crypto.createHash("sha256");
  
  md5Hash.update(file);
  sha256Hash.update(file);

  // Write file
  await writeFile(filePath, file);

  return {
    fileName,
    originalName,
    path: filePath,
    size: file.length,
    md5: md5Hash.digest("hex"),
    sha256: sha256Hash.digest("hex"),
  };
}
