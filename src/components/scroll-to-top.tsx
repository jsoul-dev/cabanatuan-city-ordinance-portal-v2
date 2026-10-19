"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowUpIcon } from "@/components/dashboard/icons";
import { clsx } from "clsx";

interface ScrollToTopProps {
  /**
   * Scroll threshold in pixels before showing the button.
   * Default: 300px
   */
  threshold?: number;
  /**
   * Custom duration in ms for the scroll animation.
   * If omitted, dynamically calculated between 240ms and 360ms for a swift, natural feel.
   */
  duration?: number;
  /**
   * Additional custom classes for positioning or styling overrides.
   */
  className?: string;
}

export function ScrollToTopButton({
  threshold = 300,
  duration,
  className,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY =
        window.scrollY || document.documentElement.scrollTop;
      const shouldShow = currentScrollY > threshold;
      setIsVisible((prev) => (prev !== shouldShow ? shouldShow : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial position on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;

    // Respect user's motion preferences
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    const startY = window.scrollY || document.documentElement.scrollTop;
    if (startY <= 0) return;

    // Fast scroll animation: snappy 240ms - 360ms based on distance
    const animDuration =
      duration ?? Math.min(360, Math.max(240, startY * 0.07));
    const startTime = performance.now();

    // Ease-out cubic formula: rapid initial movement, smooth settle at top
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const cancelScroll = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      window.removeEventListener("wheel", cancelScroll);
      window.removeEventListener("touchstart", cancelScroll);
    };

    window.addEventListener("wheel", cancelScroll, { passive: true });
    window.addEventListener("touchstart", cancelScroll, { passive: true });

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDuration, 1);
      const easedProgress = easeOutCubic(progress);

      window.scrollTo(0, Math.round(startY * (1 - easedProgress)));

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        cancelScroll();
      }
    };

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(step);
  }, [duration]);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Bumalik sa itaas"
      title="Bumalik sa itaas (Scroll to top)"
      className={clsx(
        "group fixed bottom-6 right-6 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full",
        "bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-lg shadow-emerald-950/25",
        "border border-emerald-500/40 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:border-emerald-400/30 dark:shadow-black/50",
        "transition-all duration-300 ease-out backdrop-blur-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]",
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
        className
      )}
    >
      <ArrowUpIcon
        size={20}
        className="transition-transform duration-200 group-hover:-translate-y-0.5"
      />
    </button>
  );
}

export { ScrollToTopButton as ScrollToTop };
