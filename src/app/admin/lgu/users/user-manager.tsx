"use client";

import { useState, useTransition, useRef } from "react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { toast } from "sonner";
import { PlusIcon, Trash2Icon } from "@/components/dashboard/icons";
import { createUser, deleteUser } from "../actions";

type UserRole = "LGU_ADMIN" | "BARANGAY_ADMIN";

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole | "CITIZEN";
  createdAt: Date;
  barangay: { id: string; name: string } | null;
};

type Barangay = { id: string; name: string };

interface Props {
  initialUsers: User[];
  barangays: Barangay[];
}

const OFFICIAL_ROLES: { value: UserRole; label: string }[] = [
  { value: "BARANGAY_ADMIN", label: "Barangay Admin" },
];

export function UserManager({ initialUsers, barangays }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<{ id: string; name: string } | null>(null);
  const [deleteTrigger, setDeleteTrigger] = useState<HTMLButtonElement | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  function formatDate(d: Date) {
    return new Date(d).toLocaleDateString("fil-PH", { month: "short", day: "numeric", year: "numeric" });
  }

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createUser(fd);
      if (result.error) {
        setFormError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Bagong user ay naidagdag.");
        // Reload via full refresh since we need server data
        window.location.reload();
      }
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    startTransition(async () => {
      const result = await deleteUser(deleteId.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== deleteId.id));
        toast.success(`${deleteId.name} ay natanggal.`);
      }
      setDeleteId(null);
      deleteTrigger?.focus();
      setDeleteTrigger(null);
    });
  };

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-mute)]">{users.length} opisyal sa sistema</p>
        <button
          ref={addBtnRef}
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="add-user-form"
          className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-primary)]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
        >
          <PlusIcon size={16} />
          <span>Magdagdag ng Opisyal</span>
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <form
          id="add-user-form"
          onSubmit={handleCreateUser}
          className="card-elevated p-5 space-y-4"
          aria-label="Form para magdagdag ng bagong opisyal"
          noValidate
        >
          <h2 className="text-sm font-bold text-[var(--text-ink)]">Bagong Opisyal</h2>
          {formError && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-[var(--radius-sm)] px-3 py-2">
              ❌ {formError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-name" className="text-sm font-medium text-[var(--text-ink)]">
                Buong Pangalan <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only"> (kinakailangan)</span>
              </label>
              <input id="user-name" name="name" type="text" required
                className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                placeholder="Hal. Kap. Juan Garcia"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-email" className="text-sm font-medium text-[var(--text-ink)]">
                Email Address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input id="user-email" name="email" type="email" required
                className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
                placeholder="email@cabanatuan.gov.ph"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-role" className="text-sm font-medium text-[var(--text-ink)]">
                Papel (Role) <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select id="user-role" name="role" required
                className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              >
                {OFFICIAL_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-barangay" className="text-sm font-medium text-[var(--text-ink)]">
                Barangay <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select id="user-barangay" name="barangayId" required
                className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              >
                <option value="">— Pumili ng Barangay —</option>
                {barangays.map((b) => {
                  const hasAdmin = users.some(u => u.barangay?.id === b.id && u.role === "BARANGAY_ADMIN");
                  return (
                    <option key={b.id} value={b.id} disabled={hasAdmin}>
                      {b.name} {hasAdmin ? "(May Admin Na)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="user-password" className="text-sm font-medium text-[var(--text-ink)]">
                Pansamantalang Password
              </label>
              <input id="user-password" name="password" type="password" placeholder="Default: password123"
                className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-ink)] placeholder:text-[var(--text-mute)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => { setShowForm(false); addBtnRef.current?.focus(); }}
              className="min-h-[44px] rounded-[var(--radius-sm)] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-2 text-sm font-semibold text-[var(--text-ink)] hover:bg-[var(--border-hairline)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
            >
              Kanselahin
            </button>
            <button type="submit" disabled={isPending}
              className="min-h-[44px] rounded-[var(--radius-sm)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-primary)]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:opacity-50"
            >
              {isPending ? "Nagse-save…" : "I-save ang Opisyal"}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Lahat ng opisyal">
            <caption className="sr-only">Listahan ng lahat ng opisyal na may access sa sistema</caption>
            <thead>
              <tr className="border-b border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
                {["Pangalan", "Email", "Papel", "Barangay", "Nirehistro", "Aksyon"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-mute)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-canvas)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--accent-primary)] flex-shrink-0" aria-hidden="true">
                        {u.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <span className="font-medium text-[var(--text-ink)]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-body)]">{u.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge type="role" status={u.role as UserRole} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-body)]">
                    {u.barangay?.name ?? <span className="text-[var(--text-mute)]">City-wide</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-mute)] whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={(e) => { setDeleteId({ id: u.id, name: u.name }); setDeleteTrigger(e.currentTarget); }}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-mute)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                      aria-label={`Tanggalin si ${u.name}`}
                    >
                      <Trash2Icon size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Tanggalin ang Opisyal?"
        description={`Permanenteng matatanggal ang account ni "${deleteId?.name}". Hindi ito maibabalik.`}
        confirmLabel="Tanggalin"
        cancelLabel="Huwag"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteId(null); deleteTrigger?.focus(); setDeleteTrigger(null); }}
      />
    </div>
  );
}
