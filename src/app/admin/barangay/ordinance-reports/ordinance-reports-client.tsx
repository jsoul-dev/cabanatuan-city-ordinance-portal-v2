"use client";

import React, { useState, useCallback, useTransition } from "react";
import { ReportShell } from "@/components/reports/report-shell";
import { ReportTable } from "@/components/reports/report-table";
import { ReportGroup, ReportGrandTotal } from "@/components/reports/report-group";
import { fetchOrdinancesForReport } from "./actions";
import type { OrdinanceReportRow, ReportFilters } from "@/lib/ordinance-report-queries";
import type { PdfReportData, PdfReportSection } from "@/lib/generate-report-pdf";

import {
  FileTextIcon,
  CalendarDaysIcon,
  UsersIcon,
  TagIcon,
  BarChart3Icon,
  ClockIcon,
} from "@/components/dashboard/icons";

// ─── Report Type Definitions ────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: "all", label: "List of All Ordinances", icon: FileTextIcon },
  { id: "by-month", label: "Ordinances by Month", icon: CalendarDaysIcon },
  { id: "by-filed-by", label: "Ordinances by Filed By", icon: UsersIcon },
  { id: "by-category", label: "Ordinances by Category", icon: TagIcon },
  { id: "by-status", label: "Ordinances by Status", icon: BarChart3Icon },
  { id: "by-year", label: "Ordinances by Year", icon: ClockIcon },
] as const;

type ReportTypeId = (typeof REPORT_TYPES)[number]["id"];

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const TYPE_LABELS: Record<string, string> = {
  CITY: "City",
  BARANGAY: "Barangay",
};

// ─── Props ──────────────────────────────────────────────────────────────────

interface FilterOptions {
  barangays: { id: string; name: string }[];
  submitters: { id: string; name: string }[];
  categories: string[];
  years: number[];
}

interface BarangayOrdinanceReportsClientProps {
  filterOptions: FilterOptions;
  userName: string;
  userRole: string;
  scopedBarangayId: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getEffectiveDate(ord: OrdinanceReportRow): Date {
  return ord.dateEnacted ? new Date(ord.dateEnacted) : new Date(ord.createdAt);
}

function getMonthYearKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthYearLabel(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" }).toUpperCase();
}

function getMonthDateRange(key: string): string {
  const [year, month] = key.split("-");
  const y = Number(year);
  const m = Number(month);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
  return `${fmt(start)} - ${fmt(end)}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BarangayOrdinanceReportsClient({
  filterOptions,
  userName,
  userRole,
  scopedBarangayId,
}: BarangayOrdinanceReportsClientProps) {
  const [reportType, setReportType] = useState<ReportTypeId>("all");
  const [filters, setFilters] = useState<ReportFilters>({});
  const [ordinances, setOrdinances] = useState<OrdinanceReportRow[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = useCallback(() => {
    startTransition(async () => {
      const data = await fetchOrdinancesForReport(filters, scopedBarangayId);
      setOrdinances(data);
    });
  }, [filters, scopedBarangayId]);

  const updateFilter = useCallback(
    (key: keyof ReportFilters, value: string | number | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    },
    [],
  );

  // Build filter summary
  const activeFilters: string[] = [];
  if (filters.year) activeFilters.push(`Year: ${filters.year}`);
  if (filters.status && filters.status !== "ALL") activeFilters.push(`Status: ${STATUS_LABELS[filters.status] ?? filters.status}`);
  if (filters.category && filters.category !== "ALL") activeFilters.push(`Category: ${filters.category}`);
  if (filters.submittedById && filters.submittedById !== "ALL") {
    const sub = filterOptions.submitters.find((s) => s.id === filters.submittedById);
    activeFilters.push(`Filed By: ${sub?.name ?? filters.submittedById}`);
  }

  const dateRange =
    filters.dateFrom || filters.dateTo
      ? `${filters.dateFrom ?? "Start"} to ${filters.dateTo ?? "Present"}`
      : filters.year
        ? `Year ${filters.year}`
        : "All Records";

  const reportTitle = REPORT_TYPES.find((r) => r.id === reportType)?.label ?? "";
  const groupedByLabel = reportType === "all" ? undefined : reportTitle.replace("Ordinances by ", "");

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-[var(--text-ink)]">
          Mga Ulat ng Ordinansa
        </h1>
        <p className="text-sm text-[var(--text-mute)] mt-1">
          Pumili ng uri ng ulat at i-generate ang pormal na ulat ng inyong barangay.
        </p>
      </div>

      {/* ── Report Selector + Filters ── */}
      <div className="print:hidden grid gap-4 md:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_2fr]">
        {/* Report Type Selector */}
        <div className="rounded-[var(--radius-md)] border border-[var(--border-hairline)] bg-[var(--bg-card)] p-4 space-y-3">
          <h2 className="text-sm font-semibold text-[var(--text-ink)]">
            Uri ng Ulat
          </h2>
          <fieldset>
            <legend className="sr-only">Select report type</legend>
            <div className="space-y-1">
              {REPORT_TYPES.map((rt) => (
                <label
                  key={rt.id}
                  className={`flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm cursor-pointer transition-colors min-h-[44px] ${
                    reportType === rt.id
                      ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/30"
                      : "text-[var(--text-body)] hover:bg-[var(--bg-canvas)] border border-transparent"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={rt.id}
                    checked={reportType === rt.id}
                    onChange={() => {
                      setReportType(rt.id);
                      setOrdinances(null);
                    }}
                    className="sr-only"
                  />
                  <span aria-hidden="true" className="shrink-0 flex items-center">
                    <rt.icon size={15} />
                  </span>
                  <span>{rt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Filters Panel */}
        <div className="rounded-[var(--radius-md)] border border-[var(--border-hairline)] bg-[var(--bg-card)] p-4 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--text-ink)]">
            Mga Filter
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Year Filter */}
            {reportType !== "by-year" && (
              <div>
                <label htmlFor="filter-year" className="block text-xs font-medium text-[var(--text-mute)] mb-1">Year</label>
                <select
                  id="filter-year"
                  value={filters.year ?? ""}
                  onChange={(e) => updateFilter("year", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
                >
                  <option value="">All Years</option>
                  {filterOptions.years.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
            )}

            {/* Date From */}
            <div>
              <label htmlFor="filter-date-from" className="block text-xs font-medium text-[var(--text-mute)] mb-1">Date From</label>
              <input
                id="filter-date-from"
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e) => updateFilter("dateFrom", e.target.value || undefined)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
              />
            </div>

            {/* Date To */}
            <div>
              <label htmlFor="filter-date-to" className="block text-xs font-medium text-[var(--text-mute)] mb-1">Date To</label>
              <input
                id="filter-date-to"
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => updateFilter("dateTo", e.target.value || undefined)}
                className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
              />
            </div>

            {/* Status Filter */}
            {reportType !== "by-status" && (
              <div>
                <label htmlFor="filter-status" className="block text-xs font-medium text-[var(--text-mute)] mb-1">Status</label>
                <select
                  id="filter-status"
                  value={filters.status ?? "ALL"}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
                >
                  <option value="ALL">All Statuses</option>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                </select>
              </div>
            )}

            {/* Category Filter */}
            {reportType !== "by-category" && (
              <div>
                <label htmlFor="filter-category" className="block text-xs font-medium text-[var(--text-mute)] mb-1">Category</label>
                <select
                  id="filter-category"
                  value={filters.category ?? "ALL"}
                  onChange={(e) => updateFilter("category", e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
                >
                  <option value="ALL">All Categories</option>
                  {filterOptions.categories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            )}

            {/* Filed By Filter */}
            {reportType !== "by-filed-by" && (
              <div>
                <label htmlFor="filter-filed-by" className="block text-xs font-medium text-[var(--text-mute)] mb-1">Filed By</label>
                <select
                  id="filter-filed-by"
                  value={filters.submittedById ?? "ALL"}
                  onChange={(e) => updateFilter("submittedById", e.target.value)}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
                >
                  <option value="ALL">All Submitters</option>
                  {filterOptions.submitters.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M8 13h8" />
                    <path d="M8 17h8" />
                  </svg>
                  I-generate ang Ulat
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setFilters({}); setOrdinances(null); }}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-2.5 text-sm font-medium text-[var(--text-body)] hover:bg-[var(--border-hairline)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors min-h-[44px]"
            >
              I-reset ang Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Report Output ── */}
      {ordinances !== null && (
        <ReportShell
          title={reportTitle.toUpperCase()}
          subtitle="Barangay-Scoped Report"
          dateRange={dateRange}
          groupedBy={groupedByLabel}
          filters={activeFilters.length > 0 ? activeFilters.join(" | ") : undefined}
          generatedBy={userName}
          generatedByRole={userRole}
          totalRecords={ordinances.length}
          pdfData={
            ordinances.length > 0
              ? buildBarangayPdfData(reportType, ordinances, {
                  title: reportTitle.toUpperCase(),
                  subtitle: "Barangay-Scoped Report",
                  dateRange,
                  groupedBy: groupedByLabel,
                  filters: activeFilters.length > 0 ? activeFilters.join(" | ") : undefined,
                  generatedBy: userName,
                  generatedByRole: userRole,
                })
              : undefined
          }
        >
          {ordinances.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400 italic">
              Walang nahanap na ordinansa para sa napiling mga filter.
              <br />
              <span className="text-xs">No ordinance records found for the selected filters.</span>
            </div>
          ) : (
            <BarangayReportBody reportType={reportType} ordinances={ordinances} />
          )}
        </ReportShell>
      )}

      {ordinances === null && (
        <div className="print:hidden rounded-[var(--radius-md)] border border-dashed border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-12 text-center">
          <p className="text-sm text-[var(--text-mute)]">
            Pumili ng uri ng ulat, i-configure ang mga filter, at pindutin ang
            &quot;I-generate ang Ulat&quot; para makita ang report preview dito.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── PDF Data Builder (Barangay) ────────────────────────────────────────────

function toPdfRow(ord: OrdinanceReportRow, colKeys: string[]): string[] {
  const map: Record<string, string> = {
    resolutionNumber: ord.resolutionNumber,
    title: ord.title,
    type: TYPE_LABELS[ord.type] ?? ord.type,
    category: ord.category ?? "—",
    filedBy: ord.submittedBy.name,
    date: formatDate(ord.dateEnacted ?? ord.createdAt),
    status: STATUS_LABELS[ord.status] ?? ord.status,
  };
  return colKeys.map((k) => map[k] ?? "—");
}

interface PdfMeta {
  title: string;
  subtitle?: string;
  dateRange?: string;
  groupedBy?: string;
  filters?: string;
  generatedBy: string;
  generatedByRole: string;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

function buildBarangayPdfData(
  reportType: ReportTypeId,
  ordinances: OrdinanceReportRow[],
  meta: PdfMeta,
): PdfReportData {
  const base: Omit<PdfReportData, "sections" | "grandTotalLabel"> = {
    title: meta.title,
    subtitle: meta.subtitle,
    dateRange: meta.dateRange,
    groupedBy: meta.groupedBy,
    filters: meta.filters,
    generatedBy: meta.generatedBy,
    generatedByRole: meta.generatedByRole,
  };

  switch (reportType) {
    case "all": {
      const colKeys = ["resolutionNumber", "title", "type", "category", "filedBy", "date", "status"];
      const colLabels = ["Resolution No.", "Title", "Type", "Category", "Filed By", "Date", "Status"];
      return {
        ...base,
        sections: [{ heading: "ALL ORDINANCES", columns: colLabels, rows: ordinances.map((o) => toPdfRow(o, colKeys)) }],
        grandTotalLabel: `Total Ordinances: ${ordinances.length}`,
      };
    }
    case "by-month": {
      const colKeys = ["resolutionNumber", "title", "filedBy", "status"];
      const colLabels = ["Resolution No.", "Title", "Filed By", "Status"];
      const groups = groupBy(ordinances, (o) => getMonthYearKey(getEffectiveDate(o)));
      const sortedKeys = [...groups.keys()].sort();
      return {
        ...base,
        sections: sortedKeys.map((key) => ({
          heading: getMonthYearLabel(key), subLabel: getMonthDateRange(key), columns: colLabels,
          rows: groups.get(key)!.map((o) => toPdfRow(o, colKeys)),
        })),
        grandTotalLabel: `Total Months: ${sortedKeys.length}  |  Total Ordinances: ${ordinances.length}`,
      };
    }
    case "by-filed-by": {
      const colKeys = ["resolutionNumber", "title", "date", "status"];
      const colLabels = ["Resolution No.", "Title", "Date", "Status"];
      const groups = groupBy(ordinances, (o) => o.submittedBy.name);
      const sortedKeys = [...groups.keys()].sort();
      return {
        ...base,
        sections: sortedKeys.map((key) => ({
          heading: `FILED BY: ${key.toUpperCase()}`, columns: colLabels,
          rows: groups.get(key)!.map((o) => toPdfRow(o, colKeys)),
        })),
        grandTotalLabel: `Total Filers: ${sortedKeys.length}  |  Total Ordinances: ${ordinances.length}`,
      };
    }
    case "by-category": {
      const colKeys = ["resolutionNumber", "title", "date", "filedBy", "status"];
      const colLabels = ["Resolution No.", "Title", "Date", "Filed By", "Status"];
      const groups = groupBy(ordinances, (o) => o.category ?? "Uncategorized");
      const sortedKeys = [...groups.keys()].sort();
      return {
        ...base,
        sections: sortedKeys.map((key) => ({
          heading: key.toUpperCase(), columns: colLabels,
          rows: groups.get(key)!.map((o) => toPdfRow(o, colKeys)),
        })),
        grandTotalLabel: `Total Categories: ${sortedKeys.length}  |  Total Ordinances: ${ordinances.length}`,
      };
    }
    case "by-status": {
      const colKeys = ["resolutionNumber", "title", "date", "filedBy", "category"];
      const colLabels = ["Resolution No.", "Title", "Date", "Filed By", "Category"];
      const groups = groupBy(ordinances, (o) => STATUS_LABELS[o.status] ?? o.status);
      const statusOrder = ["Draft", "Pending", "Approved", "Rejected"];
      const sortedKeys = [...groups.keys()].sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));
      const parts = sortedKeys.map((k) => `${k}: ${groups.get(k)!.length}`).join("  |  ");
      return {
        ...base,
        sections: sortedKeys.map((key) => ({
          heading: `STATUS: ${key.toUpperCase()}`, columns: colLabels,
          rows: groups.get(key)!.map((o) => toPdfRow(o, colKeys)),
        })),
        grandTotalLabel: `${parts}  |  Total: ${ordinances.length}`,
      };
    }
    case "by-year": {
      const colKeys = ["resolutionNumber", "title", "type", "filedBy", "status"];
      const colLabels = ["Resolution No.", "Title", "Type", "Filed By", "Status"];
      const groups = groupBy(ordinances, (o) => String(o.year ?? getEffectiveDate(o).getFullYear()));
      const sortedKeys = [...groups.keys()].sort();
      return {
        ...base,
        sections: sortedKeys.map((key) => ({
          heading: `YEAR ${key}`, subLabel: `January 1, ${key} - December 31, ${key}`, columns: colLabels,
          rows: groups.get(key)!.map((o) => toPdfRow(o, colKeys)),
        })),
        grandTotalLabel: `Total Years: ${sortedKeys.length}  |  Total Ordinances: ${ordinances.length}`,
      };
    }
    default:
      return { ...base, sections: [], grandTotalLabel: `Total: ${ordinances.length}` };
  }
}

// ─── Report Body ────────────────────────────────────────────────────────────

function BarangayReportBody({
  reportType,
  ordinances,
}: {
  reportType: ReportTypeId;
  ordinances: OrdinanceReportRow[];
}) {
  const COL_RES_NO = { key: "resolutionNumber", label: "Resolution No.", width: "130px" };
  const COL_TITLE = { key: "title", label: "Title" };
  const COL_TYPE = { key: "type", label: "Type", width: "80px" };
  const COL_CATEGORY = { key: "category", label: "Category", width: "120px" };
  const COL_FILED_BY = { key: "filedBy", label: "Filed By", width: "120px" };
  const COL_DATE = { key: "date", label: "Date", width: "100px" };
  const COL_STATUS = { key: "status", label: "Status", width: "80px" };

  function toRow(ord: OrdinanceReportRow): Record<string, React.ReactNode> {
    return {
      id: ord.id,
      resolutionNumber: ord.resolutionNumber,
      title: ord.title,
      type: TYPE_LABELS[ord.type] ?? ord.type,
      category: ord.category ?? "—",
      filedBy: ord.submittedBy.name,
      date: formatDate(ord.dateEnacted ?? ord.createdAt),
      status: STATUS_LABELS[ord.status] ?? ord.status,
    };
  }

  switch (reportType) {
    case "all": {
      const columns = [COL_RES_NO, COL_TITLE, COL_TYPE, COL_CATEGORY, COL_FILED_BY, COL_DATE, COL_STATUS];
      return (
        <>
          <ReportTable columns={columns} rows={ordinances.map(toRow)} />
          <ReportGrandTotal items={[{ label: "Total Ordinances", value: ordinances.length }]} />
        </>
      );
    }
    case "by-month": {
      const columns = [COL_RES_NO, COL_TITLE, COL_FILED_BY, COL_STATUS];
      const groups = new Map<string, OrdinanceReportRow[]>();
      for (const ord of ordinances) {
        const key = getMonthYearKey(getEffectiveDate(ord));
        const list = groups.get(key) ?? [];
        list.push(ord);
        groups.set(key, list);
      }
      const sortedKeys = [...groups.keys()].sort();
      return (
        <>
          {sortedKeys.map((key, i) => (
            <ReportGroup
              key={key}
              heading={getMonthYearLabel(key)}
              subLabel={getMonthDateRange(key)}
              columns={columns}
              rows={groups.get(key)!.map(toRow)}
              variant={i % 2 === 0 ? "green" : "blue"}
            />
          ))}
          <ReportGrandTotal items={[{ label: "Total Months", value: sortedKeys.length }, { label: "Total Ordinances", value: ordinances.length }]} />
        </>
      );
    }
    case "by-filed-by": {
      const columns = [COL_RES_NO, COL_TITLE, COL_DATE, COL_STATUS];
      const groups = new Map<string, OrdinanceReportRow[]>();
      for (const ord of ordinances) { const key = ord.submittedBy.name; const list = groups.get(key) ?? []; list.push(ord); groups.set(key, list); }
      const sortedKeys = [...groups.keys()].sort();
      return (
        <>
          {sortedKeys.map((key, i) => (
            <ReportGroup key={key} heading={`FILED BY: ${key.toUpperCase()}`} columns={columns} rows={groups.get(key)!.map(toRow)} variant={i % 2 === 0 ? "green" : "blue"} />
          ))}
          <ReportGrandTotal items={[{ label: "Total Filers", value: sortedKeys.length }, { label: "Total Ordinances", value: ordinances.length }]} />
        </>
      );
    }
    case "by-category": {
      const columns = [COL_RES_NO, COL_TITLE, COL_DATE, COL_FILED_BY, COL_STATUS];
      const groups = new Map<string, OrdinanceReportRow[]>();
      for (const ord of ordinances) { const key = ord.category ?? "Uncategorized"; const list = groups.get(key) ?? []; list.push(ord); groups.set(key, list); }
      const sortedKeys = [...groups.keys()].sort();
      return (
        <>
          {sortedKeys.map((key, i) => (
            <ReportGroup key={key} heading={key.toUpperCase()} columns={columns} rows={groups.get(key)!.map(toRow)} variant={i % 2 === 0 ? "green" : "amber"} />
          ))}
          <ReportGrandTotal items={[{ label: "Total Categories", value: sortedKeys.length }, { label: "Total Ordinances", value: ordinances.length }]} />
        </>
      );
    }
    case "by-status": {
      const columns = [COL_RES_NO, COL_TITLE, COL_DATE, COL_FILED_BY, COL_CATEGORY];
      const groups = new Map<string, OrdinanceReportRow[]>();
      for (const ord of ordinances) { const key = STATUS_LABELS[ord.status] ?? ord.status; const list = groups.get(key) ?? []; list.push(ord); groups.set(key, list); }
      const statusOrder = ["Draft", "Pending", "Approved", "Rejected"];
      const sortedKeys = [...groups.keys()].sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));
      return (
        <>
          {sortedKeys.map((key, i) => (
            <ReportGroup key={key} heading={`STATUS: ${key.toUpperCase()}`} columns={columns} rows={groups.get(key)!.map(toRow)} variant={i % 2 === 0 ? "green" : "blue"} />
          ))}
          <ReportGrandTotal items={[...sortedKeys.map((key) => ({ label: key, value: groups.get(key)!.length })), { label: "Total", value: ordinances.length }]} />
        </>
      );
    }
    case "by-year": {
      const columns = [COL_RES_NO, COL_TITLE, COL_TYPE, COL_FILED_BY, COL_STATUS];
      const groups = new Map<string, OrdinanceReportRow[]>();
      for (const ord of ordinances) { const effectiveYear = ord.year ?? getEffectiveDate(ord).getFullYear(); const key = String(effectiveYear); const list = groups.get(key) ?? []; list.push(ord); groups.set(key, list); }
      const sortedKeys = [...groups.keys()].sort();
      return (
        <>
          {sortedKeys.map((key, i) => (
            <ReportGroup key={key} heading={`YEAR ${key}`} subLabel={`January 1, ${key} - December 31, ${key}`} columns={columns} rows={groups.get(key)!.map(toRow)} variant={i % 2 === 0 ? "green" : "blue"} />
          ))}
          <ReportGrandTotal items={[{ label: "Total Years", value: sortedKeys.length }, { label: "Total Ordinances", value: ordinances.length }]} />
        </>
      );
    }
    default:
      return null;
  }
}
