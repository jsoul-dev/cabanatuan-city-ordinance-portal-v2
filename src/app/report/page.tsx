import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReportClientForm } from "./report-client";

export const metadata: Metadata = {
  title: "Mag-report sa Barangay | Community Report",
  description:
    "Mag-report ng mga non-urgent na isyu sa iyong barangay sa Cabanatuan City (basura, ingay, ilaw, daan, atbp).",
};

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const barangays = await prisma.barangay.findMany({
    where: {
      users: {
        some: {},
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-[#050807] dark:text-white selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="relative flex-1 overflow-hidden py-12">
        {/* Aurora Glow & Scanlines */}
        <div
          className="pointer-events-none absolute left-1/3 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>DIRECT LGU CITIZEN DESK</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
              Community Report
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Ipaalam sa iyong Barangay ang mga non-urgent na isyu (basura,
              ingay, sira sa daan, ilaw) upang maaksyunan.
            </p>
          </div>

          {/* Emergency Hotline Notice */}
          <div className="mb-8 rounded-2xl border border-red-200/80 bg-red-50/80 p-5 shadow-sm dark:border-red-500/20 dark:bg-red-950/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
                  <h3 className="font-mono text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">
                    Emergency Hotline Numbers (24/7 Rescue, Fire & Police)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-red-800 dark:text-red-300/80">
                  Para sa agarang sakuna o saklolo, tumawag direkta sa Cabanatuan City Hotlines:
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <a
                href="tel:0449400161"
                className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 font-semibold text-red-700 shadow-sm hover:bg-white dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60 transition-colors"
              >
                <span>CDRRMO Rescue</span>
                <span className="font-bold">(044)-940-0161</span>
              </a>
              <a
                href="tel:0444631111"
                className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 font-semibold text-red-700 shadow-sm hover:bg-white dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60 transition-colors"
              >
                <span>PNP Cabanatuan</span>
                <span className="font-bold">(044)-463-1111</span>
              </a>
              <a
                href="tel:0449583701"
                className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 font-semibold text-red-700 shadow-sm hover:bg-white dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60 transition-colors"
              >
                <span>BFP Fire Station</span>
                <span className="font-bold">(044)-958-3701</span>
              </a>
              <a
                href="tel:09190813983"
                className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 font-semibold text-red-700 shadow-sm hover:bg-white dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-900/60 transition-colors"
              >
                <span>Community Affairs</span>
                <span className="font-bold">0919-081-3983</span>
              </a>
            </div>
          </div>

          <ReportClientForm barangays={barangays} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
