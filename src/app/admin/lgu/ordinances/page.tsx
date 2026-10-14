import type { Metadata } from "next";
import { getLguAllOrdinances } from "@/lib/dashboard-queries";
import { LguOrdinanceManager } from "./ordinance-manager";

export const metadata: Metadata = {
  title: "Pamamahala ng Ordinansa — LGU Admin",
  description: "Suriin, aprubahan, o tanggihan ang mga ordinansa ng barangay.",
};

export default async function LguOrdinancesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; review?: string }>;
}) {
  const params = await searchParams;
  const ordinances = await getLguAllOrdinances({ status: params.status, search: params.search });

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-ink)] tracking-tight">Pamamahala ng Ordinansa</h1>
        <p className="text-sm text-[var(--text-body)] mt-1">
          Suriin, aprubahan, o tanggihan ang mga ordinansa mula sa lahat ng barangay.
        </p>
      </div>
      <LguOrdinanceManager
        initialOrdinances={ordinances as any}
        defaultReviewId={params.review}
      />
    </div>
  );
}
