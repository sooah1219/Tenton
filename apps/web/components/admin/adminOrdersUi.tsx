"use client";

import type { OrderDTO, OrderStatus } from "@/types/order";

export function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  return (base ?? "").replace(/\/+$/, "");
}

export function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function cmp(a: string | number, b: string | number) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function money(cents: number) {
  const v = (cents ?? 0) / 100;
  return `$${v.toFixed(2)}`;
}

export function fmtLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusPill(status: OrderStatus) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
  if (status === "CONFIRMED")
    return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
  if (status === "CANCELLED")
    return `${base} bg-red-50 text-red-800 border-red-200`;
  return `${base} bg-white/70 text-black/70 border-black/10`;
}

export function payPill(ps: OrderDTO["paymentStatus"]) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
  if (ps === "PAID")
    return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
  return `${base} bg-red-50 text-red-800 border-red-200`;
}

/* ---------- UI helpers ---------- */

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 px-4 rounded-full border text-sm transition",
        active
          ? "bg-tenton-brown text-white border-tenton-brown"
          : "bg-white/60 text-tenton-brown border-black/10 hover:bg-white/80",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[12px] font-medium text-black/60">{label}</div>
      {children}
    </div>
  );
}

export function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 border border-black/5 p-3">
      <div className="text-[11px] text-black/55">{label}</div>
      <div className="mt-1 text-sm text-black/80">{value}</div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="p-8 text-center">
      <div className="font-averia-serif text-2xl text-tenton-brown">
        No orders
      </div>
      <div className="mt-2 text-sm text-black/60">
        Try changing filters or refresh.
      </div>
    </div>
  );
}
