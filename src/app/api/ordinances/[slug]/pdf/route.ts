import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "node:path";
import fs from "node:fs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const ordinance = await prisma.ordinance.findUnique({
      where: { slug },
      select: { pdfUrl: true },
    });

    if (!ordinance || !ordinance.pdfUrl) {
      return new NextResponse("PDF not found", { status: 404 });
    }

    const { pdfUrl } = ordinance;

    // If it's a local file URL or relative upload path
    if (pdfUrl.startsWith("/api/files/") || pdfUrl.startsWith("/uploads/") || pdfUrl.startsWith("uploads/")) {
      const fileName = path.basename(pdfUrl);
      const filePath = path.resolve(process.cwd(), "public", "uploads", fileName);
      if (fs.existsSync(filePath)) {
        const buffer = await fs.promises.readFile(filePath);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${slug}.pdf"`,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // If it's an external URL, just redirect to it
    if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
      return NextResponse.redirect(pdfUrl);
    }

    // If it's a base64 data URI
    if (pdfUrl.startsWith("data:application/pdf;base64,")) {
      const base64Data = pdfUrl.replace("data:application/pdf;base64,", "");
      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${slug}.pdf"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // If it's just raw base64 without the data URI prefix
    if (/^[A-Za-z0-9+/=]+$/.test(pdfUrl.slice(0, 100))) {
      const buffer = Buffer.from(pdfUrl, "base64");
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${slug}.pdf"`,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse("Invalid PDF format", { status: 400 });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
