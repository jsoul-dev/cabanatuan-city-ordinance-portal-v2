"use client";

import { useState, useTransition } from "react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { toast } from "sonner";
import { updateBarangayReportStatus } from "../actions";
import {
  FlameIcon,
  Volume2Icon,
  BarrierIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  PlusIcon,
  HourglassIcon,
  CheckCircle2Icon,
  BanIcon,
  InboxEmptyIcon,
} from "@/components/dashboard/icons";

type ReportStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "DISMISSED";
type ReportType = "TRASH_BURNING" | "NOISE" | "ROAD_OBSTRUCTION" | "OTHER";

type Report = {
  id: string;
  type: ReportType;
  description: string;
  contactName: string | null;
  contactPhone: string | null;
  isAnonymous: boolean;
  status: ReportStatus;
  submittedAt: Date;
  resolvedAt: Date | null;
  barangay: { name: string };
};

const TYPE_CONFIG: Record<ReportType, { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  TRASH_BURNING:    { label: "Pagsusunog ng Basura", icon: FlameIcon },
  NOISE:            { label: "Ingay at Kaguluhan", icon: Volume2Icon },
  ROAD_OBSTRUCTION: { label: "Sagabal sa Kalsada", icon: BarrierIcon },
  OTHER:            { label: "Iba pang Reklamo", icon: ClipboardCheckIcon },
};

const STATUS_TABS_CONFIG: { value: ReportStatus | "ALL"; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: "ALL",         label: "Lahat",        icon: FileTextIcon },
  { value: "NEW",         label: "Bago",         icon: PlusIcon },
  { value: "IN_PROGRESS", label: "Inaaksyunan",  icon: HourglassIcon },
  { value: "RESOLVED",    label: "Nalutas",      icon: CheckCircle2Icon },
  { value: "DISMISSED",   label: "Ibinasura",    icon: BanIcon },
];

const STATUS_OPTIONS: { value: ReportStatus; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { value: "NEW",         label: "Bago",        icon: PlusIcon },
  { value: "IN_PROGRESS", label: "Inaaksyunan", icon: HourglassIcon },
  { value: "RESOLVED",    label: "Nalutas",     icon: CheckCircle2Icon },
  { value: "DISMISSED",   label: "Ibinasura",   icon: BanIcon },
];

interface Props {
  initialReports: Report[];
}

export function BarangayReportsManager({ initialReports }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "ALL">("ALL");
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (reportId: string, newStatus: string) => {
    startTransition(async () => {
      const result = await updateBarangayReportStatus(reportId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        setReports((prev) =>
          prev.map((r) => r.id === reportId ? { ...r, status: newStatus as ReportStatus } : r)
        );
        toast.success("Status ng ulat ay na-update.");
      }
    });
  };

  const filtered = reports.filter((r) =>
    statusFilter === "ALL" || r.status === statusFilter
  );

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div role="tablist" aria-label="I-filter ang mga ulat ayon sa status" className="flex flex-wrap gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--border-hairline)] w-fit">
        {STATUS_TABS_CONFIG.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={statusFilter === tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`flex items-center gap-1.5 min-h-[36px] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${
                statusFilter === tab.value
                  ? "bg-[var(--bg-card)] text-[var(--text-ink)] shadow-sm"
                  : "text-[var(--text-mute)] hover:text-[var(--text-ink)]"
              }`}
            >
              <Icon size={14} className="shrink-0" />
              <span>{tab.label}</span>
              <span className="rounded-full bg-[var(--border-hairline)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-mute)]">
                {tab.value === "ALL" ? reports.length : reports.filter((r) => r.status === tab.value).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-white/5 dark:text-neutral-500">
              <InboxEmptyIcon size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-ink)]">Walang nahanap na ulat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Mga ulat ng komunidad ng barangay">
              <caption className="sr-only">Listahan ng mga ulat ng komunidad mula sa inyong barangay</caption>
              <thead>
                <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
                  {["Uri", "Paglalarawan", "Nagsampa", "Status", "Petsa", "I-update"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-mute)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filtered.map((report) => (
                  <tr key={report.id} className="hover:bg-[var(--bg-canvas)] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-[var(--text-ink)]">
                      {(() => {
                        const cfg = TYPE_CONFIG[report.type];
                        const Icon = cfg?.icon ?? ClipboardCheckIcon;
                        return (
                          <div className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5">
                            <Icon size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{cfg?.label ?? report.type}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-[var(--text-body)] line-clamp-2">{report.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-mute)]">
                      {report.isAnonymous
                        ? <span className="italic">Anonymous</span>
                        : <div><p>{report.contactName ?? "—"}</p>{report.contactPhone && <p className="text-[10px]">{report.contactPhone}</p>}</div>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="report" status={report.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-mute)] whitespace-nowrap">{formatDate(report.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <label htmlFor={`brgy-status-${report.id}`} className="sr-only">
                        Baguhin ang status ng ulat
                      </label>
                      <select
                        id={`brgy-status-${report.id}`}
                        value={report.status}
                        disabled={isPending}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className="min-h-[36px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2 py-1 text-xs text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
