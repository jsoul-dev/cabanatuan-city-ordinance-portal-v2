"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PdfViewerModal } from "@/components/ui/pdf-viewer-modal";
import { formatResolutionDisplay } from "@/lib/ordinance-utils";

interface OrdinancePdfButtonProps {
  pdfUrl?: string | null;
  title: string;
  resolutionNumber?: string;
  slug?: string;
  dateEnacted?: string | null;
  category?: string | null;
  coverage?: string | null;
  description?: string | null;
  articles?: string | null;
  penalties?: string | null;
  signatories?: string | null;
  variant?: "default" | "compact";
}

export function OrdinancePdfButton({
  pdfUrl,
  title,
  resolutionNumber,
  slug,
  dateEnacted,
  category,
  coverage,
  description,
  articles,
  penalties,
  signatories,
  variant = "default",
}: OrdinancePdfButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!pdfUrl) return null;

  const downloadFilename = `${slug || formatResolutionDisplay(resolutionNumber) || "ordinance"}.pdf`;

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    try {
      const downloadUrl = pdfUrl.includes("?")
        ? `${pdfUrl}&download=1`
        : `${pdfUrl}?download=1`;
      // Blob-fetch to bypass cross-origin filename restrictions
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab if blob fetch fails
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
          className={
            variant === "default"
              ? "inline-flex items-center gap-2.5 rounded-xl bg-emerald-600 text-white font-bold px-6 py-3 text-sm hover:bg-emerald-500 transition-colors shadow-md"
              : "h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-md dark:border-white/15 dark:bg-neutral-800/90 dark:text-white dark:hover:bg-neutral-700 transition-colors shadow-sm"
          }
        >
          <svg width={variant === "default" ? "16" : "14"} height={variant === "default" ? "16" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          {variant === "default" ? "Tingnan ang Opisyal na PDF" : "Tingnan ang PDF"}
        </Button>
        {variant === "default" && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 bg-neutral-800/90 text-white font-bold px-6 py-3 text-sm hover:bg-neutral-700 transition-colors shadow-md border-0 disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {isDownloading ? "Dina-download..." : "I-download ang PDF"}
          </Button>
        )}
      </div>

      <PdfViewerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        pdfUrl={pdfUrl}
        title={title}
        resolutionNumber={resolutionNumber}
        slug={slug}
        dateEnacted={dateEnacted}
        category={category}
        coverage={coverage}
        description={description}
        articles={articles}
        penalties={penalties}
        signatories={signatories}
      />
    </>
  );
}
