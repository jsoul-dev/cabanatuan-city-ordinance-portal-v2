import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import {
  FileEditIcon,
  HourglassIcon,
  CheckCircle2Icon,
  XCircleIcon,
  PlusIcon,
  RefreshCwIcon,
  BanIcon,
  CivicHallIcon,
  BarangayHouseIcon,
} from "@/components/dashboard/icons";

/**
 * Badge component — status indicators for ordinance workflow.
 *
 * A11Y §3 Perceivable: MUST NOT convey state using color alone.
 * Each variant uses icon + text + color for semantic redundancy.
 */

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5",
    "rounded-full px-2.5 py-0.5",
    "text-xs font-medium",
    "border",
    "whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        draft: "bg-[var(--border-hairline-soft,#f2f2f2)] text-[var(--text-body)] border-[var(--border-hairline)]",
        pending:
          "bg-[var(--color-warning-soft)] text-[var(--color-warning-deep,#ab570a)] border-[var(--color-warning)]",
        approved:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
        rejected:
          "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        new: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        "in-progress":
          "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
        resolved:
          "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
        dismissed:
          "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800",
        city: "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20",
        barangay:
          "bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] border-[var(--accent-gold)]/20",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

// Status icons for semantic redundancy (A11Y: icon + text + color)
const statusIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  draft: FileEditIcon,
  pending: HourglassIcon,
  approved: CheckCircle2Icon,
  rejected: XCircleIcon,
  new: PlusIcon,
  "in-progress": RefreshCwIcon,
  resolved: CheckCircle2Icon,
  dismissed: BanIcon,
  city: CivicHallIcon,
  barangay: BarangayHouseIcon,
};

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Hide the status icon (defaults to showing it for A11Y) */
  hideIcon?: boolean;
}

function Badge({
  className,
  variant,
  hideIcon = false,
  children,
  ...props
}: BadgeProps) {
  const IconComponent = variant ? statusIcons[variant] : null;

  return (
    <span className={clsx(badgeVariants({ variant }), className)} {...props}>
      {!hideIcon && IconComponent && (
        <span aria-hidden="true" className="shrink-0 flex items-center">
          <IconComponent size={11} className="stroke-[2.2]" />
        </span>
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
