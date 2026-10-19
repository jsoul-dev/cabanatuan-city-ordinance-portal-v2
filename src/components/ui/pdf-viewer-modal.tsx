"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { formatResolutionDisplay } from "@/lib/ordinance-utils";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string | null;
  title: string;
  resolutionNumber?: string;
  series?: string | null;
  dateEnacted?: string | null;
  category?: string | null;
  coverage?: string | null;
  description?: string | null;
  articles?: string | null;
  penalties?: string | null;
  signatories?: string | null;
  slug?: string;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  title,
  resolutionNumber,
  series,
  dateEnacted,
  category,
  coverage,
  description,
  articles,
  penalties,
  signatories,
  slug,
}: PdfViewerModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusableElements = modalRef.current?.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    if (!focusableElements || focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  if (!isOpen) return null;
  if (!mounted) return null;

  const handlePrint = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    } else {
      window.print();
    }
  };

  const handleOpenNewTab = () => {
    if (!pdfUrl) return;

    if (pdfUrl.startsWith("data:")) {
      try {
        const parts = pdfUrl.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        return;
      } catch (e) {
        console.error("Failed to parse data URL for new tab:", e);
      }
    }

    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    try {
      const downloadUrl = pdfUrl.includes("?")
        ? `${pdfUrl}&download=1`
        : `${pdfUrl}?download=1`;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const filename = slug 
        ? `${slug}.pdf` 
        : resolutionNumber 
          ? `${formatResolutionDisplay(resolutionNumber)}.pdf` 
          : "document.pdf";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download PDF", error);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in-0"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={handleTabKey}
        className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-[var(--radius-lg)] border border-[var(--border-hairline)] bg-[var(--bg-card)] shadow-[var(--shadow-floating)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-6 py-4">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                OFFICIAL PDF DOCUMENT
              </span>
              {resolutionNumber && (
                <span className="font-mono text-xs text-[var(--text-mute)]">
                  Res. No. {formatResolutionDisplay(resolutionNumber)}
                </span>
              )}
            </div>
            <h3 id="modal-title" className="text-base font-bold text-[var(--text-ink)] truncate">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {pdfUrl ? (
              <>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  I-download ang PDF
                </button>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-xs font-semibold text-[var(--text-ink)] hover:bg-[var(--border-hairline)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Buksan sa Bagong Tab
                </button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                I-print / I-save bilang PDF
              </Button>
            )}
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="ml-2 rounded-[var(--radius-sm)] p-1.5 text-[var(--text-mute)] hover:bg-[var(--border-hairline)] hover:text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] transition-colors"
              aria-label="Isara ang modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Modal Body: Either PDF iframe OR printable document view */}
        <div className="flex-1 w-full bg-neutral-900 overflow-y-auto relative">
          {pdfUrl ? (
            <div className="relative h-full w-full">
              <iframe
                src={`${pdfUrl}#toolbar=1&view=FitH`}
                className="h-full w-full border-0 bg-neutral-900"
                title={`PDF Document - ${title}`}
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full text-xs text-neutral-300 pointer-events-none hidden sm:flex items-center gap-1.5 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                Kung hindi ma-load ang preview, i-click ang "Buksan sa Bagong Tab" sa itaas.
              </div>
            </div>
          ) : (
            <div
              ref={printRef}
              className="min-h-full bg-white text-black p-8 sm:p-12 max-w-4xl mx-auto shadow-xl font-serif"
            >
              {/* Official Document Letterhead */}
              <div className="text-center border-b-2 border-black pb-6 mb-8">
                <p className="text-xs uppercase tracking-wider text-neutral-600 font-sans">
                  Republika ng Pilipinas • Lalawigan ng Nueva Ecija
                </p>
                <h2 className="text-lg font-bold uppercase tracking-wide mt-1">
                  Lungsod ng Cabanatuan
                </h2>
                <h1 className="text-xl sm:text-2xl font-extrabold uppercase mt-2">
                  Tanggapan ng Sangguniang Barangay / Panlungsod
                </h1>
                <div className="mt-4 inline-block bg-neutral-100 border border-neutral-300 px-4 py-1.5 rounded text-xs font-mono font-bold">
                  ORDINANSA BLG. {resolutionNumber ? formatResolutionDisplay(resolutionNumber) : "_______"}
                </div>
              </div>

              {/* Title */}
              <div className="mb-8 text-center">
                <h3 className="text-lg sm:text-xl font-bold uppercase leading-snug">
                  {title}
                </h3>
                <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-neutral-600 font-sans">
                  {dateEnacted && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Enacted: {dateEnacted}
                    </span>
                  )}
                  {coverage && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
                      Coverage: {coverage}
                    </span>
                  )}
                  {category && (
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      Category: {category}
                    </span>
                  )}
                </div>
              </div>

              {/* Executive Summary */}
              {description && (
                <div className="mb-8 bg-neutral-50 border-l-4 border-neutral-800 p-4 rounded-r text-sm italic font-sans">
                  <strong className="block text-xs uppercase not-italic font-bold text-neutral-700 mb-1">
                    Buod / Executive Summary:
                  </strong>
                  {description}
                </div>
              )}

              {/* Articles & Sections */}
              {articles && (
                <div className="mb-8">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-wider text-neutral-700 border-b border-neutral-300 pb-1 mb-4">
                    Mga Artikulo at Seksyon (Articles & Sections)
                  </h4>
                  <div className="text-sm leading-relaxed whitespace-pre-line font-serif space-y-4">
                    {articles}
                  </div>
                </div>
              )}

              {/* Penalties & Fines */}
              {penalties && (
                <div className="mb-8">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-wider text-red-800 border-b border-red-200 pb-1 mb-4">
                    Mga Parusa at Multa (Penalties & Fines)
                  </h4>
                  <div className="text-sm leading-relaxed whitespace-pre-line font-serif space-y-3 bg-red-50/50 p-4 border border-red-100 rounded">
                    {penalties}
                  </div>
                </div>
              )}

              {/* Signatories */}
              {signatories && (
                <div className="mt-12 pt-8 border-t border-neutral-300">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-600 mb-6">
                    Pinagtibay At Nilagdaan (Signatories):
                  </h4>
                  <div className="text-sm font-sans whitespace-pre-line font-medium leading-relaxed">
                    {signatories}
                  </div>
                </div>
              )}

              {/* Footer text */}
              <div className="mt-16 pt-4 border-t border-neutral-200 text-center text-[10px] text-neutral-500 font-sans">
                Opisyal na Kopya ng Ordinansa • Cabanatuan City Ordinance Portal
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
