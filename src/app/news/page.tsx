import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { NewspaperIcon } from "@/components/dashboard/icons";

export const metadata: Metadata = {
  title: "Mga Balita at Anunsyo | Cabanatuan City Ordinance Portal",
  description:
    "Mga pinakabagong balita, public hearings, at pamahalaang lokal na anunsyo mula sa Lungsod ng Cabanatuan at mga barangay.",
};

export default async function NewsPage() {
  const newsList = await prisma.newsItem.findMany({
    orderBy: {
      publishedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-[#050807] dark:text-white selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main id="main-content" className="relative flex-1 overflow-hidden py-12">
        {/* Aurora Glow & Scanlines */}
        <div
          className="pointer-events-none absolute right-1/3 top-10 h-[500px] w-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>OPISYAL NA ANUNSYO AT BALITA • CABANATUAN LGU</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white sm:text-4xl lg:text-5xl">
              Mga Balita at Anunsyo
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 sm:text-base">
              Subaybayan ang mga bagong ordinansa, mga public hearing at anunsyo, at
              mahahalagang pahayag mula sa LGU ng Cabanatuan at mga barangay.
            </p>
          </div>

          {/* News Feed */}
          {newsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center shadow-sm dark:border-white/10 dark:bg-[#0a0f0d]/90 dark:shadow-none backdrop-blur-xl">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <NewspaperIcon size={24} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                Walang nakatalang anunsyo
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Balikan mamaya para sa mga panibagong balita ng lungsod.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {newsList.map((item) => (
                <Card
                  key={item.id}
                  className="transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:border-emerald-500/50 dark:hover:bg-[#0f1713]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {item.category && (
                          <Badge variant="city">{item.category}</Badge>
                        )}
                        <span className="text-xs font-mono text-neutral-500">
                          {new Date(item.publishedAt).toLocaleDateString(
                            "tl-PH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-neutral-900 dark:text-white">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 whitespace-pre-line">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
