"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PhoneIcon, ClockIcon, MailIcon } from "@/components/dashboard/icons";

/**
 * Client Wrapper for Login Page — integrated with global next-themes,
 * zero hydration theme flash, winauth.net-inspired aurora mesh, and sleek civic branding.
 */
export function LoginClient() {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "recovery">("login");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!showAccessModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setShowAccessModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showAccessModal]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden transition-colors duration-500 bg-[#fafaf9] text-neutral-900 selection:bg-emerald-600 selection:text-white dark:bg-[#050807] dark:text-white dark:selection:bg-emerald-500 dark:selection:text-black">
      {/* Aurora Ambient Background Gradients */}
      <div
        className="pointer-events-none absolute -left-1/4 top-1/4 h-[600px] w-[600px] rounded-full blur-[130px] transition-opacity duration-500 bg-emerald-500/15 opacity-80 dark:bg-emerald-600/20 dark:opacity-100"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/3 top-0 h-[450px] w-[450px] rounded-full blur-[120px] transition-opacity duration-500 bg-emerald-400/15 opacity-70 dark:bg-emerald-500/15 dark:opacity-100"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-10 h-[500px] w-[500px] rounded-full blur-[140px] transition-opacity duration-500 bg-amber-400/10 opacity-60 dark:bg-amber-500/10 dark:opacity-100"
        aria-hidden="true"
      />

      {/* Vertical Glass Grid / Scanline overlay (inspired by winauth.net) */}
      <div
        className="pointer-events-none absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] bg-[linear-gradient(to_right,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px)]"
        aria-hidden="true"
      />

      {/* Main Container Shell: Bounded Max-Width and Centered Layout */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between">
        {/* Top Header: Spans container width */}
        <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 p-1 shadow-md shadow-emerald-500/10 border border-neutral-200/60 dark:border-white/10 dark:bg-white/10">
                <Image
                  src="/lgu-logo.png"
                  alt="Cabanatuan City LGU Seal"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs tracking-tight">
                <span className="font-bold text-neutral-900 dark:text-white">
                  Cabanatuan City
                </span>
                <span className="text-neutral-400 dark:text-neutral-500">/</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Ordinance Portal
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2.5">
              {/* Theme Toggle Button */}
              <ThemeToggle />

              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur-md transition-all hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-950 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <span>← Bumalik sa Home</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Center Stage: Hero Content & Login Card side-by-side with balanced gap */}
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 flex items-center justify-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Column: Hero Branding & Tagline */}
            <div className="flex flex-col justify-center lg:col-span-7 max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-100 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-emerald-800 uppercase dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full animate-pulse bg-emerald-600 dark:bg-emerald-400" />
                <span>Mag-login sa Portal</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-5xl xl:text-6xl lg:leading-[1.1] dark:text-white">
                Ordinansa ng Lungsod. <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-emerald-600 to-neutral-900 dark:from-emerald-400 dark:via-emerald-200 dark:to-white">
                  Malinaw para sa lahat.
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg dark:text-neutral-400">
                Ang opisyal na digital ordinance hub at AI citizen ordinance assistant
                ng Lungsod ng Cabanatuan. Mag-login upang mamahala ng mga barangay
                ordinance, ulat ng mamamayan, at mga talaan ng lungsod.
              </p>

              {/* Civic Highlight Badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <span className="text-emerald-600 font-bold dark:text-emerald-400 dark:font-normal">
                    ✓
                  </span>
                  <span>89 Barangay Linked</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <span className="text-emerald-600 font-bold dark:text-emerald-400 dark:font-normal">
                    ✓
                  </span>
                  <span>AI Ordinance Assistant</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                  <span className="text-emerald-600 font-bold dark:text-emerald-400 dark:font-normal">
                    ✓
                  </span>
                  <span>Official & Verified</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Login Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white/95 p-8 sm:p-10 shadow-2xl shadow-neutral-300/60 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-[#0a0f0d]/90 dark:shadow-emerald-950/50">
                {authMode === "login" ? (
                  <>
                    {/* Login Card Header */}
                    <div className="mb-8">
                      <div className="mb-2 font-mono text-xs font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                        SIGN IN
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                        Welcome back
                      </h2>
                      <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        Manage your ordinances, citizen reports, and LGU records.
                      </p>
                    </div>

                    {/* Login Form component with Quick-Fill buttons */}
                    <LoginForm
                      onForgotClick={() => {
                        setAuthMode("recovery");
                        setResetSent(false);
                      }}
                    />

                    <div className="mt-6 text-center">
                      <span className="text-xs text-neutral-600 dark:text-neutral-500">
                        Don&apos;t have an account?{" "}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAccessModal(true)}
                        className="text-xs font-semibold underline underline-offset-4 transition-colors text-neutral-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
                      >
                        Request LGU Access
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Recovery Card Header */}
                    <div className="mb-6">
                      <div className="mb-2 font-mono text-xs font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                        RECOVERY
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                        Reset your password
                      </h2>
                      <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        Enter your email and we&apos;ll send a secure reset link.
                      </p>
                    </div>

                    {/* Recovery Form */}
                    {resetSent ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        ✓ Ang secure password reset link ay naipadala na sa{" "}
                        <span className="font-bold">{recoveryEmail || "iyong email"}</span>. Paki-check ang iyong inbox.
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          setResetSent(true);
                        }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="recovery-email"
                            className="text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                          >
                            Email
                          </label>
                          <input
                            id="recovery-email"
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-[#121815]/90 dark:text-white dark:placeholder-neutral-500"
                          />
                        </div>

                        <button
                          type="submit"
                          className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#0a0f0d] px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-neutral-800 active:scale-[0.99] dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                          Send Reset Link
                        </button>
                      </form>
                    )}

                    <div className="mt-8 border-t border-neutral-200 pt-5 text-center text-xs text-neutral-600 dark:border-white/10 dark:text-neutral-400">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("login");
                          setResetSent(false);
                        }}
                        className="font-bold text-neutral-900 hover:underline dark:text-white"
                      >
                        Sign in
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Footer Info: Spans container width */}
        <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-neutral-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-400">
              Pamahalaang Lungsod ng Cabanatuan
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:font-medium dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full animate-ping bg-emerald-600 dark:bg-emerald-500" />
              <span>System Operational</span>
            </span>
          </div>
        </footer>
      </div>

      {/* LGU Access Contact Modal */}
      {showAccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowAccessModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-modal-title"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl transition-all dark:border-white/10 dark:bg-[#0d1410] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowAccessModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:border-white/10 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
              aria-label="Isara ang modal"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Image
                  src="/lgu-logo.png"
                  alt="Cabanatuan City LGU Seal"
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div>
                <h3
                  id="access-modal-title"
                  className="text-base font-bold text-neutral-900 dark:text-white"
                >
                  Request LGU Account Access
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  City Mayor&apos;s Office — Administration
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              Para sa paggawa ng bagong account para sa Barangay Captain, Secretary, Kagawad, o LGU Official, makipag-ugnayan sa City Mayor&apos;s Office:
            </p>

            {/* Contact Details List */}
            <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <PhoneIcon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    City Mayor&apos;s Office — Admin
                  </div>
                  <a
                    href="tel:09190813749"
                    className="font-mono text-sm font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    0919 081 3749
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200 pt-3 dark:border-white/10">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ClockIcon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Office Hours
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    Monday to Friday: 8:00 AM – 6:00 PM
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-neutral-200 pt-3 dark:border-white/10">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MailIcon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    Official Email
                  </div>
                  <a
                    href="mailto:cabanatuan.lgu@gmail.com"
                    className="font-mono text-xs font-bold text-emerald-700 hover:underline dark:text-emerald-400 break-all"
                  >
                    cabanatuan.lgu@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex gap-2">
              <a
                href="tel:09190813749"
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
              >
                Tawagan Ngayon
              </a>
              <button
                type="button"
                onClick={() => setShowAccessModal(false)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 transition-colors"
              >
                Isara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
