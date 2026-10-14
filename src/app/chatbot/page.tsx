import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ChatbotClient } from "./chatbot-client";

export const metadata: Metadata = {
  title: "AI Ordinance Information Assistant | Cabanatuan Ordinance AI",
  description:
    "Magtanong nang libre kay Cabanatuan Ordinance AI para sa impormasyon tungkol sa mga ordinansa, curfew, basura, at regulasyon ng Cabanatuan.",
};

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 dark:bg-[#050807] dark:text-white selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <Navbar />

      <main
        id="main-content"
        className="relative flex-1 overflow-hidden py-12 min-h-[calc(100vh-140px)]"
      >
        {/* Aurora Glow & Scanlines */}
        <div
          className="pointer-events-none absolute right-1/4 top-10 h-[500px] w-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/15 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,#000_70%,transparent_100%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ChatbotClient />
        </div>
      </main>

      <Footer />
    </div>
  );
}
