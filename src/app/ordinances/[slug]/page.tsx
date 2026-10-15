import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cleanOrdinanceTitle,
  formatOrdinanceYear,
  formatResolutionDisplay,
  formatCoverage,
} from "@/lib/ordinance-utils";
import { OrdinancePdfButton } from "./ordinance-pdf-button";
import {
  OrdinanceSectionsView,
  OrdinanceEnforcementView,
  OrdinanceSignatoriesView,
} from "./ordinance-view-cards";
import { ScrollToTop } from "@/components/scroll-to-top";

interface OrdinanceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: OrdinanceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const ord = await prisma.ordinance.findFirst({
    where: {
      OR: [{ slug }, { id: slug }, { resolutionNumber: slug }],
    },
  });

  if (!ord) {
    return {
      title: "Hindi Natagpuan ang Ordinansa - Cabanatuan City Ordinance Portal",
    };
  }

  const cleanTitle = cleanOrdinanceTitle(ord.title);

  return {
    title: `${cleanTitle} - Res. No. ${formatResolutionDisplay(
      ord.resolutionNumber
    )} | Cabanatuan Ordinance Portal`,
    description:
      ord.description?.slice(0, 160) ||
      ord.content?.slice(0, 160) ||
      "Opisyal na ordinansa at lokal ng Lungsod ng Cabanatuan.",
  };
}

export default async function OrdinanceDetailPage({
  params,
}: OrdinanceDetailPageProps) {
  const { slug } = await params;

  const ordMatcher = {
    OR: [{ slug }, { id: slug }, { resolutionNumber: slug }],
  };

  const pdfCheck = await prisma.ordinance.findFirst({
    where: {
      ...ordMatcher,
      pdfUrl: { not: null },
    },
    select: { id: true },
  });
  const hasPdf = !!pdfCheck;

  const ord = await prisma.ordinance.findFirst({
    where: ordMatcher,
    omit: { pdfUrl: true },
    include: {
      barangay: true,
      submittedBy: true,
    },
  });

  if (!ord) {
    notFound();
  }

  const cleanTitle = cleanOrdinanceTitle(ord.title);
  const tags: string[] = Array.isArray(ord.tags) ? (ord.tags as string[]) : [];
  const ordYear = formatOrdinanceYear(
    ord.year,
    ord.dateEnacted,
    ord.createdAt
  );

  const formattedDateEnacted = ord.dateEnacted
    ? new Date(ord.dateEnacted).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ord.approvedAt
    ? new Date(ord.approvedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : `Taon ${ordYear}`;

  const coverageText = formatCoverage(
    ord.coverage,
    ord.type,
    ord.barangay?.name
  );

  return (
    <>
      <Navbar />
      <ScrollToTop />

      <main
        id="main-content"
        className="flex-1 py-8 bg-[var(--bg-canvas)] text-[var(--text-ink)] transition-colors duration-300 min-h-screen"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex items-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/ordinances"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Mga Ordinansa
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-neutral-800 dark:text-white truncate max-w-[220px] sm:max-w-xs">
                Res. No. {formatResolutionDisplay(ord.resolutionNumber)}
              </li>
            </ol>
          </nav>

          {/* Hero Header Card */}
          <div className="mb-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d1310] p-5 sm:p-7 shadow-xl">
            {/* Top Status & Badge Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  APPROVED
                </span>
                <Badge variant={ord.type === "CITY" ? "city" : "barangay"}>
                  {ord.type === "CITY"
                    ? "City Ordinance"
                    : `Brgy. ${ord.barangay?.name ?? "N/A"}`}
                </Badge>
              </div>

              <span className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 px-3.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
                Res. No. {formatResolutionDisplay(ord.resolutionNumber)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-4 tracking-tight leading-snug">
              {cleanTitle}
            </h1>

            {/* Executive Summary Box (Green Left Border) */}
            {ord.description && (
              <div className="mb-5 rounded-r-xl border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-sm sm:text-base text-neutral-700 dark:text-neutral-200 leading-relaxed font-normal">
                {ord.description}
              </div>
            )}

            {/* Ordinance Label (if present) */}
            {ord.ordinanceLabel && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 px-3 py-1.5 text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                {ord.ordinanceLabel}
              </div>
            )}

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-5">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-neutral-500 font-bold">Enacted:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {formattedDateEnacted}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="text-neutral-500 font-bold">Coverage:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">{coverageText}</span>
              </div>
            </div>

            {/* Category and Tags Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {ord.category && (
                <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                  {ord.category}
                </span>
              )}
              {ord.type === "BARANGAY" && (
                <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-200">
                  BARANGAY ORDINANCE
                </span>
              )}
              {tags.length > 0 &&
                tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-neutral-700 dark:text-neutral-200"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* Separator */}
            <div className="border-t border-neutral-200 dark:border-white/10 my-5" />

            {/* Prominent Action Buttons */}
            <div>
              <OrdinancePdfButton
                pdfUrl={hasPdf ? `/api/ordinances/${ord.slug}/pdf` : null}
                title={cleanTitle}
                resolutionNumber={ord.resolutionNumber}
                slug={ord.slug}
                dateEnacted={formattedDateEnacted}
                category={ord.category}
                coverage={coverageText}
                description={ord.description}
                articles={ord.articles}
                penalties={ord.penalties}
                signatories={ord.signatories}
              />
            </div>
          </div>

          {/* Articles & Sections Block */}
          <OrdinanceSectionsView
            articles={ord.articles}
            fallbackContent={ord.content}
          />

          {/* Enforcement Actions Block */}
          <OrdinanceEnforcementView
            enforcement={ord.enforcement}
            coverage={coverageText}
          />

          {/* Signatories Block */}
          <OrdinanceSignatoriesView signatories={ord.signatories} />

          {/* AI Citizen Assistant Bottom CTA */}
          <div className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 text-center shadow-lg">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center justify-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              May Katanungan sa Ordinansang Ito?
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto mb-5">
              Maaari mong tanungin ang ating{" "}
              <strong className="text-emerald-400">
                Cabanatuan Ordinance AI
              </strong>{" "}
              tungkol sa mga probisyon, alituntunin, at kung paano sumunod sa
              ordinansang ito.
            </p>
            <Link href="/chatbot">
              <Button
                type="button"
                className="rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-md inline-flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Magtanong sa AI Assistant →
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
