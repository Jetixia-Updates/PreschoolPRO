import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

/**
 * Ensure upload directories exist
 */
async function ensureUploadDirs() {
  const dirs = [
    UPLOAD_DIR,
    join(UPLOAD_DIR, "photos"),
    join(UPLOAD_DIR, "documents"),
    join(UPLOAD_DIR, "avatars"),
    join(UPLOAD_DIR, "reports"),
  ];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

/**
 * Generate a unique filename
 */
function generateFilename(originalName: string): string {
  const ext = originalName.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Upload a file to local storage
 */
export async function uploadFile(
  file: File,
  category: "photos" | "documents" | "avatars" | "reports" = "photos"
): Promise<string> {
  await ensureUploadDirs();

  const filename = generateFilename(file.name);
  const filepath = join(UPLOAD_DIR, category, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/${category}/${filename}`;
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  category: "photos" | "documents" | "avatars" | "reports" = "photos"
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadFile(file, category);
    urls.push(url);
  }
  return urls;
}

/**
 * Validate file type
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (in MB)
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * Common file type constants
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_DOCUMENT_SIZE_MB = 25;
