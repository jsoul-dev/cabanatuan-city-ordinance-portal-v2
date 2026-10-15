import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OrdinanceArchiveCanvas } from "@/components/3d/ordinance-archive-canvas";
import {
  OrdinanceAiSimulator,
  BarangayDistrictShowcase,
} from "@/components/home/landing-interactive-sections";
import {
  OrdinancesScrollIcon,
  AiBotSparkleIcon,
  CommunityReportIcon,
  SearchIcon,
  ShieldCheckIcon,
  CivicHallIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  Building2Icon,
  FlameIcon,
  CarIcon,
  Volume2Icon,
} from "@/components/dashboard/icons";

/**
 * Redesigned Cabanatuan City Ordinance Portal Landing Page
 * Guided by modern-website-ui (dynamic 100dvh, Golden Ratio 1.618 split, Apple tactile motion),
 * antislop (authentic Cabanatuan emerald and gold identity, zero generic AI slop),
 * and interactive Three.js 3D Ordinance Archive visualization.
 */
export default async function LandingPage() {
  const [ordinanceCount, barangayCount, reportCount, approvedOrdinances] =
    await Promise.all([
      prisma.ordinance.count({ where: { status: "APPROVED" } }),
      prisma.barangay.count(),
      prisma.report.count({ where: { status: "RESOLVED" } }),
      prisma.ordinance.findMany({
        where: { status: "APPROVED" },
        take: 48,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          resolutionNumber: true,
          ordinanceLabel: true,
          title: true,
        },
      }),
    ]);

  const archiveOrdinances = approvedOrdinances.map((o) => ({
    id: o.ordinanceLabel || `Ordinance No. ${o.resolutionNumber}`,
    title: o.title,
    href: `/ordinances/${o.slug}`,
  }));

  // Cabanatuan officially comprises 89 barangays
  const verifiedBarangayCount = 89;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-ink)] selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="relative overflow-hidden">
        {/* Subtle Civic Ambient Background */}
        <div
          className="pointer-events-none absolute left-1/4 top-0 h-[650px] w-[650px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[150px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-10 top-24 h-[500px] w-[500px] rounded-full bg-amber-500/5 dark:bg-emerald-500/10 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        {/* ─── 1. HERO VIEWPORT (min-height: 100dvh Golden Ratio Split) ─── */}
        <section className="relative z-10 flex min-h-[calc(100dvh-4rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column (61.8% Dominant Composition) */}
            <div className="flex flex-col justify-center lg:col-span-7">
              {/* Civic Authority Badge */}
              <div className="mb-5 inline-flex w-fit items-center gap-2.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>LUNGSOD NG CABANATUAN • REP. ACT NO. 526</span>
              </div>

              {/* Responsive Display Typography */}
              <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-5xl lg:text-6xl lg:leading-[1.12]">
                Mga Ordinansa ng Lungsod,{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-800 to-amber-700 dark:from-emerald-400 dark:via-emerald-200 dark:to-amber-300 bg-clip-text text-transparent">
                  Malinaw at Bukas sa Bawat Mamamayan.
                </span>
              </h1>

              {/* Authoritative Civic Description */}
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-body)] sm:text-lg">
                Ang opisyal na digital ordinance registry at AI assistant ng
                Lungsod ng Cabanatuan. Madaling maghanap ng ordinansa, alamin ang
                mga multa at parusa, at direktang mag-ulat sa inyong barangay nang
                may bilis at transparency.
              </p>

              {/* Hero Ordinance Search Form */}
              <form action="/ordinances" method="GET" className="mt-8 flex w-full max-w-lg items-center gap-2">
                <div className="relative flex-1">
                  <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Maghanap ng ordinansa (hal. traffic, curfew, basura)..."
                    className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-card)] py-3 pl-10 pr-4 text-sm font-medium text-[var(--text-ink)] placeholder-[var(--text-mute)] shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  <span>Hanapin</span>
                  <ArrowRightIcon size={14} />
                </button>
              </form>

              {/* Action Buttons with Apple tactile feedback */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link href="/chatbot">
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/80 px-4 py-2.5 text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-[0.98] dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-900/40"
                  >
                    <AiBotSparkleIcon size={16} />
                    <span>Magtanong sa AI Assistant</span>
                  </button>
                </Link>

                <Link
                  href="/login"
                  className="text-xs font-semibold text-[var(--text-mute)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-2"
                >
                  Opisyal ng Barangay o LGU? Mag-login sa Portal →
                </Link>
              </div>

              {/* Civic Quick Facts Strip */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-[var(--border-hairline)] pt-6 text-xs text-[var(--text-mute)]">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Sangguniang Panlungsod Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2Icon size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>89 Barangay Halls Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Zero-Delay AI Retrieval</span>
                </div>
              </div>
            </div>

            {/* Right Column (38.2% Interactive 3D Three.js Ordinance Archive Tower) */}
            <div className="relative flex flex-col items-center justify-center lg:col-span-5">
              <div className="relative w-full rounded-3xl border border-[var(--border-hairline)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-canvas)] p-3 shadow-2xl backdrop-blur-xl">
                {/* 3D Canvas */}
                <div className="h-[420px] sm:h-[460px] w-full overflow-hidden rounded-2xl">
                  <OrdinanceArchiveCanvas
                    interactive={true}
                    ordinances={archiveOrdinances}
                  />
                </div>

                {/* Floating Top Header on 3D Container */}
                <div className="pointer-events-none absolute top-6 left-6 right-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-card)]/80 px-3 py-1.5 backdrop-blur-md">
                    <Image
                      src="/lgu-logo.png"
                      alt="Cabanatuan LGU Seal"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <span className="font-mono text-[11px] font-bold text-[var(--text-ink)]">
                      Cabanatuan Ordinance Archive 3D
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. LIVE METRICS STRIP (Tabular Numbers & Golden Ratio Spacing) ─── */}
        <section className="border-y border-[var(--border-hairline)] bg-[var(--bg-card)]/70 backdrop-blur-md py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="space-y-1 border-l-2 border-emerald-500 pl-4">
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tabular-nums">
                  {ordinanceCount.toLocaleString()}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
                  Mga Naaprubahang Ordinansa
                </p>
              </div>

              <div className="space-y-1 border-l-2 border-emerald-500 pl-4">
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tabular-nums">
                  {verifiedBarangayCount}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
                  Mga Barangay sa Lungsod
                </p>
              </div>

              <div className="space-y-1 border-l-2 border-amber-500 pl-4">
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tabular-nums">
                  {reportCount.toLocaleString()}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
                  Naresolbang Ulat ng Mamamayan
                </p>
              </div>

              <div className="space-y-1 border-l-2 border-emerald-500 pl-4">
                <p className="font-mono text-3xl sm:text-4xl font-extrabold text-[var(--text-ink)] tabular-nums">
                  24 / 7
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
                  AI Tagalog & English Support
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. ASYMMETRIC SERVICES MATRIX (Anti-Slop Editorial Design) ─── */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase mb-2">
              <CivicHallIcon size={13} />
              <span>PANGUNAHING SERBISYO NG PORTAL</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-ink)] sm:text-4xl">
              Transparent, Mabilis, at Abot-Kamay na Pamamahala
            </h2>
            <p className="mt-2 text-sm text-[var(--text-body)] max-w-2xl">
              Idinisenyo para sa mamamayan ng Cabanatuan upang maihatid ang mga
              ordinansa ng lungsod nang walang alinlangan at walang kumplikasyon.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Dominant Feature Card (7 Columns): Smart Ordinance Explorer */}
            <div className="flex flex-col justify-between rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-card)] p-8 shadow-xl lg:col-span-7">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <OrdinancesScrollIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-ink)]">
                        Ordinance Registry & Search
                      </h3>
                      <p className="text-xs text-[var(--text-mute)]">
                        Komprehensibong database ng City at Barangay Ordinances
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Sangguniang Panlungsod
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-[var(--text-body)]">
                  Maghanap gamit ang pamagat, taon, resolusyon, o kategorya. Bawat
                  ordinansa ay may buod, eksaktong parusa, kaukulang multa, at
                  na-extract na opisyal na dokumento.
                </p>

                {/* Simulated Quick Category Tags */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { label: "Kaligtasang Publiko", icon: ShieldCheckIcon },
                    { label: "Basura at Kalikasan", icon: FlameIcon },
                    { label: "Trapiko at Kalsada", icon: CarIcon },
                    { label: "Katahimikan at Ingay", icon: Volume2Icon },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={`/ordinances?search=${encodeURIComponent(cat.label)}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-body)] hover:border-emerald-500/50 hover:text-[var(--text-ink)] transition-colors"
                    >
                      <cat.icon size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-mute)] font-mono">
                  {ordinanceCount} na-index na ordinansa
                </span>
                <Link
                  href="/ordinances"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Buksan ang Ordinance Explorer</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>

            {/* Secondary Feature Card (5 Columns): AI Citizen Ordinance Information Assistant */}
            <div className="flex flex-col justify-between rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-card)] p-8 shadow-xl lg:col-span-5">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <AiBotSparkleIcon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-ink)]">
                        AI Citizen Assistant
                      </h3>
                      <p className="text-xs text-[var(--text-mute)]">
                        Grounded sa opisyal na LGU database
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-[var(--text-body)]">
                  May tanong tungkol sa curfew, multa sa videoke, o business
                  permit? Tanungin ang AI sa Tagalog o English. Hindi ito
                  nag-iimbento ng sagot kundi direktang sumisipi sa mga opisyal na ordinansa ng lungsod.
                </p>

                <div className="mt-6 rounded-2xl border border-emerald-600/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2Icon size={14} />
                    <span>Halimbawa ng mga Katanungan:</span>
                  </div>
                  <p className="text-xs italic text-[var(--text-body)]">
                    &quot;Ano po ang multa kapag nag-videoke lagpas alas-diyes ng gabi?&quot;
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <span className="text-xs text-[var(--text-mute)] font-mono">
                  Multi-turn RAG Architecture
                </span>
                <Link
                  href="/chatbot"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <span>Magsimulang Magtanong</span>
                  <ArrowRightIcon size={14} />
                </Link>
              </div>
            </div>

            {/* Full-Width Feature Card (12 Columns): Community Action & Incident Reporting */}
            <div className="rounded-3xl border border-[var(--border-hairline)] bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card)] to-emerald-950/10 p-8 shadow-xl lg:col-span-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <CommunityReportIcon size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-ink)]">
                      Citizen Community Reporting Portal
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--text-body)]">
                    May paglabag ba sa inyong komunidad? Magsumite ng ulat para sa
                    pagsusunog ng basura, ingay, o sagabal sa kalsada. Direktang
                    ipapadala ang inyong ulat sa kaukulang Barangay Hall at LGU
                    Desk nang may privacy at real-time status tracking.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/report">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition-all"
                    >
                      <CommunityReportIcon size={16} />
                      <span>Magsumite ng Ulat</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. INTERACTIVE ORDINANCE AI SIMULATOR ─── */}
        <section className="border-t border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase mb-2">
                <AiBotSparkleIcon size={13} />
                <span>INTERACTIVE CIVIC SIMULATION</span>
              </div>
              <h2 className="text-3xl font-extrabold text-[var(--text-ink)] sm:text-4xl">
                Alamin ang Ordinansa Bago Ka Mahuli
              </h2>
              <p className="mt-2 text-sm text-[var(--text-body)]">
                Pindutin ang anumang paksa sa ibaba upang makita ang eksaktong
                resolusyon, patakaran, at karampatang parusa.
              </p>
            </div>

            <OrdinanceAiSimulator />
          </div>
        </section>

        {/* ─── 5. 89 BARANGAYS DECENTRALIZED NETWORK ─── */}
        <section className="border-t border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <BarangayDistrictShowcase />
          </div>
        </section>

        {/* ─── 6. CIVIC TRUST CLOSING CTA ─── */}
        <section className="border-t border-[var(--border-hairline)] bg-[var(--bg-card)] py-20 text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-2 shadow-sm">
              <Image
                src="/lgu-logo.png"
                alt="Cabanatuan City LGU Seal"
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            </div>

            <h2 className="text-3xl font-extrabold text-[var(--text-ink)] sm:text-4xl">
              Handa nang mag-explore ng mga Ordinansa ng Lungsod?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
              Lahat ng resolusyon mula sa Sangguniang Panlungsod at mga Barangay
              Halls ay bukas para sa bawat Cabanatueño. Maging may-alam, maging
              responsable.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/ordinances">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 active:scale-[0.98] transition-all dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  <SearchIcon size={16} />
                  <span>Tuklasin ang mga Ordinansa</span>
                  <ArrowRightIcon size={16} />
                </button>
              </Link>
              <Link href="/chatbot">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50/80 px-6 py-3.5 text-sm font-bold text-emerald-800 hover:bg-emerald-100 active:scale-[0.98] transition-all dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                >
                  <AiBotSparkleIcon size={16} />
                  <span>Magtanong sa AI Assistant</span>
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
