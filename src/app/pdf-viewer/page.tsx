"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatResolutionDisplay } from "@/lib/ordinance-utils";

const PdfCanvasViewer = dynamic(
  () => import("@/components/ui/pdf-canvas-viewer").then((mod) => mod.PdfCanvasViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full w-full bg-neutral-900 text-neutral-400 gap-3">
        <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm font-medium text-neutral-300">Ikinakarga ang PDF viewer...</p>
      </div>
    ),
  }
);

function PdfViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const url = searchParams.get("url");
  const title = searchParams.get("title") || "Opisyal na Dokumento ng Ordinansa";
  const resolutionNumber = searchParams.get("res") || "";
  const slug = searchParams.get("slug") || "";

  const handleDownload = async () => {
    if (!url) return;
    try {
      const downloadUrl = url.includes("?") ? `${url}&download=1` : `${url}?download=1`;
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
    } catch (err) {
      console.error("Failed to download PDF", err);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else if (slug) {
      router.push(`/ordinances/${slug}`);
    } else {
      router.push("/ordinances");
    }
  };

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6">
        <div className="rounded-xl border border-white/10 bg-neutral-900 p-8 max-w-md text-center">
          <h2 className="text-lg font-bold text-white mb-2">Walang Nakitang Dokumento</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Walang ibinigay na wastong URL para sa PDF dokumento.
          </p>
          <Button onClick={() => router.push("/ordinances")} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            Bumalik sa mga Ordinansa
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-neutral-900 px-4 py-3 sm:px-6 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            title="Bumalik"
            aria-label="Bumalik"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-400">
                OFFICIAL PDF DOCUMENT
              </span>
              {resolutionNumber && (
                <span className="font-mono text-xs text-neutral-400">
                  Res. No. {formatResolutionDisplay(resolutionNumber)}
                </span>
              )}
            </div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span className="hidden sm:inline">I-download ang PDF</span>
            <span className="sm:hidden">Download</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Viewer Area */}
      <main className="flex-1 w-full overflow-hidden">
        <PdfCanvasViewer
          pdfUrl={url}
          title={title}
          onDownload={handleDownload}
        />
      </main>
    </div>
  );
}

export default function PdfViewerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-400 gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-sm font-medium text-neutral-300">Ikinakarga ang pahina...</p>
        </div>
      }
    >
      <PdfViewerContent />
    </Suspense>
  );
}
