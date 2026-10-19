"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { toast } from "sonner";
import { submitOrdinance, resubmitBarangayOrdinance, deleteBarangayOrdinance } from "../actions";
import {
  FileTextIcon,
  HourglassIcon,
  CheckCircle2Icon,
  FileEditIcon,
  XCircleIcon,
  AiBotSparkleIcon,
  OrdinancesScrollIcon,
  InboxEmptyIcon,
  EyeIcon,
  Trash2Icon,
  AlertTriangleIcon,
} from "@/components/dashboard/icons";

interface Ordinance {
  id: string;
  slug: string;
  title: string;
  resolutionNumber: string;
  ordinanceLabel?: string | null;
  series: string | null;
  year?: number | null;
  dateEnacted?: Date | string | null;
  category: string | null;
  description?: string | null;
  content?: string | null;
  penalties?: string | null;
  coverage?: string | null;
  enforcement?: string | null;
  signatories?: string | null;
  tags?: any;
  pdfUrl?: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  rejectedReason: string | null;
  submittedBy: { name: string; role: string };
  reviewedBy: { name: string } | null;
}

interface Props {
  initialOrdinances: Ordinance[];
  canSubmit: boolean;
}

type OrdinanceStatus = "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS = [
  { value: "ALL" as OrdinanceStatus,      label: "Lahat",    icon: FileTextIcon },
  { value: "PENDING" as OrdinanceStatus,  label: "Pending",  icon: HourglassIcon },
  { value: "APPROVED" as OrdinanceStatus, label: "Approved", icon: CheckCircle2Icon },
  { value: "DRAFT" as OrdinanceStatus,    label: "Draft",    icon: FileEditIcon },
  { value: "REJECTED" as OrdinanceStatus, label: "Rejected", icon: XCircleIcon },
];

const ORDINANCE_CATEGORIES = [
  "General", "Environment", "Public Safety", "Health", "Infrastructure",
  "Education", "Livelihood", "Youth", "Senior Citizens", "Women & Children",
];

interface SelectedFileItem {
  name: string;
  data: string;
  mimeType: string;
  size: number;
}

const EXTRACTION_STEPS = [
  "Binabasa ang dokumento…",
  "Ginagawan ng OCR ang mga pahina…",
  "Kinukuha ang pamagat at numero…",
  "Sinusuri ang mga seksyon…",
  "Kinukuha ang mga parusa at multa…",
  "Kinukuha ang mga lumagda…",
  "Binabalangkas ang buong nilalaman…",
];

export function BarangayOrdinanceManager({ initialOrdinances, canSubmit }: Props) {
  const [ordinances, setOrdinances] = useState(initialOrdinances);
  const [statusFilter, setStatusFilter] = useState<OrdinanceStatus>("ALL");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrdinance, setEditingOrdinance] = useState<Ordinance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ordinance | null>(null);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // AI extraction state
  const [extractText, setExtractText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const extractionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formState, setFormState] = useState({
    title: "",
    resolutionNumber: "",
    ordinanceLabel: "",
    series: new Date().getFullYear().toString(),
    year: new Date().getFullYear().toString(),
    dateEnacted: "",
    category: "General",
    description: "",
    content: "",
    penalties: "",
    coverage: "",
    enforcement: "",
    signatories: "",
    tags: "",
    pdfUrl: "",
  });

  const resetForm = () => {
    setFormState({
      title: "", resolutionNumber: "", ordinanceLabel: "",
      series: new Date().getFullYear().toString(),
      year: new Date().getFullYear().toString(),
      dateEnacted: "", category: "General", description: "", content: "",
      penalties: "", coverage: "", enforcement: "", signatories: "", tags: "", pdfUrl: "",
    });
    setExtractText("");
    setSelectedFiles([]);
    setFormError("");
  };

  const handleOpenCreateModal = () => {
    setEditingOrdinance(null);
    resetForm();
    setShowModal(true);
  };

  const handleOpenEditModal = (ord: Ordinance) => {
    setEditingOrdinance(ord);
    setFormState({
      title: ord.title || "",
      resolutionNumber: ord.resolutionNumber || "",
      ordinanceLabel: ord.ordinanceLabel || "",
      series: ord.series || new Date().getFullYear().toString(),
      year: ord.year?.toString() || new Date().getFullYear().toString(),
      dateEnacted: ord.dateEnacted ? new Date(ord.dateEnacted).toISOString().split("T")[0] : "",
      category: ord.category && ORDINANCE_CATEGORIES.includes(ord.category) ? ord.category : "General",
      description: ord.description || "",
      content: ord.content || "",
      penalties: ord.penalties || "",
      coverage: ord.coverage || "",
      enforcement: ord.enforcement || "",
      signatories: ord.signatories || "",
      tags: Array.isArray(ord.tags) ? ord.tags.join(", ") : (typeof ord.tags === "string" ? ord.tags : ""),
      pdfUrl: ord.pdfUrl || "",
    });
    setExtractText("");
    setSelectedFiles([]);
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (extracting) return;
    setShowModal(false);
    setEditingOrdinance(null);
    addBtnRef.current?.focus();
  };

  // File handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles: SelectedFileItem[] = [];
    for (const file of Array.from(files)) {
      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const [header, data] = base64String.split(",");
        const match = header.match(/:(.*?);/);
        const mime = match ? match[1] : file.type;
        newFiles.push({ name: file.name, data, mimeType: mime, size: file.size });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // AI extraction
  const handleExtract = async () => {
    if (!extractText.trim() && selectedFiles.length === 0) {
      toast.error("Mag-upload ng dokumento o mag-paste ng teksto para ma-extract.");
      return;
    }
    setExtracting(true);
    setExtractionStep(0);
    extractionIntervalRef.current = setInterval(() => {
      setExtractionStep((prev) => (prev + 1) % EXTRACTION_STEPS.length);
    }, 2200);

    try {
      const res = await fetch("/api/ordinances/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractText.trim() || undefined,
          files: selectedFiles.length > 0
            ? selectedFiles.map((f) => ({ name: f.name, data: f.data, mimeType: f.mimeType }))
            : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Hindi nabasa ang ordinansa.");

      const data = json.data;
      const attachedUrl = selectedFiles.length > 0
        ? `data:${selectedFiles[0].mimeType};base64,${selectedFiles[0].data}`
        : undefined;

      setFormState({
        title: data.title || "",
        resolutionNumber: data.ordinanceNumber || "",
        ordinanceLabel: data.ordinanceLabel || "",
        series: data.series || new Date().getFullYear().toString(),
        year: data.year?.toString() || new Date().getFullYear().toString(),
        dateEnacted: data.dateEnacted ? data.dateEnacted.split("T")[0] : "",
        category: ORDINANCE_CATEGORIES.includes(data.category) ? data.category : "General",
        description: data.summary || "",
        content: data.content || "",
        penalties: data.penalties || "",
        coverage: data.coverage || "",
        enforcement: data.enforcement || "",
        signatories: data.signatories || "",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        pdfUrl: attachedUrl || "",
      });

      const warnings: string[] = json._debug?.validationWarnings || [];
      if (warnings.length > 0) {
        toast.warning(`Na-extract ngunit may kulang: ${warnings.join("; ")}`);
      } else {
        toast.success("⚡ Matagumpay na na-extract ang mga detalye!");
      }
    } catch (err: any) {
      toast.error(err.message || "Aberya sa AI extraction. Subukan muli.");
    } finally {
      if (extractionIntervalRef.current) clearInterval(extractionIntervalRef.current);
      setExtracting(false);
      setExtractionStep(0);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    if (saveAsDraft) {
      fd.set("isDraft", "true");
    }

    startTransition(async () => {
      let result: { error?: string };
      if (editingOrdinance) {
        result = await resubmitBarangayOrdinance(editingOrdinance.id, fd);
      } else {
        result = await submitOrdinance(fd);
      }

      if (result.error) {
        setFormError(result.error);
        toast.error(result.error);
      } else {
        const msg = saveAsDraft
          ? "Ordinansa ay matagumpay na nai-save bilang Draft."
          : (editingOrdinance
              ? "Ordinansa ay matagumpay na naisumite muli para sa pagsusuri ng LGU."
              : "Ordinansa ay matagumpay na naisumite para sa pagsusuri ng LGU.");
        toast.success(msg);
        setShowModal(false);
        setEditingOrdinance(null);
        window.location.reload();
      }
    });
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteBarangayOrdinance(deleteTarget.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        setOrdinances((prev) => prev.filter((o) => o.id !== deleteTarget.id));
        toast.success("Ordinansa ay matagumpay na natanggal.");
      }
      setDeleteTarget(null);
    });
  }, [deleteTarget]);

  const filtered = ordinances.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.resolutionNumber.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  function formatDate(d: Date | string) {
    return new Date(d).toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {canSubmit && (
        <div className="flex items-center justify-end">
          <button ref={addBtnRef} type="button" onClick={handleOpenCreateModal}
            className="min-h-[44px] rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-primary)]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
          >
            + Magsumite ng Ordinansa
          </button>
        </div>
      )}

      {/* ── Combined Submit Modal ── */}
      {showModal && canSubmit && (
        <div
          role="dialog" aria-modal="true" aria-labelledby="submit-ordinance-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div onClick={(e) => e.stopPropagation()}
            className="relative bg-[var(--bg-card)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            {/* ── Extraction overlay ── */}
            {extracting && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 rounded-[var(--radius-lg)] bg-[var(--bg-card)]/95 backdrop-blur-sm">
                <div className="relative flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-4 border-emerald-500/20" />
                  <div className="absolute h-20 w-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                  <div className="absolute h-14 w-14 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                  <FileTextIcon size={24} className="text-emerald-500 animate-pulse" />
                </div>
                <div className="text-center space-y-2 max-w-xs">
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">Ine-extract ng AI…</p>
                  <p key={extractionStep} className="text-xs text-[var(--text-mute)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {EXTRACTION_STEPS[extractionStep]}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {EXTRACTION_STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= extractionStep ? "w-4 bg-emerald-500" : "w-1.5 bg-[var(--border-hairline)]"}`} />
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border-hairline)] p-5 flex items-center justify-between">
                <div>
                  <h2 id="submit-ordinance-title" className="text-base font-bold text-[var(--text-ink)] flex items-center gap-2">
                    <OrdinancesScrollIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span>{editingOrdinance ? "I-edit ang Ordinansa" : "Irehistro ang Bagong Ordinansa"}</span>
                  </h2>
                  <p className="text-xs text-[var(--text-mute)] mt-0.5">
                    {editingOrdinance
                      ? "Baguhin ang mga detalye at i-save bilang draft o muling isumite sa LGU."
                      : "Awtomatikong kukunin ang mga detalye gamit ang AI o i-type nang manu-mano."}
                  </p>
                </div>
                <button type="button" onClick={handleCloseModal} aria-label="Isara" className="text-[var(--text-mute)] hover:text-[var(--text-ink)] p-1 rounded-md text-lg">✕</button>
              </div>

              <div className="p-5 space-y-5">
                {/* ── Revision Notice if returned to draft / rejected ── */}
                {editingOrdinance?.rejectedReason && (
                  <div className="rounded-[var(--radius-sm)] border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangleIcon size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>Paalala / Hinihiling na Rebisyon mula sa LGU Admin:</span>
                    </div>
                    <p className="whitespace-pre-wrap pl-6 leading-relaxed font-medium">{editingOrdinance.rejectedReason}</p>
                  </div>
                )}
                {/* ── AI Auto-Extract Section ── */}
                <div className="rounded-[var(--radius-md)] border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <AiBotSparkleIcon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Auto-extract gamit ang AI</p>
                      <p className="text-[11px] text-[var(--text-mute)]">Mag-upload ng dokumento o mag-paste ng teksto.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Upload */}
                    <div className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-card)] p-3 space-y-2">
                      <p className="text-xs font-semibold text-[var(--text-ink)]">Upload PDF / Dokumento</p>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-1.5 text-xs font-medium text-[var(--text-ink)] hover:bg-[var(--border-hairline)] transition-colors">
                        <FileTextIcon size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Browse Files</span>
                        <input type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="sr-only" />
                      </label>
                      {selectedFiles.length > 0 && (
                        <div className="space-y-1 mt-1">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded bg-[var(--bg-canvas)] px-2 py-1 text-[11px]">
                              <span className="truncate text-[var(--text-ink)] flex items-center gap-1">
                                <FileTextIcon size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{file.name}</span>
                                <span className="text-[var(--text-mute)]">({formatFileSize(file.size)})</span>
                              </span>
                              <button type="button" onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 font-bold ml-1 p-0.5 text-xs">✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-[var(--text-mute)]">I-upload ang dokumento para awtomatikong mabasa ng AI at ma-save ang opisyal na PDF.</p>
                    </div>

                    {/* Paste Text */}
                    <div className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-card)] p-3 space-y-2">
                      <p className="text-xs font-semibold text-[var(--text-ink)]">O i-Paste ang Raw na Teksto</p>
                      <textarea rows={3} value={extractText} onChange={(e) => setExtractText(e.target.value)}
                        placeholder="I-paste dito ang teksto ng ordinansa…"
                        className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-2.5 py-2 text-xs font-mono text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  <button type="button" onClick={handleExtract} disabled={extracting || (!extractText.trim() && selectedFiles.length === 0)}
                    className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <AiBotSparkleIcon size={16} />
                    <span>I-Extract gamit ang AI</span>
                  </button>
                </div>

                {/* ── Official File Status ── */}
                <div className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileTextIcon size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-ink)]">Opisyal na Dokumento</p>
                      <p className="text-[11px] text-[var(--text-mute)] flex items-center gap-1">
                        {formState.pdfUrl ? (
                          <>
                            <CheckCircle2Icon size={13} className="text-emerald-600 dark:text-emerald-400 inline" />
                            <span>Naka-attach na ang opisyal na dokumento.</span>
                          </>
                        ) : (
                          "Walang naka-attach na opisyal na dokumento."
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/40 p-2.5 rounded border border-red-200 dark:border-red-800" role="alert">{formError}</p>
                )}

                <input type="hidden" name="pdfUrl" value={formState.pdfUrl} />
                <input type="hidden" name="ordinanceLabel" value={formState.ordinanceLabel} />

                {/* ── Form Fields ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label htmlFor="ord-title" className="text-sm font-medium text-[var(--text-ink)]">Pamagat ng Ordinansa <span className="text-red-500">*</span></label>
                    <input id="ord-title" name="title" type="text" required value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      placeholder="Hal. Isang Ordinansa na Nagtatakda ng…" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ord-res-no" className="text-sm font-medium text-[var(--text-ink)]">Resolution Number <span className="text-red-500">*</span></label>
                    <input id="ord-res-no" name="resolutionNumber" type="text" required value={formState.resolutionNumber} onChange={(e) => setFormState({ ...formState, resolutionNumber: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      placeholder="Hal. RES-2025-001" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ord-series" className="text-sm font-medium text-[var(--text-ink)]">Series</label>
                    <input id="ord-series" name="series" type="text" value={formState.series} onChange={(e) => setFormState({ ...formState, series: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ord-year" className="text-sm font-medium text-[var(--text-ink)]">Taon</label>
                    <input id="ord-year" name="year" type="number" value={formState.year} onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ord-category" className="text-sm font-medium text-[var(--text-ink)]">Kategorya</label>
                    <select id="ord-category" name="category" value={formState.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]">
                      {ORDINANCE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ord-date" className="text-sm font-medium text-[var(--text-ink)]">Petsa ng Pagpapatibay</label>
                    <input id="ord-date" name="dateEnacted" type="date" value={formState.dateEnacted} onChange={(e) => setFormState({ ...formState, dateEnacted: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ord-tags" className="text-sm font-medium text-[var(--text-ink)]">Search Tags</label>
                    <input id="ord-tags" name="tags" type="text" value={formState.tags} onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      placeholder="Hal. curfew, kabataan" />
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label htmlFor="ord-description" className="text-sm font-medium text-[var(--text-ink)]">Maikling Paglalarawan</label>
                    <textarea id="ord-description" name="description" rows={2} value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                      className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label htmlFor="ord-coverage" className="text-sm font-medium text-[var(--text-ink)]">Saklaw / Coverage</label>
                    <input id="ord-coverage" name="coverage" type="text" value={formState.coverage} onChange={(e) => setFormState({ ...formState, coverage: e.target.value })}
                      className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                  </div>
                  <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ord-penalties" className="text-sm font-medium text-[var(--text-ink)]">Parusa at Multa</label>
                      <textarea id="ord-penalties" name="penalties" rows={3} value={formState.penalties} onChange={(e) => setFormState({ ...formState, penalties: e.target.value })}
                        className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="ord-enforcement" className="text-sm font-medium text-[var(--text-ink)]">Ahensyang Magpapatupad</label>
                      <textarea id="ord-enforcement" name="enforcement" rows={3} value={formState.enforcement} onChange={(e) => setFormState({ ...formState, enforcement: e.target.value })}
                        className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                    </div>
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label htmlFor="ord-signatories" className="text-sm font-medium text-[var(--text-ink)]">Mga Lumagda / Signatories</label>
                    <textarea id="ord-signatories" name="signatories" rows={2} value={formState.signatories} onChange={(e) => setFormState({ ...formState, signatories: e.target.value })}
                      className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                      placeholder="Hal. Punong Barangay, Mga Kagawad, Kalihim" />
                  </div>
                  <div className="sm:col-span-3 flex flex-col gap-1.5">
                    <label htmlFor="ord-content" className="text-sm font-medium text-[var(--text-ink)]">Buong Nilalaman</label>
                    <textarea id="ord-content" name="content" rows={8} value={formState.content} onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                      className="rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm font-mono text-[var(--text-ink)] resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 z-10 bg-[var(--bg-card)] border-t border-[var(--border-hairline)] p-5 flex flex-wrap gap-3 justify-end items-center">
                <button type="button" onClick={handleCloseModal}
                  className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-2 text-sm font-semibold text-[var(--text-ink)] hover:bg-[var(--border-hairline)] transition-colors">
                  Kanselahin
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  onClick={() => setSaveAsDraft(true)}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-ink)] hover:bg-[var(--bg-canvas)] transition-colors disabled:opacity-50"
                >
                  <FileEditIcon size={16} className="text-[var(--text-mute)]" />
                  <span>{isPending && saveAsDraft ? "Inililigtas…" : "I-save bilang Draft"}</span>
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  onClick={() => setSaveAsDraft(false)}
                  className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-primary)]/90 transition-colors disabled:opacity-50"
                >
                  <OrdinancesScrollIcon size={16} />
                  <span>
                    {isPending && !saveAsDraft
                      ? "Isinusumite…"
                      : editingOrdinance
                      ? "Isumite Muli para sa Pagsusuri"
                      : "Isumite para sa Pagsusuri"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div role="tablist" aria-label="I-filter ayon sa status" className="flex flex-wrap gap-1 p-1 rounded-[var(--radius-sm)] bg-[var(--bg-canvas)] border border-[var(--border-hairline)]">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "ALL" ? ordinances.length : ordinances.filter((o) => o.status === tab.value).length;
            const Icon = tab.icon;
            return (
              <button key={tab.value} role="tab" aria-selected={statusFilter === tab.value} onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-1.5 min-h-[36px] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] ${statusFilter === tab.value ? "bg-[var(--bg-card)] text-[var(--text-ink)] shadow-sm" : "text-[var(--text-mute)] hover:text-[var(--text-ink)]"}`}>
                <Icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
                <span className="ml-0.5 rounded-full bg-[var(--border-hairline)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-mute)]">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1">
          <label htmlFor="search-brgy-ordinances" className="sr-only">Maghanap ng ordinansa</label>
          <input id="search-brgy-ordinances" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Maghanap ng pamagat o res. no…"
            className="w-full min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-white/5 dark:text-neutral-500">
              <InboxEmptyIcon size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-ink)]">{ordinances.length === 0 ? "Wala pang ordinansa ang inyong barangay." : "Walang nahanap na ordinansa."}</p>
            {ordinances.length === 0 && canSubmit && (
              <button type="button" onClick={handleOpenCreateModal} className="mt-4 min-h-[44px] rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-primary)]/90 transition-colors">Magsumite ng Unang Ordinansa</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Mga ordinansa ng barangay">
              <caption className="sr-only">Listahan ng lahat ng ordinansa ng inyong barangay</caption>
              <thead>
                <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
                  {["Res. No.", "Pamagat", "Status", "Isinumite ni", "Petsa", "Aksyon"].map((h) => (
                    <th key={h} scope="col" className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-mute)] ${h === "Aksyon" ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-hairline)]">
                {filtered.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[var(--bg-canvas)] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-mute)]">
                      {ord.resolutionNumber.includes("-") || !ord.series ? ord.resolutionNumber : `${ord.series.replace(/\D/g, "")}-${ord.resolutionNumber}`}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-[var(--text-ink)] line-clamp-2">{ord.title}</p>
                      {ord.rejectedReason && <p className="text-[10px] text-red-500 mt-0.5 italic">Dahilan: {ord.rejectedReason}</p>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge type="ordinance" status={ord.status} /></td>
                    <td className="px-4 py-3 text-sm text-[var(--text-body)]">{ord.submittedBy.name}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-mute)] whitespace-nowrap">{formatDate(ord.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {ord.status === "APPROVED" && (
                          <Link
                            href={`/ordinances/${ord.slug}`}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-hairline)] text-xs text-[var(--text-body)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors px-2"
                            aria-label={`Tingnan ang ordinansa: ${ord.title}`}
                          >
                            <EyeIcon size={15} />
                          </Link>
                        )}
                        {canSubmit && (ord.status === "DRAFT" || ord.status === "REJECTED") && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(ord)}
                            className="min-h-[36px] inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)]/10 px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                            aria-label={`I-edit ang ordinansa: ${ord.title}`}
                          >
                            <FileEditIcon size={13} />
                            <span>{ord.status === "DRAFT" ? "I-edit / Isumite" : "Muling Isumite"}</span>
                          </button>
                        )}
                        {canSubmit && (ord.status === "DRAFT" || ord.status === "REJECTED") && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setDeleteTarget(ord)}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-mute)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                            aria-label={`Tanggalin ang ordinansa: ${ord.title}`}
                          >
                            <Trash2Icon size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Tanggalin ang Ordinansa?"
        description={`Permanenteng matatanggal ang ordinansang ito:\n"${deleteTarget?.title}"`}
        confirmLabel="Tanggalin"
        cancelLabel="Huwag"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
