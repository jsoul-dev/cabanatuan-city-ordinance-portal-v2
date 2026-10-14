import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

/**
 * Local File Upload API Route.
 * Stores PDF and image uploads directly in public/uploads/
 * with size capping (15MB) and strict MIME type validation.
 */
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

function sanitizeFileName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  return `${Date.now()}-${base}-${randomSuffix}${ext}`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Walang natanggap na file para i-upload." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Masyadong malaki ang file. Hanggang 15MB lamang ang pinapayagan." },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: "Hindi pinapayagan ang format ng file. PDF o imahe (JPG, PNG, WEBP) lamang ang tatanggapin." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = sanitizeFileName(file.name || "upload.pdf");
      const targetPath = path.join(uploadsDir, safeName);

      await fs.writeFile(targetPath, buffer);

      const url = `/api/files/${safeName}`;

      return NextResponse.json({
        success: true,
        url,
        fileName: safeName,
        size: buffer.length,
        mimeType: file.type || (ext === ".pdf" ? "application/pdf" : "image/jpeg"),
      });
    }

    // Handle base64 JSON payload for direct client extraction interoperability
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { base64, mimeType, name } = body;

      if (!base64 || !mimeType) {
        return NextResponse.json(
          { error: "Kailangan ng base64 data at mimeType." },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          { error: "Hindi pinapayagan ang ganitong uri ng file." },
          { status: 400 }
        );
      }

      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: "Masyadong malaki ang file. Hanggang 15MB lamang ang pinapayagan." },
          { status: 400 }
        );
      }

      let ext = ".pdf";
      if (mimeType === "image/jpeg" || mimeType === "image/jpg") ext = ".jpg";
      else if (mimeType === "image/png") ext = ".png";
      else if (mimeType === "image/webp") ext = ".webp";

      const safeName = sanitizeFileName(name || `upload${ext}`);
      const targetPath = path.join(uploadsDir, safeName);

      await fs.writeFile(targetPath, buffer);

      const url = `/api/files/${safeName}`;

      return NextResponse.json({
        success: true,
        url,
        fileName: safeName,
        size: buffer.length,
        mimeType,
      });
    }

    return NextResponse.json(
      { error: "Hindi suportadong content-type." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Local upload error:", error);
    return NextResponse.json(
      { error: "Nagka-aberya sa pag-save ng file sa local storage." },
      { status: 500 }
    );
  }
}
