"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { hash } from "bcryptjs";
import { generateOrdinanceSlug } from "@/lib/ordinance-utils";

// ─── Ordinance Actions ───────────────────────────────────────────────────────

export async function approveOrdinance(ordinanceId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  await prisma.ordinance.update({
    where: { id: ordinanceId },
    data: { status: "APPROVED", reviewedById: session.userId, approvedAt: new Date() },
  });

  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  revalidatePath("/ordinances");
  return {};
}

export async function rejectOrdinance(ordinanceId: string, reason: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };
  if (!reason.trim()) return { error: "Kailangan ng dahilan ng pagtanggi." };

  await prisma.ordinance.update({
    where: { id: ordinanceId },
    data: { status: "REJECTED", reviewedById: session.userId, rejectedReason: reason.trim() },
  });

  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  return {};
}

export async function denyOrdinanceWithNotice(
  ordinanceId: string,
  notice: string,
  returnToDraft: boolean
): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };
  if (!notice.trim()) return { error: "Kailangan ng paalala o dahilan." };

  await prisma.ordinance.update({
    where: { id: ordinanceId },
    data: {
      status: returnToDraft ? "DRAFT" : "REJECTED",
      reviewedById: session.userId,
      rejectedReason: notice.trim(),
    },
  });

  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  revalidatePath("/admin/barangay");
  revalidatePath("/admin/barangay/ordinances");
  revalidatePath("/ordinances");
  return {};
}

export async function createCityOrdinance(formData: FormData): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  const title = (formData.get("title") as string)?.trim();
  const resolutionNumber = (formData.get("resolutionNumber") as string)?.trim();
  const ordinanceLabel = (formData.get("ordinanceLabel") as string)?.trim() || null;
  const series = (formData.get("series") as string)?.trim() || new Date().getFullYear().toString();
  const category = (formData.get("category") as string)?.trim() || "OTHER";
  const description = (formData.get("description") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "APPROVED";
  const pdfUrl = (formData.get("pdfUrl") as string) || null;
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

  if (!title || !resolutionNumber) {
    return { error: "Kailangan ng pamagat, resolution number, at serye." };
  }

  const slug = generateOrdinanceSlug(resolutionNumber);

  await prisma.ordinance.create({
    data: {
      title,
      resolutionNumber,
      ordinanceLabel,
      slug,
      series,
      category: category as never,
      description,
      status: status as never,
      type: "CITY",
      barangayId: null,
      submittedById: session.userId,
      reviewedById: status === "APPROVED" ? session.userId : null,
      approvedAt: status === "APPROVED" ? new Date() : null,
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

  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  revalidatePath("/ordinances");
  return {};
}

export async function deleteOrdinance(ordinanceId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  await prisma.ordinance.delete({ where: { id: ordinanceId } });

  revalidatePath("/admin/lgu");
  revalidatePath("/admin/lgu/ordinances");
  revalidatePath("/ordinances");
  return {};
}

// ─── User Actions ────────────────────────────────────────────────────────────

export async function createUser(formData: FormData): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const name = (formData.get("name") as string)?.trim();
  const role = formData.get("role") as string;
  const barangayId = (formData.get("barangayId") as string) || null;
  const password = (formData.get("password") as string) || "password123";

  if (!email || !name || !role) return { error: "Lahat ng field ay kinakailangan." };

  if (role === "BARANGAY_ADMIN" && barangayId) {
    const existingAdmin = await prisma.user.findFirst({ where: { barangayId, role: "BARANGAY_ADMIN" } });
    if (existingAdmin) return { error: "Mayroon nang admin account ang barangay na ito." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "May umiiral na account sa email na ito." };

  const passwordHash = await hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name,
      role: role as never,
      passwordHash,
      barangayId: barangayId || null,
    },
  });

  revalidatePath("/admin/lgu/users");
  return {};
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };
  if (session.userId === userId) return { error: "Hindi mo matatanggal ang sarili mong account." };

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/lgu/users");
  return {};
}

// ─── Barangay Actions ─────────────────────────────────────────────────────────

export async function createBarangay(formData: FormData): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "Kinakailangan ang pangalan ng Barangay." };

  const existing = await prisma.barangay.findUnique({ where: { name } });
  if (existing) return { error: "May nakarehistro nang Barangay na may ganitong pangalan." };

  await prisma.barangay.create({
    data: { name, description },
  });

  revalidatePath("/admin/lgu/barangays");
  revalidatePath("/admin/lgu");
  return {};
}

export async function updateBarangay(id: string, formData: FormData): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;

  if (!name) return { error: "Kinakailangan ang pangalan ng Barangay." };

  const existing = await prisma.barangay.findFirst({
    where: { name, NOT: { id } },
  });
  if (existing) return { error: "May nakarehistro nang Barangay na may ganitong pangalan." };

  await prisma.barangay.update({
    where: { id },
    data: { name, description },
  });

  revalidatePath("/admin/lgu/barangays");
  revalidatePath("/admin/lgu");
  return {};
}

export async function deleteBarangay(id: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  // Check if barangay has users or ordinances
  const b = await prisma.barangay.findUnique({
    where: { id },
    include: { _count: { select: { users: true, ordinances: true, reports: true } } },
  });

  if (!b) return { error: "Hindi nahanap ang Barangay." };
  if (b._count.users > 0 || b._count.ordinances > 0) {
    return { error: `Hindi pwedeng burahin ang Barangay dahil may ${b._count.users} opisyal / ${b._count.ordinances} ordinansa pa rito.` };
  }

  await prisma.barangay.delete({ where: { id } });

  revalidatePath("/admin/lgu/barangays");
  revalidatePath("/admin/lgu");
  return {};
}

export async function upsertBarangayAdminAccount(formData: FormData): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  const userId = (formData.get("userId") as string) || null;
  const barangayId = (formData.get("barangayId") as string)?.trim();
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const name = (formData.get("name") as string)?.trim();
  const role = (formData.get("role") as string) || "BARANGAY_ADMIN";
  const password = (formData.get("password") as string) || "password123";

  if (!barangayId || !email || !name) {
    return { error: "Kinakailangan ang Barangay, Email, at Pangalan." };
  }

  // Validate @gmail.com per system standard
  if (!email.endsWith("@gmail.com")) {
    return { error: "Dapat gamitin ang valid na @gmail.com email address para sa mga account." };
  }

  if (userId) {
    // Updating existing account
    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { id: userId } },
    });
    if (existingEmail) return { error: "Ginagamit na ng ibang opisyal ang email na ito." };

    const updateData: Record<string, unknown> = {
      email,
      name,
      role: role as never,
      barangayId,
    };
    if (password && password.trim() !== "") {
      updateData.passwordHash = await hash(password.trim(), 12);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  } else {
    // Creating new account
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return { error: "Ginagamit na ang email na ito sa system." };

    const passwordHash = await hash(password || "password123", 12);

    await prisma.user.create({
      data: {
        email,
        name,
        role: role as never,
        passwordHash,
        barangayId,
      },
    });
  }

  revalidatePath("/admin/lgu/barangays");
  revalidatePath("/admin/lgu/users");
  return {};
}

// ─── Report Actions ───────────────────────────────────────────────────────────

export async function updateReportStatus(reportId: string, status: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session || session.role !== "LGU_ADMIN") return { error: "Hindi awtorisado." };

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: status as never,
      ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
    },
  });

  revalidatePath("/admin/lgu/reports");
  revalidatePath("/admin/lgu");
  return {};
}
