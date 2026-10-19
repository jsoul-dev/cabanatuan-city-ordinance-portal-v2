"use client";

import React, { useEffect, useRef, useState } from "react";

interface PdfCanvasViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
  onDownload?: () => void;
  onOpenNewTab?: () => void;
}

interface PdfPageProps {
  pdfDoc: any;
  pageNumber: number;
  scale: number;
}

function PdfPage({ pdfDoc, pageNumber, scale }: PdfPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      if (!canvasRef.current || !pdfDoc) return;

      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // ignore
          }
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;

        setPageSize({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        });

        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const renderContext: any = {
          canvasContext: ctx,
          viewport,
        };

        if (pixelRatio !== 1) {
          renderContext.transform = [pixelRatio, 0, 0, pixelRatio, 0, 0];
        }

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div
      className="relative mx-auto my-3 bg-white shadow-2xl rounded-sm transition-all duration-200"
      style={{
        width: pageSize ? `${pageSize.width}px` : "auto",
        minHeight: pageSize ? `${pageSize.height}px` : "500px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: pageSize ? `${pageSize.width}px` : "100%",
          height: pageSize ? `${pageSize.height}px` : "auto",
        }}
        className="block"
      />
      <div className="absolute bottom-2 right-3 pointer-events-none rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono font-medium text-white/80">
        Pahina {pageNumber}
      </div>
    </div>
  );
}

export function PdfCanvasViewer({
  pdfUrl,
  title,
  className = "",
  onDownload,
  onOpenNewTab,
}: PdfCanvasViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.15);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadPdf() {
      setIsLoading(true);
      setErrorMessage(null);
      setPdfDoc(null);

      try {
        const pdfjs = await import("pdfjs-dist");
        if (typeof window !== "undefined") {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        let pdfData: Uint8Array;

        if (pdfUrl.startsWith("data:application/pdf;base64,")) {
          const base64 = pdfUrl.replace("data:application/pdf;base64,", "");
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfData = bytes;
        } else if (/^[A-Za-z0-9+/=]+$/.test(pdfUrl.slice(0, 100)) && pdfUrl.length > 500) {
          const binaryString = atob(pdfUrl);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          pdfData = bytes;
        } else {
          // Fetch the PDF using fetch API
          const response = await fetch(pdfUrl);
          if (!response.ok) {
            throw new Error(`Failed to load PDF (${response.status})`);
          }
          const arrayBuffer = await response.arrayBuffer();
          pdfData = new Uint8Array(arrayBuffer);
        }

        if (isCancelled) return;

        const loadingTask = pdfjs.getDocument({
          data: pdfData,
          cMapUrl: "https://unpkg.com/pdfjs-dist@5.4.296/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setIsLoading(false);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF loading error:", err);
          setErrorMessage(err.message || "Hindi ma-load ang dokumento.");
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  return (
    <div className={`relative flex flex-col h-full w-full bg-neutral-900 select-none ${className}`}>
      {/* Floating Toolbar */}
      <div className="z-10 flex items-center justify-between border-b border-white/10 bg-neutral-950/80 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
            {title || "PDF Document"}
          </span>
          {numPages > 0 && (
            <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] text-neutral-300">
              {numPages} {numPages === 1 ? "pahina" : "mga pahina"}
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(0.6, Math.round((prev - 0.15) * 100) / 100))}
            className="rounded p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Mag-zoom Out"
            aria-label="Mag-zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <span className="w-12 text-center font-mono text-xs text-neutral-200">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(2.5, Math.round((prev + 0.15) * 100) / 100))}
            className="rounded p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
            title="Mag-zoom In"
            aria-label="Mag-zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </button>
          <button
            type="button"
            onClick={() => setScale(1.15)}
            className="rounded px-2 py-1 text-[11px] font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors ml-1"
            title="I-reset ang Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Document Pages Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full overflow-y-auto overflow-x-auto p-4 sm:p-6"
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-neutral-400">
            <svg className="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium text-neutral-300">Ikinakarga ang opisyal na dokumento...</p>
          </div>
        )}

        {errorMessage && (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4 text-center p-8">
            <div className="rounded-full bg-red-500/10 p-3 text-red-400 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="text-sm text-neutral-300 max-w-md">{errorMessage}</p>
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                I-download ang File
              </button>
            )}
          </div>
        )}

        {!isLoading && !errorMessage && pdfDoc && (
          <div className="flex flex-col items-center">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <PdfPage
                key={`page-${pageNum}`}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                scale={scale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
