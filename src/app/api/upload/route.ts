import { NextRequest, NextResponse } from "next/server";
import {
  uploadFile,
  isValidFileType,
  isValidFileSize,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE_MB,
  MAX_DOCUMENT_SIZE_MB,
} from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "photos";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Determine allowed types based on category
    const allowedTypes =
      category === "documents"
        ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
        : ALLOWED_IMAGE_TYPES;

    const maxSize =
      category === "documents" ? MAX_DOCUMENT_SIZE_MB : MAX_IMAGE_SIZE_MB;

    // Validate file type
    if (!isValidFileType(file, allowedTypes)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file, maxSize)) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize}MB limit` },
        { status: 400 }
      );
    }

    // Upload the file
    const url = await uploadFile(
      file,
      category as "photos" | "documents" | "avatars" | "reports"
    );

    return NextResponse.json({ url, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
