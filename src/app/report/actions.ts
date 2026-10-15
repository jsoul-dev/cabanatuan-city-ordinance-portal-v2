"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ReportType } from "@prisma/client";

function mapCategoryToReportType(category: string): ReportType {
  const cat = (category || "").toLowerCase();
  if (cat.includes("basura") || cat.includes("sanitation") || cat.includes("trash") || cat.includes("burning")) {
    return "TRASH_BURNING";
  }
  if (cat.includes("ingay") || cat.includes("noise") || cat.includes("videoke")) {
    return "NOISE";
  }
  if (cat.includes("harang") || cat.includes("daan") || cat.includes("road") || cat.includes("obstruction") || cat.includes("kalsada")) {
    return "ROAD_OBSTRUCTION";
  }
  return "OTHER";
}

export async function submitCommunityReport(formData: {
  subject: string;
  barangayId: string;
  category: string;
  details: string;
  isAnonymous: boolean;
  contactName?: string;
  contactPhone?: string;
}) {
  try {
    const {
      subject,
      barangayId,
      category,
      details,
      isAnonymous,
      contactName,
      contactPhone,
    } = formData;

    if (!subject.trim() || !details.trim() || !barangayId) {
      return { error: "Mangyaring punan ang pamagat, barangay, at detalye ng ulat." };
    }

    // Verify barangay exists and has an active admin account
    let brgy = await prisma.barangay.findUnique({
      where: { id: barangayId },
      include: { users: { select: { id: true } } },
    });

    if (!brgy) {
      // Fallback to active participating barangay in case of stale ID from client cache
      brgy = await prisma.barangay.findFirst({
        where: { users: { some: {} } },
        include: { users: { select: { id: true } } },
      });
    }

    if (!brgy) {
      return { error: "Hindi nahanap ang napiling barangay." };
    }

    if (brgy.users.length === 0) {
      return {
        error:
          "Hindi pa nakarehistro ang opisyal ng barangay na ito sa sistema kaya hindi makakatanggap ng ulat. Pumili lamang ng rehistradong barangay.",
      };
    }

    const type = mapCategoryToReportType(category);
    const description = `[${subject.trim()}]\n\n${details.trim()}`;

    const report = await prisma.report.create({
      data: {
        type,
        description,
        barangayId,
        isAnonymous: Boolean(isAnonymous),
        contactName: isAnonymous ? null : contactName || null,
        contactPhone: isAnonymous ? null : contactPhone || null,
        status: "NEW",
      },
    });

    revalidatePath("/admin/barangay/reports");
    revalidatePath("/admin/barangay");
    revalidatePath("/admin/lgu/reports");
    revalidatePath("/admin/lgu");
    revalidatePath("/report");

    return { success: true, reportId: report.id };
  } catch (error: unknown) {
    console.error("Error submitting community report:", error);
    return { error: "Nagkaroon ng problema sa pagsumite ng ulat. Subukan muli." };
  }
}
