"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AiBotSparkleIcon,
  ScaleIcon,
  FlameIcon,
  CarIcon,
  Volume2Icon,
  SearchIcon,
  CheckCircle2Icon,
  CivicHallIcon,
  Building2Icon,
} from "@/components/dashboard/icons";

interface SimulationPrompt {
  id: string;
  category: string;
  question: string;
  ordinanceTitle: string;
  resolutionNumber: string;
  answer: string;
  penalty: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SIMULATION_PROMPTS: SimulationPrompt[] = [
  {
    id: "curfew",
    category: "Public Safety",
    question: "Ano ang patakaran at oras ng curfew para sa mga menor de edad sa Cabanatuan?",
    ordinanceTitle: "City Curfew and Minor Protection Ordinance",
    resolutionNumber: "Res. No. 2018-042",
    answer:
      "Ayon sa City Ordinance No. 2018-042, mahigpit na ipinagbabawal ang paggala ng mga menor de edad (edad 17 pababa) sa lahat ng pampublikong lansangan at lugar mula 10:00 PM hanggang 4:00 AM maliban kung may kasamang magulang o may lehitimong emergency.",
    penalty: "1st Offense: Warning at Referral sa Barangay CSWD • 2nd: ₱1,000 multa at 8 oras community service ng magulang.",
    icon: ScaleIcon,
  },
  {
    id: "solid-waste",
    category: "Environment",
    question: "Pwede bang magsunog ng tuyong dahon at basura sa sariling bakuran o tabing-kalsada?",
    ordinanceTitle: "Comprehensive Ecological Solid Waste Management Code",
    resolutionNumber: "Res. No. 2019-118",
    answer:
      "Mahigpit na ipinagbabawal ang open burning o 'siga' ng kahit anong uri ng basura, kabilang ang tuyong dahon, plastik, at sanga sa ilalim ng City Solid Waste Code at Republic Act 9003.",
    penalty: "₱1,000 hanggang ₱5,000 na multa o 1 hanggang 15 araw na pagkabilanggo o community service.",
    icon: FlameIcon,
  },
  {
    id: "road-obstruction",
    category: "Traffic & Roads",
    question: "Bawal bang magparada sa bangketa o magtayo ng garahe sa pampublikong daan?",
    ordinanceTitle: "City Road Clearing and Sidewalk Protection Ordinance",
    resolutionNumber: "Res. No. 2021-085",
    answer:
      "Ipinagbabawal ang paggamit ng bangketa, sidewalk, at lansangan bilang pribadong paradahan, talyer, display ng paninda, o permanenteng extension ng bahay. Ang bangketa ay para sa mga pedestrian lamang.",
    penalty: "Agarang pag-impound ng sasakyan, demolisyon ng sagabal, at ₱2,500 multa sa may-ari.",
    icon: CarIcon,
  },
  {
    id: "noise-pollution",
    category: "Peace & Order",
    question: "Hanggang anong oras pwede mag-videoke o magpatugtog ng malakas sa gabi?",
    ordinanceTitle: "City Anti-Noise and Public Decorum Ordinance",
    resolutionNumber: "Res. No. 2020-064",
    answer:
      "Ang paggamit ng videoke, sound amplification, o labis na maingay na kagamitan sa mga residential zones ay pinapayagan lamang hanggang 10:00 PM. Ipinagbabawal din ang labis na maingay na tambutso (open pipe) sa lahat ng oras.",
    penalty: "1st: Pagsaway at confiscation ng mic/equipment • 2nd: ₱2,000 multa • 3rd: ₱5,000 at barangay hearing.",
    icon: Volume2Icon,
  },
];

export function LegislativeAiSimulator() {
  const [activePrompt, setActivePrompt] = useState<SimulationPrompt>(
    SIMULATION_PROMPTS[0]
  );
  const IconComponent = activePrompt.icon;

  return (
    <div className="rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-card)]/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
      {/* Simulation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <AiBotSparkleIcon size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-ink)]">
              AI Legislative Simulator
            </h3>
            <p className="text-xs text-[var(--text-mute)]">
              Subukan ang mga karaniwang katanungan ng mga mamamayan ng Cabanatuan
            </p>
          </div>
        </div>

        <Link
          href="/chatbot"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
        >
          <span>Buksan ang Buong Chatbot</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Clickable Question Chips */}
      <div className="mt-5 space-y-2">
        <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-mute)]">
          Pumili ng Paksa o Tanong:
        </p>
        <div className="flex flex-wrap gap-2">
          {SIMULATION_PROMPTS.map((prompt) => {
            const isSelected = activePrompt.id === prompt.id;
            const PromptIcon = prompt.icon;
            return (
              <button
                key={prompt.id}
                type="button"
                onClick={() => setActivePrompt(prompt)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20 ring-2 ring-emerald-500/40"
                    : "border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-body)] hover:border-emerald-500/40 hover:text-[var(--text-ink)]"
                }`}
              >
                <PromptIcon size={14} className="shrink-0" />
                <span>{prompt.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Live Chat Response Box */}
      <div className="mt-6 space-y-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 p-5">
        {/* User Question */}
        <div className="flex justify-end">
          <div className="max-w-[90%] md:max-w-[80%] rounded-2xl rounded-tr-sm bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 px-4 py-3 text-xs md:text-sm text-[var(--text-ink)] font-medium leading-relaxed">
            {activePrompt.question}
          </div>
        </div>

        {/* AI Answer with Verified Badge */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <IconComponent size={16} />
          </div>
          <div className="flex-1 space-y-3 rounded-2xl rounded-tl-sm border border-emerald-600/30 bg-[var(--bg-card)] p-4 shadow-sm">
            {/* Citation Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-2 text-[11px] font-mono">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {activePrompt.ordinanceTitle}
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-300 font-bold">
                {activePrompt.resolutionNumber}
              </span>
            </div>

            {/* Answer Content */}
            <p className="text-xs md:text-sm leading-relaxed text-[var(--text-body)]">
              {activePrompt.answer}
            </p>

            {/* Penalty Box */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-400">
                Kaukulang Parusa at Multa:{" "}
              </span>
              <span className="text-[var(--text-body)]">{activePrompt.penalty}</span>
            </div>

            {/* Verification Footer */}
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-mute)] pt-1">
              <CheckCircle2Icon size={14} className="text-emerald-500" />
              <span>Grounded sa opisyal na Sangguniang Panlungsod database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 89 Barangays Districts Showcase
const DISTRICTS = [
  {
    name: "Poblacion & City Center",
    barangays: [
      "Kapitan Pepe",
      "Poblacion North",
      "Poblacion South",
      "San Roque Norte",
      "San Roque Sur",
      "Burgos",
      "General Luna",
      "Del Pilar",
    ],
  },
  {
    name: "Northern District",
    barangays: [
      "Bantug Bulalo",
      "Bantug Norte",
      "Camp Tinio",
      "Dicarma",
      "Magsaysay Norte",
      "Magsaysay Sur",
      "Mayapyap Norte",
      "Mayapyap Sur",
    ],
  },
  {
    name: "Southern District",
    barangays: [
      "San Josef Norte",
      "San Josef Sur",
      "Sumacab Este",
      "Sumacab Norte",
      "Sumacab Sur",
      "Valle Cruz",
      "Soledad",
      "Santa Arcadia",
    ],
  },
  {
    name: "Eastern & Western Districts",
    barangays: [
      "Aduas Centro",
      "Aduas Norte",
      "Aduas Sur",
      "Barrera",
      "Bakod Bayan",
      "Bitas",
      "Sangitan East",
      "Sangitan West",
    ],
  },
];

export function BarangayDistrictShowcase() {
  const [activeDistrict, setActiveDistrict] = useState(0);

  return (
    <div className="rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase mb-2">
            <CivicHallIcon size={13} />
            <span>89 BARANGAYS DECENTRALIZED NETWORK</span>
          </div>
          <h3 className="text-xl font-extrabold text-[var(--text-ink)]">
            Mga Barangay ng Lungsod ng Cabanatuan
          </h3>
          <p className="mt-1 text-xs text-[var(--text-mute)] max-w-xl">
            Bawat barangay ay may direktang access sa pagpapatupad ng ordinansa,
            pagre-review ng resolusyon, at pag-aksyon sa mga ulat ng komunidad.
          </p>
        </div>

        <Link
          href="/ordinances"
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all shrink-0 active:scale-95"
        >
          <SearchIcon size={14} />
          <span>I-filter ayon sa Barangay</span>
        </Link>
      </div>

      {/* District Selector Tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {DISTRICTS.map((dist, idx) => (
          <button
            key={dist.name}
            type="button"
            onClick={() => setActiveDistrict(idx)}
            className={`min-h-[38px] rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeDistrict === idx
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                : "border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-mute)] hover:text-[var(--text-ink)]"
            }`}
          >
            {dist.name}
          </button>
        ))}
      </div>

      {/* Barangay Badges Grid */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {DISTRICTS[activeDistrict].barangays.map((brgy) => (
          <Link
            key={brgy}
            href={`/ordinances?search=${encodeURIComponent(brgy)}`}
            className="group flex items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-3 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Building2Icon size={13} />
            </div>
            <span className="truncate text-xs font-medium text-[var(--text-ink)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {brgy}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-[var(--text-mute)] pt-4 border-t border-[var(--border-hairline)]">
        <span>Ipinapakita ang piling barangays para sa distrito na ito</span>
        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          Lahat ng 89 na Barangay ay Rehistrado
        </span>
      </div>
    </div>
  );
}
