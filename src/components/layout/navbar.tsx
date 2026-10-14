"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { checkSession, logout } from "@/lib/auth-actions";
import { XIcon } from "@/components/dashboard/icons";
import type { SessionPayload } from "@/lib/auth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/ordinances", label: "Ordinances" },
  { href: "/chatbot", label: "AI Assistant" },
  { href: "/report", label: "Report" },
  { href: "/news", label: "News" },
];

/**
 * Main navigation bar — supports both crisp Light Mode and winauth.net Dark Mode.
 * Displays official Cabanatuan City LGU Seal and "Cabanatuan City / Ordinance Portal" branding.
 * Includes interactive Light / Dark Theme Toggle button and high-contrast Portal Access CTA.
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAtTop, setIsAtTop] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.scrollY <= 20;
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    checkSession().then((s) => {
      setSession(s);
      setIsAuthReady(true);
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Set initial state immediately
    handleScroll();
    
    // Enable transitions after first paint to prevent visible snaps
    let frameId = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {/* Invisible placeholder to prevent layout shift when fixed */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />
      
      <div className={`fixed top-0 left-0 right-0 z-50 w-full pointer-events-none ${isMounted ? "transition-all duration-300" : ""} ${isAtTop ? "pt-0 px-0" : "pt-3 px-3 sm:pt-4 sm:px-4"}`}>
        <header
          className={`mx-auto backdrop-blur-xl pointer-events-auto ${isMounted ? "transition-all duration-300 ease-in-out" : ""} ${
            isAtTop
              ? "w-full border-b border-neutral-200/80 bg-white/80 dark:border-white/10 dark:bg-[#050a08]/90"
              : "w-full max-w-5xl rounded-2xl border border-neutral-200/80 bg-white/95 dark:border-white/20 dark:bg-[#050a08]/95 shadow-lg"
          }`}
        >
        <nav
          aria-label="Main navigation"
          className={`mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 ${isAtTop ? "" : "px-4 sm:px-5 lg:px-6"}`}
        >
          {/* Logo + Brandmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline transition-opacity hover:opacity-80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl">
              <Image
                src="/lgu-logo.png"
                alt="Cabanatuan City LGU Seal"
                width={28}
                height={28}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col font-mono text-[11px] leading-tight tracking-tight">
              <span className="font-bold text-neutral-900 dark:text-white">
                Cabanatuan City
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Ordinance Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Theme Toggle + Portal Access CTA */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            {!isAuthReady ? (
              <div className="w-[114px] h-[30px]" aria-hidden="true" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Link href={session.role === "LGU_ADMIN" ? "/admin/lgu" : "/admin/barangay"}>
                  <button
                    type="button"
                    className="rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-black dark:shadow-lg dark:shadow-white/5 dark:hover:bg-neutral-200 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                    Dashboard
                  </button>
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-xl border border-neutral-200 bg-white p-1.5 text-neutral-600 shadow-sm transition-all hover:bg-neutral-100 hover:text-red-600 active:scale-[0.98] dark:border-white/10 dark:bg-transparent dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-red-400 flex items-center justify-center"
                    title="Sign out"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login">
                <button
                  type="button"
                  className="rounded-xl bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-black dark:shadow-lg dark:shadow-white/5 dark:hover:bg-neutral-200"
                >
                  Portal Access
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <XIcon size={20} />
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className={`border-t border-neutral-200 bg-white px-4 pb-4 pt-2 dark:border-white/10 dark:bg-[#050a08] md:hidden ${
              isAtTop ? "" : "rounded-b-2xl"
            }`}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-neutral-200 dark:border-white/10 pt-3 flex flex-col gap-2">
                {!isAuthReady ? (
                  <div className="w-full h-[36px]" aria-hidden="true" />
                ) : session ? (
                  <>
                    <Link
                      href={session.role === "LGU_ADMIN" ? "/admin/lgu" : "/admin/barangay"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2 text-sm font-semibold text-white shadow-md dark:bg-white dark:text-black"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                      Dashboard
                    </Link>
                    <form action={logout} className="w-full">
                      <button
                        type="submit"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2 text-sm font-semibold text-neutral-600 dark:border-white/10 dark:text-neutral-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                        Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center rounded-xl bg-neutral-900 py-2 text-sm font-semibold text-white shadow-md dark:bg-white dark:text-black"
                  >
                    Portal Access
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
    </>
  );
}
