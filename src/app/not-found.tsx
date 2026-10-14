import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SearchIcon, ArrowRightIcon, CivicHallIcon } from "@/components/dashboard/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-neutral-900 dark:bg-[#050807] dark:text-white transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div
          className="pointer-events-none absolute left-1/3 top-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[130px]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-lg w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CivicHallIcon size={14} />
            <span>404 • HINDI NATAGPUAN</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
            Hindi Nahanap ang Ordinansa o Pahina
          </h1>

          <p className="text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Paumanhin, ang hinahanap mong pahina, resolusyon, o rekord ay hindi matagpuan sa registry ng Lungsod ng Cabanatuan.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/ordinances">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] transition-all dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <SearchIcon size={15} />
                <span>Maghanap ng Ordinansa</span>
                <ArrowRightIcon size={14} />
              </button>
            </Link>

            <Link href="/">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-all"
              >
                <span>Bumalik sa Home</span>
              </button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
