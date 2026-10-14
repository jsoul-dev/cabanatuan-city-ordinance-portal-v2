"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Ordinance, Barangay } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { clsx } from "clsx";
import { cleanOrdinanceTitle, formatOrdinanceYear, formatResolutionNumber, formatResolutionDisplay, formatCoverage } from "@/lib/ordinance-utils";
import { OrdinancePdfButton } from "./[slug]/ordinance-pdf-button";

type OrdinanceWithBarangay = Omit<Ordinance, "pdfUrl" | "tags"> & {
  barangay: Barangay | null;
  pdfUrl?: string | null;
  tags: string[];
};

interface OrdinanceExplorerClientProps {
  initialOrdinances: OrdinanceWithBarangay[];
  barangays: Barangay[];
  initialSearch?: string;
}

export function OrdinanceExplorerClient({
  initialOrdinances,
  barangays,
  initialSearch = "",
}: OrdinanceExplorerClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<"ALL" | "CITY" | "BARANGAY">("ALL");
  const [selectedBarangayId, setSelectedBarangayId] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [isYearRangeMode, setIsYearRangeMode] = useState<boolean>(false);
  const [selectedYearStart, setSelectedYearStart] = useState<string>("ALL");
  const [selectedYearEnd, setSelectedYearEnd] = useState<string>("ALL");

  // Removed PDF modal state since OrdinancePdfButton handles it internally.

  // Compute available years from database, fallback to 2015-2026
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    // Default fallback range 2015 - 2026
    for (let y = 2026; y >= 2015; y--) {
      yearsSet.add(y);
    }
    initialOrdinances.forEach((ord) => {
      const ordYear = formatOrdinanceYear(ord.year, ord.dateEnacted, ord.createdAt);
      if (ordYear) yearsSet.add(ordYear);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [initialOrdinances]);

  // Compute available categories
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    const defaultCategories = [
      "General", "Environment", "Public Safety", "Health", "Infrastructure",
      "Education", "Livelihood", "Youth", "Senior Citizens", "Women & Children",
    ];
    defaultCategories.forEach((c) => set.add(c));
    initialOrdinances.forEach((ord) => {
      if (ord.category) set.add(ord.category);
    });
    return Array.from(set).sort();
  }, [initialOrdinances]);

  // Filter ordinances based on search query, type, barangay, category, and year
  const filteredOrdinances = useMemo(() => {
    return initialOrdinances.filter((ord) => {
      // 1. Type Filter
      if (selectedType !== "ALL" && ord.type !== selectedType) {
        return false;
      }

      // 2. Barangay Filter
      if (selectedBarangayId !== "ALL" && ord.barangayId !== selectedBarangayId) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== "ALL" && (ord.category || "General") !== selectedCategory) {
        return false;
      }

      // 4. Year Filter
      if (isYearRangeMode) {
        if (selectedYearStart !== "ALL" || selectedYearEnd !== "ALL") {
          const ordYear = formatOrdinanceYear(ord.year, ord.dateEnacted, ord.createdAt);
          if (ordYear) {
            const start = selectedYearStart === "ALL" ? -Infinity : parseInt(selectedYearStart, 10);
            const end = selectedYearEnd === "ALL" ? Infinity : parseInt(selectedYearEnd, 10);
            if (ordYear < start || ordYear > end) {
              return false;
            }
          } else {
            return false; // If we can't determine year, exclude it from range searches
          }
        }
      } else {
        if (selectedYear !== "ALL") {
          const ordYear = formatOrdinanceYear(ord.year, ord.dateEnacted, ord.createdAt);
          if (ordYear.toString() !== selectedYear) {
            return false;
          }
        }
      }

      // 5. Keyword Search (Title, Resolution No, Content, Tags, Coverage)
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const cleanTitle = cleanOrdinanceTitle(ord.title).toLowerCase();
        const matchTitle = cleanTitle.includes(query) || ord.title.toLowerCase().includes(query);
        const matchRes = ord.resolutionNumber.toLowerCase().includes(query);
        const matchContent = ord.content?.toLowerCase().includes(query) ?? false;
        const matchDesc = ord.description?.toLowerCase().includes(query) ?? false;
        const matchTags = ord.tags?.some((t) => t.toLowerCase().includes(query)) ?? false;
        const matchCoverage = ord.coverage?.toLowerCase().includes(query) ?? false;

        if (!matchTitle && !matchRes && !matchContent && !matchDesc && !matchTags && !matchCoverage) {
          return false;
        }
      }

      return true;
    });
  }, [initialOrdinances, selectedType, selectedBarangayId, selectedCategory, selectedYear, searchQuery, isYearRangeMode, selectedYearStart, selectedYearEnd]);

  return (
    <div className="space-y-6">
      {/* Search Bar & Primary Filters */}
      <div className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--border-hairline)] bg-[var(--bg-card)] p-4 shadow-sm">
        {/* Search Input */}
        <div className="w-full">
          <Input
            label="Mag-search ng Ordinansa (Title, Resolution No., Keyword, Tag)"
            placeholder="Hal. pagsusunog, basura, curfew, Res No. 003, environment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            }
          />
        </div>

        {/* Filter Toolbar (Type, Barangay, Category, Year) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-[var(--border-hairline)]">
          {/* Type Selector */}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
              Uri ng Ordinansa
            </label>
            <div className="flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-0.5">
              {(["ALL", "CITY", "BARANGAY"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={clsx(
                    "flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors min-h-[36px]",
                    selectedType === type
                      ? "bg-[var(--accent-primary)] text-white shadow-sm"
                      : "text-[var(--text-body)] hover:text-[var(--text-ink)]"
                  )}
                >
                  {type === "ALL" ? "Lahat" : type === "CITY" ? "City" : "Barangay"}
                </button>
              ))}
            </div>
          </div>

          {/* Barangay Select */}
          <div>
            <label htmlFor="barangay-select" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
              Barangay
            </label>
            <select
              id="barangay-select"
              value={selectedBarangayId}
              onChange={(e) => setSelectedBarangayId(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            >
              <option value="ALL">Lahat ng Barangay</option>
              {barangays.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <label htmlFor="category-select" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
              Kategorya
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            >
              <option value="ALL">Lahat ng Kategorya</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Year Select */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="year-select" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
                Taon
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsYearRangeMode(!isYearRangeMode);
                  setSelectedYear("ALL");
                  setSelectedYearStart("ALL");
                  setSelectedYearEnd("ALL");
                }}
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                {isYearRangeMode ? "Isang Taon" : "Gawing Range"}
              </button>
            </div>
            {isYearRangeMode ? (
              <div className="flex items-center gap-2">
                <select
                  aria-label="Mula Taon"
                  value={selectedYearStart}
                  onChange={(e) => setSelectedYearStart(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                >
                  <option value="ALL">Mula...</option>
                  {availableYears.map((y) => (
                    <option key={`start-${y}`} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Hanggang Taon"
                  value={selectedYearEnd}
                  onChange={(e) => setSelectedYearEnd(e.target.value)}
                  className="h-10 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                >
                  <option value="ALL">Hanggang...</option>
                  {availableYears.map((y) => (
                    <option key={`end-${y}`} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="h-10 w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 text-xs font-medium text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              >
                <option value="ALL">Lahat ng Taon</option>
                {availableYears.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Quick Tag Pill Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-[var(--text-mute)] mr-1">Tanyag na Tag:</span>
          {["Curfew", "Basura", "Kalusugan", "Segregation", "Kapayapaan", "Kabataan"].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(searchQuery.toLowerCase() === tag.toLowerCase() ? "" : tag)}
              className={clsx(
                "rounded-full border border-[var(--border-hairline)] px-2.5 py-0.5 text-xs font-medium transition-colors",
                searchQuery.toLowerCase() === tag.toLowerCase()
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                  : "bg-[var(--bg-canvas)] text-[var(--text-mute)] hover:bg-emerald-500/10 hover:text-[var(--text-ink)]"
              )}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Counter & Reset */}
      <div className="flex items-center justify-between text-sm text-[var(--text-mute)]">
        <p>
          Ipinapakita ang{" "}
          <span className="font-semibold text-[var(--text-ink)]">{filteredOrdinances.length}</span>{" "}
          sa <span className="font-semibold">{initialOrdinances.length}</span> ordinansa
        </p>
        {(searchQuery || selectedType !== "ALL" || selectedBarangayId !== "ALL" || selectedCategory !== "ALL" || selectedYear !== "ALL" || selectedYearStart !== "ALL" || selectedYearEnd !== "ALL") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedType("ALL");
              setSelectedBarangayId("ALL");
              setSelectedCategory("ALL");
              setSelectedYear("ALL");
              setSelectedYearStart("ALL");
              setSelectedYearEnd("ALL");
              setIsYearRangeMode(false);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="inline-block"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>{" "}I-reset ang lahat ng filter
          </Button>
        )}
      </div>

      {/* Ordinances Grid / List */}
      {filteredOrdinances.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-hairline)] bg-[var(--bg-card)] p-12 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-neutral-400" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <h3 className="text-base font-semibold text-[var(--text-ink)]">
            Walang nahanap na ordinansa
          </h3>
          <p className="mt-1 text-sm text-[var(--text-body)]">
            Subukang baguhin ang iyong search query o i-reset ang mga filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredOrdinances.map((ord) => {
            const cleanTitle = cleanOrdinanceTitle(ord.title);
            const ordYear = formatOrdinanceYear(ord.year, ord.dateEnacted, ord.createdAt);
            const hasPdf = Boolean(ord.pdfUrl);

            return (
              <Card
                key={ord.id}
                className="flex flex-col justify-between transition-all duration-200 hover:shadow-[var(--shadow-floating)] border border-[var(--border-hairline)] bg-[var(--bg-card)] group"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={ord.type === "CITY" ? "city" : "barangay"}>
                          {ord.type === "CITY" ? "City Ordinance" : `Brgy. ${ord.barangay?.name ?? "N/A"}`}
                        </Badge>
                        {ord.category && (
                          <span className="inline-flex items-center rounded-full bg-[var(--bg-canvas)] border border-[var(--border-hairline)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-mute)]">
                            {ord.category}
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {ordYear}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-medium text-[var(--text-mute)] whitespace-nowrap">
                        Res. No. {formatResolutionDisplay(ord.resolutionNumber)}
                      </span>
                    </div>

                    <CardTitle className="text-base font-bold text-[var(--text-ink)] line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cleanTitle}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-3">
                    {/* Summary / Description / Content snippet */}
                    <CardDescription className="line-clamp-3 text-xs leading-relaxed text-[var(--text-body)]">
                      {ord.description || ord.content || "Walang nakalagay na buod."}
                    </CardDescription>

                    {/* Tag pills */}
                    {ord.tags && ord.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {ord.tags.slice(0, 4).map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded bg-[var(--bg-canvas)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-mute)]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {ord.tags.length > 4 && (
                          <span className="text-[10px] text-[var(--text-mute)]">+{ord.tags.length - 4} pa</span>
                        )}
                      </div>
                    )}

                    {/* Coverage badge if present */}
                    {ord.coverage && (
                      <div className="text-[11px] text-[var(--text-mute)] flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <span>Coverage:</span>
                        <span className="font-medium text-[var(--text-ink)]">{formatCoverage(ord.coverage, ord.type, ord.barangay?.name)}</span>
                      </div>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="border-t border-[var(--border-hairline)] pt-3.5 pb-4 px-6 flex items-center justify-between gap-2 bg-[var(--bg-canvas)]/50">
                  <span className="text-xs text-[var(--text-mute)]">
                    Enacted:{" "}
                    <span className="truncate">
                      {ord.dateEnacted
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
                        : `Taon ${formatOrdinanceYear(ord.year, ord.dateEnacted, ord.createdAt)}`}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    {hasPdf && (
                      <OrdinancePdfButton
                        pdfUrl={`/api/ordinances/${ord.slug}/pdf`}
                        title={cleanTitle}
                        resolutionNumber={ord.resolutionNumber}
                        slug={ord.slug}
                        category={ord.category}
                        coverage={formatCoverage(ord.coverage, ord.type, ord.barangay?.name)}
                        description={ord.description}
                        articles={ord.articles}
                        penalties={ord.penalties}
                        signatories={ord.signatories}
                        variant="compact"
                      />
                    )}

                    <Link href={`/ordinances/${ord.slug}`}>
                      <Button variant="secondary" size="sm" className="h-8 px-3 text-xs font-semibold">
                        Basahin ang Buong Ordinansa →
                      </Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
