import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top";
import { OrdinanceExplorerClient } from "./ordinance-explorer-client";

export const metadata: Metadata = {
  title: "Mga Ordinansa",
  description:
    "I-browse at i-search ang mga opisyal na ordinansa ng Lungsod ng Cabanatuan at mga barangay nito.",
};

/**
 * Ordinance Explorer Page (Server Component).
 * Responsive across BOTH crisp Light Mode and winauth.net Dark Mode.
 */
export default async function OrdinancesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialSearch = resolvedParams?.search || "";

  const rawOrdinances = await Promise.all([
    prisma.ordinance.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        barangay: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.barangay.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const ordinances = rawOrdinances[0].map((ord) => ({
    ...ord,
    pdfUrl: ord.pdfUrl ? "has-pdf" : null,
    tags: Array.isArray(ord.tags) ? (ord.tags as string[]) : [],
  }));
  const barangays = rawOrdinances[1];

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-[#050807] dark:text-white selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="relative flex-1 overflow-hidden py-12">
        {/* Aurora Glow & Scanlines (Dark mode only / subtle in light) */}
        <div
          className="pointer-events-none absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Cabanatuan City Municipal Code</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
              Mga Ordinansa at Resolusyon
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Hanapin ang mga ordinansa, resolusyon, at patakarang nagpapairal sa
              kaayusan at kaunlaran ng ating lungsod at 89 barangay nito.
            </p>
          </div>

          {/* Interactive Search & Filter Client Component */}
          <OrdinanceExplorerClient
            initialOrdinances={ordinances}
            barangays={barangays}
            initialSearch={initialSearch}
          />
        </div>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
