import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const keywords = ["ordinansa", "curfew", "hours"];
    
    const matchedOrdinances = await prisma.ordinance.findMany({
      where: {
        status: "APPROVED",
        OR: keywords.map((kw: string) => ({
          OR: [
            { title: { contains: kw, mode: "insensitive" } },
            { content: { contains: kw, mode: "insensitive" } },
            { resolutionNumber: { contains: kw, mode: "insensitive" } },
          ],
        })),
      },
      take: 3,
      include: {
        barangay: true,
      },
    });

    return NextResponse.json({ success: true, matchedOrdinances });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err), stack: err.stack });
  }
}
