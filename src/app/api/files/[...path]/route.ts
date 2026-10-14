import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { stat } from "node:fs/promises";

/**
 * Local File Streaming Route Handler.
 * Serves files from public/uploads/ reliably in both dev and production mode (`next start`),
 * with HTTP Range request support for PDF viewer modals and download buttons.
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("File path required", { status: 400 });
    }

    const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
    const requestedPath = path.resolve(uploadsBase, ...pathSegments);

    // Directory traversal guard
    if (!requestedPath.startsWith(uploadsBase)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    if (!fs.existsSync(requestedPath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileStat = await stat(requestedPath);
    const fileSize = fileStat.size;
    const mimeType = getMimeType(requestedPath);
    const fileName = path.basename(requestedPath);

    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(requestedPath, { start, end });
      const webStream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk));
          fileStream.on("end", () => controller.close());
          fileStream.on("error", (err) => controller.error(err));
        },
        cancel() {
          fileStream.destroy();
        },
      });

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const fileStream = fs.createReadStream(requestedPath);
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => controller.enqueue(chunk));
        fileStream.on("end", () => controller.close());
        fileStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving local file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse(null, { status: 400 });
    }

    const uploadsBase = path.resolve(process.cwd(), "public", "uploads");
    const requestedPath = path.resolve(uploadsBase, ...pathSegments);

    if (!requestedPath.startsWith(uploadsBase) || !fs.existsSync(requestedPath)) {
      return new NextResponse(null, { status: 404 });
    }

    const fileStat = await stat(requestedPath);
    const mimeType = getMimeType(requestedPath);
    const fileName = path.basename(requestedPath);

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Length": fileStat.size.toString(),
        "Accept-Ranges": "bytes",
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
