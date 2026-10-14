"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FileTextIcon,
  CheckCircle2Icon,
  AiBotSparkleIcon,
  XIcon,
  OrdinancesScrollIcon,
} from "./icons";

interface ExtractedData {
  title: string;
  ordinanceNumber: string;
  ordinanceLabel?: string;
  series: string;
  year: number;
  dateEnacted: string;
  category: string;
  summary: string;
  coverage: string;
  tags: string[];
  penalties: string;
  enforcement: string;
  content: string;
  pdfUrl?: string;
}

interface SelectedFileItem {
  name: string;
  data: string;
  mimeType: string;
  size: number;
}

interface AiOrdinanceExtractorModalProps {
  open: boolean;
  onClose: () => void;
  onExtract: (data: ExtractedData) => void;
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

export function AiOrdinanceExtractorModal({
  open,
  onClose,
  onExtract,
}: AiOrdinanceExtractorModalProps) {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, loading]);

  // Cycle through extraction steps while loading
  useEffect(() => {
    if (!loading) {
      setExtractionStep(0);
      return;
    }
    const interval = setInterval(() => {
      setExtractionStep((prev) => (prev + 1) % EXTRACTION_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const newFiles: SelectedFileItem[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
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

        newFiles.push({
          name: file.name,
          data,
          mimeType: mime,
          size: file.size,
        });
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!text.trim() && selectedFiles.length === 0) {
      toast.error("Mangyaring maglagay ng teksto o mag-upload ng larawan/PDF ng ordinansa.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ordinances/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim() || undefined,
          files:
            selectedFiles.length > 0
              ? selectedFiles.map((f) => ({
                  name: f.name,
                  data: f.data,
                  mimeType: f.mimeType,
                }))
              : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Hindi nabasa ang ordinansa.");
      }

      const attachedUrl =
        selectedFiles.length > 0
          ? `data:${selectedFiles[0].mimeType};base64,${selectedFiles[0].data}`
          : undefined;

      const warnings: string[] = json._debug?.validationWarnings || [];
      if (warnings.length > 0) {
        toast.warning(`⚡ Na-extract ang mga detalye ngunit may ilang natukoy na kulang: ${warnings.join("; ")}`);
      } else {
        toast.success("⚡ Matagumpay na na-extract ng AI ang mga detalye!");
      }

      onExtract({
        ...json.data,
        pdfUrl: attachedUrl,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Aberya sa AI extraction. Subukan muli.");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-extractor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-card)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] w-full max-w-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-[var(--radius-lg)] bg-[var(--bg-card)]/95 backdrop-blur-sm">
            {/* Animated scanner */}
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute h-20 w-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
              <div className="absolute h-14 w-14 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
              <div className="absolute flex items-center justify-center text-emerald-500">
                <FileTextIcon size={24} />
              </div>
            </div>

            {/* Step text */}
            <div className="text-center space-y-2 max-w-xs">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                Ine-extract ng AI…
              </p>
              <p
                key={extractionStep}
                className="text-xs text-[var(--text-mute)] animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {EXTRACTION_STEPS[extractionStep]}
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {EXTRACTION_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i <= extractionStep
                      ? "w-4 bg-emerald-500"
                      : "w-1.5 bg-[var(--border-hairline)]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <AiBotSparkleIcon size={20} />
            </span>
            <div>
              <h2
                id="ai-extractor-title"
                className="text-base font-bold text-[var(--text-ink)]"
              >
                AI Auto-Extraction
              </h2>
              <p className="text-xs text-[var(--text-mute)]">
                Awtomatikong kukunin ang pamagat, buod, parusa, petsa, at nilalaman mula sa multi-page document o teksto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Isara"
            className="text-[var(--text-mute)] hover:text-[var(--text-ink)] p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg-canvas)] transition-colors disabled:opacity-50"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
              1. Mag-upload ng Scanned Ordinance (Multi-Page Images o PDF OCR)
            </label>
            <div className="border-2 border-dashed border-[var(--border-hairline)] rounded-[var(--radius-md)] p-4 text-center hover:bg-[var(--bg-canvas)] transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="block w-full text-xs text-[var(--text-mute)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--accent-primary)]/10 file:text-[var(--accent-primary)] hover:file:bg-[var(--accent-primary)]/20 cursor-pointer"
              />
              <p className="mt-2 text-[11px] text-[var(--text-mute)]">
                Suportado: Maraming larawan (PNG, JPG, JPEG, WEBP) o Scanned PDF na may mga larawan.
              </p>

              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-1.5 text-left border-t border-[var(--border-hairline)] pt-3">
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2Icon size={14} className="text-emerald-500 shrink-0" />
                      <span>{selectedFiles.length} {selectedFiles.length === 1 ? "pahina/file" : "na pahina/file"} ang napili (Handa na para sa AI OCR Scan)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFiles([])}
                      className="text-[11px] text-red-500 hover:underline font-normal"
                    >
                      Alisin lahat
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-[var(--bg-card)] border border-[var(--border-hairline)] px-2.5 py-1 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {file.mimeType.includes("pdf") ? (
                            <OrdinancesScrollIcon size={16} className="text-emerald-500 shrink-0" />
                          ) : (
                            <FileTextIcon size={16} className="text-[var(--text-mute)] shrink-0" />
                          )}
                          <span className="truncate font-medium text-[var(--text-ink)]">
                            {file.name}
                          </span>
                          <span className="text-[var(--text-mute)] text-[10px]">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-red-500 hover:text-red-700 font-bold ml-2 p-1 rounded hover:bg-red-500/10 transition-colors"
                          title="Alisin ang pahina"
                          aria-label={`Alisin ang file na ${file.name}`}
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Textarea Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-mute)]">
              2. O kaya ay i-paste ang Teksto ng Ordinansa
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I-paste dito ang buong teksto ng ordinansa kung mayroon ka nito sa Word o PDF text..."
              className="w-full rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2.5 text-xs font-mono text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-hairline)]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[40px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-2 text-sm font-semibold text-[var(--text-ink)] hover:bg-[var(--border-hairline)] transition-colors disabled:opacity-50"
          >
            Kanselahin
          </button>
          <button
            type="button"
            autoFocus
            onClick={handleAnalyze}
            disabled={loading}
            className="min-h-[40px] inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-sm ring-2 ring-emerald-500 ring-offset-2 ring-offset-[var(--bg-card)] focus:outline-none focus:ring-4 focus:ring-emerald-500 hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <AiBotSparkleIcon size={16} />
            <span>Suriin at I-extract (AI)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
