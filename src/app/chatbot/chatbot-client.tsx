"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  AiBotSparkleIcon,
  OrdinancesScrollIcon,
  Trash2Icon,
  CheckIcon,
  ScaleIcon,
  CarIcon,
  ClipboardCheckIcon,
  BroomIcon,
  MessageSquareIcon,
} from "@/components/dashboard/icons";
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory as clearStorageHistory,
  getOrCreateSessionId,
} from "@/lib/chat-storage";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  {
    icon: ScaleIcon,
    label: "Curfew rules for minors",
    query: "Ano ang ordinansa at curfew hours para sa mga menor de edad sa Cabanatuan?",
  },
  {
    icon: CarIcon,
    label: "Traffic & illegal parking",
    query: "Ano ang parusa at regulasyon sa illegal parking at trapiko sa lungsod?",
  },
  {
    icon: ClipboardCheckIcon,
    label: "Business permit requirements",
    query: "Ano-ano ang mga kailangan para mag-apply ng business permit?",
  },
  {
    icon: BroomIcon,
    label: "Waste management schedule",
    query: "Ano ang parusa sa hindi tamang pagtatapon o pagsusunog ng basura?",
  },
];

export function ChatbotClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialScrollDone = useRef(false);

  const scrollToBottom = (smooth = true) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    const saved = loadChatHistory();
    if (saved.length > 0) {
      setMessages(saved);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(initialScrollDone.current);
      initialScrollDone.current = true;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend ?? input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveChatHistory(newMessages);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          sessionId: getOrCreateSessionId(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "May aberya sa koneksyon sa server.");
      }

      const updatedMessages: Message[] = [
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
        },
      ];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Paumanhin, hindi makakonekta sa system sa ngayon.";
      const updatedMessages: Message[] = [
        ...newMessages,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **Error:** ${errorMessage}`,
        },
      ];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([]);
    clearStorageHistory();
  };

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/60 dark:border-white/10 dark:bg-[#070b09] dark:shadow-2xl dark:shadow-emerald-950/40">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* ─── Left Sidebar Panel ─────────────────────────────────────────── */}
        <div className="flex flex-col justify-between border-b border-neutral-200 bg-neutral-50/70 p-6 lg:col-span-4 lg:border-b-0 lg:border-r dark:border-white/10 dark:bg-[#0a0f0d]/90">
          <div>
            {/* Header Brand */}
            <div className="mb-6 flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm">
                <AiBotSparkleIcon size={24} />
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-neutral-900 dark:text-white">
                  Cabanatuan Ordinance Pilot
                </h2>
                <p className="font-mono text-[10px] font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase">
                  DIGITAL ORDINANCE ASSISTANT
                </p>
              </div>
            </div>

            {/* Intro Description */}
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
              Ang ating AI assistant ay nakadisenyo para tulungan ang mga mamamayan na maunawaan ang mga city at barangay ordinances sa Cabanatuan sa malinaw na Tagalog o English.
            </p>

            {/* Feature Badges */}
            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-2.5 rounded-xl border border-neutral-200/80 bg-white/80 p-3 shadow-xs dark:border-white/5 dark:bg-white/5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckIcon size={14} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    Verified LGU Data
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Nakabatay sa opisyal na database ng mga ordinansa.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-neutral-200/80 bg-white/80 p-3 shadow-xs dark:border-white/5 dark:bg-white/5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MessageSquareIcon size={13} />
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">
                    Contextual Awareness
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Natatandaan ang konteksto ng iyong kasalukuyang usapan.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="mt-6">
              <div className="mb-2.5 font-mono text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                QUICK ACTIONS
              </div>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(action.query)}
                      disabled={isLoading}
                      className="flex w-full items-center gap-2.5 rounded-xl border border-neutral-200/70 bg-white px-3.5 py-2.5 text-left text-xs font-medium text-neutral-700 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:text-emerald-900 dark:border-white/5 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-200 disabled:opacity-50"
                    >
                      <Icon size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Sidebar Action: Clear Chat */}
          <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-white/10">
            <button
              type="button"
              onClick={clearHistory}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-600 shadow-xs transition-colors hover:bg-neutral-100 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10"
            >
              <Trash2Icon size={14} />
              <span>Clear Chat History</span>
            </button>
          </div>
        </div>

        {/* ─── Right Main Chat Workspace ──────────────────────────────────── */}
        <div className="flex flex-col justify-between lg:col-span-8 bg-white dark:bg-[#070b09]">
          {/* Workspace Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50/50 px-6 py-4 dark:border-white/10 dark:bg-[#0c120e]">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                Ordinance Assistant
              </span>
              <span className="hidden sm:inline-block text-neutral-300 dark:text-neutral-700">|</span>
              <span className="hidden sm:inline-block font-mono text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                LIVE ORDINANCE DATABASE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/ordinances">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs transition-colors hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10"
                >
                  <OrdinancesScrollIcon size={14} />
                  <span>Browse Ordinances</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Main Chat Scroll Area */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[520px]">
            {messages.length === 0 ? (
              /* Empty Hero State matching screenshot */
              <div className="flex h-full flex-col items-center justify-center text-center py-12 px-4">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
                  <AiBotSparkleIcon size={44} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  How can I help you today?
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
                  Ask me about local ordinances, traffic rules, business permits, or public safety regulations in Cabanatuan City.
                </p>

                {/* Quick start questions pills */}
                <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl">
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(action.query)}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-700 transition-all hover:border-emerald-500 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40"
                    >
                      {action.query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages Exchange */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex items-start gap-3.5",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs">
                      <AiBotSparkleIcon size={16} />
                    </div>
                  )}

                  <div
                    className={clsx(
                      "max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs",
                      msg.role === "user"
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black font-medium"
                        : "border border-neutral-200/80 bg-neutral-50 text-neutral-900 dark:border-white/10 dark:bg-[#0e1511] dark:text-neutral-100"
                    )}
                  >
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <AiBotSparkleIcon size={16} />
                </div>
                <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-4 text-xs text-neutral-500 dark:border-white/10 dark:bg-[#0e1511] dark:text-neutral-400 flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Nagsusuri sa database ng mga ordinansa...</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Fixed Input Section */}
          <div className="border-t border-neutral-200 bg-neutral-50/50 p-4 sm:p-5 dark:border-white/10 dark:bg-[#0a0f0d]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your ordinance inquiry here..."
                disabled={isLoading}
                className="w-full rounded-2xl border border-neutral-300 bg-white py-3.5 pl-4 pr-14 text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-white/10 dark:bg-[#121915] dark:text-white dark:placeholder-neutral-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-40 dark:bg-emerald-500 dark:text-black dark:hover:bg-emerald-400"
              >
                {isLoading ? "..." : "➔"}
              </button>
            </form>

            <div className="mt-3 text-center font-mono text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
              POWERED BY THE CITY ORDINANCE ARCHIVE & AI LANGUAGE MODEL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
