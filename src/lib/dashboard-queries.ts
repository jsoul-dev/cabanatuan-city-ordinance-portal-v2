import { prisma } from "@/lib/prisma";

// ─── LGU Admin Stats (city-wide) ────────────────────────────────────────────

export async function getLguOverviewStats() {
  const [
    totalOrdinances,
    draftOrdinances,
    pendingOrdinances,
    approvedOrdinances,
    rejectedOrdinances,
    totalBarangays,
    totalUsers,
    totalNews,
    totalReports,
    newReports,
  ] = await Promise.all([
    prisma.ordinance.count(),
    prisma.ordinance.count({ where: { status: "DRAFT" } }),
    prisma.ordinance.count({ where: { status: "PENDING" } }),
    prisma.ordinance.count({ where: { status: "APPROVED" } }),
    prisma.ordinance.count({ where: { status: "REJECTED" } }),
    prisma.barangay.count(),
    prisma.user.count({ where: { role: { not: "CITIZEN" } } }),
    prisma.newsItem.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: "NEW" } }),
  ]);

  return {
    ordinances: { total: totalOrdinances, draft: draftOrdinances, pending: pendingOrdinances, approved: approvedOrdinances, rejected: rejectedOrdinances },
    barangays: totalBarangays,
    officials: totalUsers,
    news: totalNews,
    reports: { total: totalReports, new: newReports },
  };
}

export async function getLguPendingOrdinances() {
  return prisma.ordinance.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { barangay: true, submittedBy: { select: { name: true, role: true } } },
    take: 10,
  });
}

export async function getLguAllOrdinances(filters?: { status?: string; search?: string }) {
  return prisma.ordinance.findMany({
    where: {
      ...(filters?.status && filters.status !== "ALL" ? { status: filters.status as never } : {}),
      ...(filters?.search ? {
        OR: [
          { title: { contains: filters.search } },
          { resolutionNumber: { contains: filters.search } },
        ],
      } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { barangay: true, submittedBy: { select: { name: true, role: true } }, reviewedBy: { select: { name: true } } },
  });
}

export async function getLguAllUsers() {
  return prisma.user.findMany({
    where: { role: { not: "CITIZEN" } },
    orderBy: { createdAt: "desc" },
    include: { barangay: true },
  });
}

export async function getLguAllReports() {
  return prisma.report.findMany({
    orderBy: { submittedAt: "desc" },
    include: { barangay: true },
    take: 50,
  });
}

// ─── Barangay Official Stats (scoped) ───────────────────────────────────────

export async function getBarangayOverviewStats(barangayId: string) {
  const [
    totalOrdinances,
    draftOrdinances,
    pendingOrdinances,
    approvedOrdinances,
    rejectedOrdinances,
    totalReports,
    newReports,
    inProgressReports,
    resolvedReports,
  ] = await Promise.all([
    prisma.ordinance.count({ where: { barangayId } }),
    prisma.ordinance.count({ where: { barangayId, status: "DRAFT" } }),
    prisma.ordinance.count({ where: { barangayId, status: "PENDING" } }),
    prisma.ordinance.count({ where: { barangayId, status: "APPROVED" } }),
    prisma.ordinance.count({ where: { barangayId, status: "REJECTED" } }),
    prisma.report.count({ where: { barangayId } }),
    prisma.report.count({ where: { barangayId, status: "NEW" } }),
    prisma.report.count({ where: { barangayId, status: "IN_PROGRESS" } }),
    prisma.report.count({ where: { barangayId, status: "RESOLVED" } }),
  ]);

  return {
    ordinances: { total: totalOrdinances, draft: draftOrdinances, pending: pendingOrdinances, approved: approvedOrdinances, rejected: rejectedOrdinances },
    reports: { total: totalReports, new: newReports, inProgress: inProgressReports, resolved: resolvedReports },
  };
}

export async function getBarangayRecentOrdinances(barangayId: string) {
  return prisma.ordinance.findMany({
    where: { barangayId },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: { select: { name: true, role: true } }, reviewedBy: { select: { name: true } } },
    take: 10,
  });
}

export async function getBarangayAllOrdinances(barangayId: string) {
  return prisma.ordinance.findMany({
    where: { barangayId },
    orderBy: { createdAt: "desc" },
    include: { submittedBy: { select: { name: true, role: true } }, reviewedBy: { select: { name: true } } },
  });
}

export async function getBarangayReports(barangayId: string) {
  return prisma.report.findMany({
    where: { barangayId },
    orderBy: { submittedAt: "desc" },
    include: { barangay: { select: { name: true } } },
  });
}

export async function getAllBarangays() {
  return prisma.barangay.findMany({ orderBy: { name: "asc" } });
}

export async function getAllBarangaysWithDetails() {
  return prisma.barangay.findMany({
    orderBy: { name: "asc" },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          ordinances: true,
          reports: true,
        },
      },
    },
  });
}

// ─── Analytics Queries ────────────────────────────────────────────────────────

export async function getLguAnalyticsData() {
  const [
    ordinances,
    reports,
    barangaysWithCounts,
  ] = await Promise.all([
    prisma.ordinance.findMany({
      select: {
        status: true,
        category: true,
        year: true,
        dateEnacted: true,
        barangayId: true,
      },
    }),
    prisma.report.findMany({
      select: {
        status: true,
        type: true,
        barangay: { select: { name: true } },
      },
    }),
    prisma.barangay.findMany({
      select: {
        name: true,
        _count: { select: { ordinances: true, reports: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return { ordinances, reports, barangaysWithCounts };
}

export async function getBarangayAnalyticsData(barangayId: string) {
  const [
    ordinances,
    reports,
    barangay,
  ] = await Promise.all([
    prisma.ordinance.findMany({
      where: { barangayId },
      select: {
        status: true,
        category: true,
        year: true,
        dateEnacted: true,
      },
    }),
    prisma.report.findMany({
      where: { barangayId },
      select: {
        status: true,
        type: true,
        submittedAt: true,
      },
    }),
    prisma.barangay.findUnique({
      where: { id: barangayId },
      select: { name: true },
    }),
  ]);

  return { ordinances, reports, barangay };
}


