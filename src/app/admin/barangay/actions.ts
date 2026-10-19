"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrdinanceSlug } from "@/lib/ordinance-utils";

export async function submitOrdinance(formData: FormData): Promise<{ error?: string }> {
  const session = await getSession();

  if (!session || session.role !== "BARANGAY_ADMIN") {
    return { error: "Hindi awtorisado. Tanging Barangay Admin lamang ang makakapag-sumite." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { barangay: true },
  });

  if (!user?.barangayId) {
    return { error: "Walang naitalang barangay para sa iyong account." };
  }

  const title = (formData.get("title") as string)?.trim();
  const resolutionNumber = (formData.get("resolutionNumber") as string)?.trim();
  const ordinanceLabel = (formData.get("ordinanceLabel") as string)?.trim() || null;
  const series = (formData.get("series") as string)?.trim() || new Date().getFullYear().toString();
  const description = (formData.get("description") as string)?.trim() || null;
  const category = (formData.get("category") as string)?.trim() || "OTHER";
  const pdfUrl = (formData.get("pdfUrl") as string)?.trim() || null;
  const content = (formData.get("content") as string)?.trim() || null;
  const penalties = (formData.get("penalties") as string)?.trim() || null;
  const coverage = (formData.get("coverage") as string)?.trim() || null;
  const enforcement = (formData.get("enforcement") as string)?.trim() || null;
  const signatories = (formData.get("signatories") as string)?.trim() || null;
  const tagsStr = (formData.get("tags") as string)?.trim() || "";
  const tags = tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [];
  const dateEnactedStr = (formData.get("dateEnacted") as string)?.trim() || null;
  const dateEnacted = dateEnactedStr ? new Date(dateEnactedStr) : null;
  const yearStr = (formData.get("year") as string)?.trim() || (series || new Date().getFullYear().toString());
  const year = parseInt(yearStr, 10) || new Date().getFullYear();

  const isDraft = formData.get("isDraft") === "true" || formData.get("status") === "DRAFT";

  if (!title || !resolutionNumber) {
    return { error: "Pamagat at Resolution Number ay kinakailangan." };
  }

  const slug = generateOrdinanceSlug(resolutionNumber);

  await prisma.ordinance.create({
    data: {
      title,
      resolutionNumber,
      ordinanceLabel,
      slug,
      series,
      description,
      category: category as never,
      type: "BARANGAY",
      status: isDraft ? "DRAFT" : "PENDING",
      barangayId: user.barangayId,
      submittedById: session.userId,
      pdfUrl,
      content,
      penalties,
      coverage,
      enforcement,
      signatories,
      tags,
      dateEnacted,
      year,
    },
  });

  revalidatePath("/admin/barangay");
  revalidatePath("/admin/barangay/ordinances");
  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  return {};
}

export async function resubmitBarangayOrdinance(
  ordinanceId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await getSession();

  if (!session || session.role !== "BARANGAY_ADMIN") {
    return { error: "Hindi awtorisado. Tanging Barangay Admin lamang ang makakapag-sumite." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user?.barangayId) {
    return { error: "Walang naitalang barangay para sa iyong account." };
  }

  const ordinance = await prisma.ordinance.findUnique({
    where: { id: ordinanceId },
  });

  if (!ordinance || ordinance.barangayId !== user.barangayId) {
    return { error: "Hindi matagpuan o walang pahintulot sa ordinansang ito." };
  }

  if (ordinance.status === "APPROVED") {
    return { error: "Hindi maaaring i-edit ang naaprubahan nang ordinansa." };
  }

  const isDraft = formData.get("isDraft") === "true" || formData.get("status") === "DRAFT";
  const title = (formData.get("title") as string)?.trim() || ordinance.title;
  const resolutionNumber =
    (formData.get("resolutionNumber") as string)?.trim() || ordinance.resolutionNumber;
  const ordinanceLabel =
    (formData.get("ordinanceLabel") as string)?.trim() || ordinance.ordinanceLabel;
  const series = (formData.get("series") as string)?.trim() || ordinance.series;
  const description =
    (formData.get("description") as string)?.trim() || ordinance.description;
  const category = (formData.get("category") as string)?.trim() || ordinance.category;
  const pdfUrl = (formData.get("pdfUrl") as string)?.trim() || ordinance.pdfUrl;
  const content = (formData.get("content") as string)?.trim() || ordinance.content;
  const penalties = (formData.get("penalties") as string)?.trim() || ordinance.penalties;
  const coverage = (formData.get("coverage") as string)?.trim() || ordinance.coverage;
  const enforcement = (formData.get("enforcement") as string)?.trim() || ordinance.enforcement;
  const signatories = (formData.get("signatories") as string)?.trim() || ordinance.signatories;
  const tagsStr = (formData.get("tags") as string)?.trim();
  const tags = tagsStr !== undefined ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : (ordinance.tags as any);
  const dateEnactedStr = (formData.get("dateEnacted") as string)?.trim();
  const dateEnacted = dateEnactedStr ? new Date(dateEnactedStr) : ordinance.dateEnacted;
  const yearStr = (formData.get("year") as string)?.trim();
  const year = yearStr ? parseInt(yearStr, 10) : ordinance.year;

  const slug = generateOrdinanceSlug(resolutionNumber);

  await prisma.ordinance.update({
    where: { id: ordinanceId },
    data: {
      title,
      resolutionNumber,
      ordinanceLabel,
      slug,
      series,
      description,
      category: category as never,
      pdfUrl,
      content,
      penalties,
      coverage,
      enforcement,
      signatories,
      tags,
      dateEnacted,
      year,
      status: isDraft ? "DRAFT" : "PENDING",
      rejectedReason: isDraft ? ordinance.rejectedReason : null, // Clear revision notice on resubmission, keep if still draft
    },
  });

  revalidatePath("/admin/barangay");
  revalidatePath("/admin/barangay/ordinances");
  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  return {};
}

export async function deleteBarangayOrdinance(
  ordinanceId: string
): Promise<{ error?: string }> {
  const session = await getSession();

  if (!session || session.role !== "BARANGAY_ADMIN") {
    return { error: "Hindi awtorisado. Tanging Barangay Admin lamang ang makakapag-tanggal." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user?.barangayId) {
    return { error: "Walang naitalang barangay para sa iyong account." };
  }

  const ordinance = await prisma.ordinance.findUnique({
    where: { id: ordinanceId },
  });

  if (!ordinance || ordinance.barangayId !== user.barangayId) {
    return { error: "Hindi matagpuan o walang pahintulot sa ordinansang ito." };
  }

  if (ordinance.status === "APPROVED") {
    return { error: "Hindi maaaring tanggalin ang naaprubahan nang ordinansa." };
  }

  await prisma.ordinance.delete({
    where: { id: ordinanceId },
  });

  revalidatePath("/admin/barangay");
  revalidatePath("/admin/barangay/ordinances");
  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  return {};
}

export async function updateBarangayReportStatus(
  reportId: string,
  status: string
): Promise<{ error?: string }> {
  const session = await getSession();

  if (!session || session.role !== "BARANGAY_ADMIN") {
    return { error: "Hindi awtorisado." };
  }

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: status as never,
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
  });

  revalidatePath("/admin/barangay");
  revalidatePath("/admin/barangay/reports");
  return {};
}
