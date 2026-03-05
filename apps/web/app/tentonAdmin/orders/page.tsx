"use client";

import { ArrowUpDown, ChevronRight, RefreshCcw, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { OrderDTO, OrderStatus } from "@/types/order";

/** Admin list endpoint shape: GET /api/admin/orders */
type AdminOrderListRow = {
  id: string;
  status: OrderStatus;
  createdAt: string; // ISO
  totalCents: number;
  customerName: string;
};

type SortKey =
  | "created_desc"
  | "created_asc"
  | "total_desc"
  | "total_asc"
  | "name_asc"
  | "name_desc";

const STATUSES: OrderStatus[] = ["CONFIRMED", "CANCELLED"];

function apiBase() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Next client env must start with NEXT_PUBLIC_
  return (base ?? "").replace(/\/+$/, "");
}

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

function cmp(a: string | number, b: string | number) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function money(cents: number, currency: string) {
  const v = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
    }).format(v);
  } catch {
    return `${currency} ${v.toFixed(2)}`;
  }
}

function fmtLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusPill(status: OrderStatus) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
  if (status === "CONFIRMED")
    return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
  if (status === "CANCELLED")
    return `${base} bg-red-50 text-red-800 border-red-200`;
  return `${base} bg-white/70 text-black/70 border-black/10`;
}

function payPill(ps: OrderDTO["paymentStatus"]) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
  if (ps === "PAID")
    return `${base} bg-emerald-50 text-emerald-800 border-emerald-200`;
  return `${base} bg-red-50 text-red-800 border-red-200`; // UNPAID
}

export default function AdminOrdersDashboardPage() {
  const BASE = apiBase();

  // list
  const [rows, setRows] = useState<AdminOrderListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // filters
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("created_desc");

  // selection + detail
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // updates
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function loadList() {
    try {
      setLoading(true);
      setLoadError(null);

      if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set.");

      const qs =
        status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
      const url = joinUrl(BASE, `/api/admin/orders${qs}`);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as AdminOrderListRow[];
      setRows(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, BASE]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = rows;
    if (q) {
      list = list.filter((r) => {
        const hay = `${r.id} ${r.customerName}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      const aCreated = a.createdAt;
      const bCreated = b.createdAt;

      if (sort === "created_desc") return cmp(bCreated, aCreated);
      if (sort === "created_asc") return cmp(aCreated, bCreated);

      if (sort === "total_desc")
        return cmp(b.totalCents, a.totalCents) || cmp(bCreated, aCreated);
      if (sort === "total_asc")
        return cmp(a.totalCents, b.totalCents) || cmp(bCreated, aCreated);

      if (sort === "name_asc")
        return (
          cmp(a.customerName.toLowerCase(), b.customerName.toLowerCase()) ||
          cmp(bCreated, aCreated)
        );
      return (
        cmp(b.customerName.toLowerCase(), a.customerName.toLowerCase()) ||
        cmp(bCreated, aCreated)
      );
    });
  }, [rows, query, sort]);

  async function loadDetail(id: string) {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);

      if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set.");

      // requires backend: GET /api/admin/orders/{id}
      const url = joinUrl(BASE, `/api/admin/orders/${id}`);

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = (await res.json()) as OrderDTO;
      setDetail(data);
    } catch (e: unknown) {
      setDetailError(
        e instanceof Error ? e.message : "Failed to load order detail."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setDetailError(null);
      return;
    }
    loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, BASE]);

  async function updateStatus(next: OrderStatus) {
    if (!selectedId) return;

    try {
      setUpdatingStatus(true);
      setToast(null);

      if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set.");

      const url = joinUrl(BASE, `/api/admin/orders/${selectedId}/status`);

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      setRows((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, status: next } : r))
      );
      setDetail((prev) => (prev ? { ...prev, status: next } : prev));

      setToast("Status updated.");
      setTimeout(() => setToast(null), 1800);
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : "Failed to update status.");
      setTimeout(() => setToast(null), 2500);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div className="min-h-screen bg-tenton-bg pb-10">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
        <div className="mb-6">
          <h1 className="font-averia-serif text-4xl md:text-5xl text-tenton-brown">
            Orders
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Staff dashboard for pickup orders.
          </p>
          {!BASE && (
            <div className="mt-3 rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
              Missing NEXT_PUBLIC_API_BASE_URL
            </div>
          )}
        </div>

        <section className="rounded-2xl bg-white/70 border border-black/10 shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Chip
                  active={status === "all"}
                  onClick={() => setStatus("all")}
                >
                  All
                </Chip>
                {STATUSES.map((s) => (
                  <Chip
                    key={s}
                    active={status === s}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </Chip>
                ))}
              </div>

              <div className="flex gap-2 w-full md:w-[420px]">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search order id / customer…"
                    className="w-full h-10 rounded-xl border border-black/10 bg-white/70 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/25"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => loadList()}
                  className="h-10 px-3 rounded-xl border border-black/10 bg-white/60 text-tenton-brown hover:bg-white/80"
                  title="Refresh"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-3 items-end">
              <Labeled label="Sort">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="w-full h-10 rounded-xl border border-black/10 bg-white/70 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/25"
                  >
                    <option value="created_desc">Created (new → old)</option>
                    <option value="created_asc">Created (old → new)</option>
                    <option value="total_desc">Total (high → low)</option>
                    <option value="total_asc">Total (low → high)</option>
                    <option value="name_asc">Customer (A → Z)</option>
                    <option value="name_desc">Customer (Z → A)</option>
                  </select>
                </div>
              </Labeled>

              <div className="rounded-2xl bg-white/60 border border-black/5 p-4">
                <div className="text-[11px] text-black/55">Visible</div>
                <div className="mt-1 font-averia-serif text-2xl text-tenton-brown">
                  {filteredSorted.length} orders
                </div>
              </div>
            </div>

            {loadError && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
          </div>

          <div className="border-t border-black/10" />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
            {/* TABLE */}
            <div className="border-r border-black/10">
              {loading ? (
                <div className="p-8 text-center text-sm text-black/60">
                  Loading…
                </div>
              ) : filteredSorted.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-sm">
                    <colgroup>
                      <col className="w-[220px]" />
                      <col className="w-[140px]" />
                      <col className="w-[140px]" />
                      <col className="w-[260px]" />
                      <col />
                      <col className="w-[60px]" />
                    </colgroup>

                    <thead className="text-left text-black/60">
                      <tr className="bg-white/60 border-b border-black/10">
                        <th className="px-5 py-3 whitespace-nowrap">Created</th>
                        <th className="px-5 py-3 whitespace-nowrap">Status</th>
                        <th className="px-5 py-3 whitespace-nowrap">Total</th>
                        <th className="px-5 py-3 whitespace-nowrap">
                          Customer
                        </th>
                        <th className="px-5 py-3 whitespace-nowrap">
                          Order ID
                        </th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-black/5">
                      {filteredSorted.map((r) => {
                        const active = r.id === selectedId;
                        return (
                          <tr
                            key={r.id}
                            className={[
                              "hover:bg-white/50 cursor-pointer",
                              active ? "bg-white/60" : "",
                            ].join(" ")}
                            onClick={() => setSelectedId(r.id)}
                          >
                            <td className="px-5 py-3 whitespace-nowrap text-black/80">
                              {fmtLocal(r.createdAt)}
                            </td>
                            <td className="px-5 py-3">
                              <span className={statusPill(r.status)}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap font-medium text-tenton-brown">
                              {money(r.totalCents, "CAD")}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className="block truncate"
                                title={r.customerName}
                              >
                                {r.customerName}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className="block truncate text-black/60"
                                title={r.id}
                              >
                                {r.id}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right text-black/40">
                              <ChevronRight className="inline-block h-4 w-4" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* DETAIL */}
            <div className="min-h-[420px]">
              {!selectedId ? (
                <div className="p-6">
                  <div className="rounded-2xl bg-white/60 border border-black/10 p-6">
                    <div className="font-averia-serif text-2xl text-tenton-brown">
                      Select an order
                    </div>
                    <div className="mt-2 text-sm text-black/60">
                      Click a row to see order details and update status.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-black/50">Order</div>
                      <div className="mt-1 font-medium text-tenton-brown break-all">
                        {selectedId}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="h-9 w-9 rounded-xl border border-black/10 bg-white/60 text-black/50 hover:bg-white/80 flex items-center justify-center"
                      title="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {detailError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
                      {detailError}
                    </div>
                  )}

                  {detailLoading ? (
                    <div className="rounded-2xl bg-white/60 border border-black/10 p-6 text-sm text-black/60">
                      Loading details…
                    </div>
                  ) : detail ? (
                    <>
                      <div className="rounded-2xl bg-white/60 border border-black/10 p-5 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={statusPill(detail.status)}>
                            {detail.status}
                          </span>
                          <span className={payPill(detail.paymentStatus)}>
                            {detail.paymentStatus}
                          </span>
                          <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-xs font-medium text-black/70">
                            {detail.payMethod === "store"
                              ? "Pay in store"
                              : "Card"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <InfoBox
                            label="Pickup"
                            value={fmtLocal(detail.pickupAt)}
                          />
                          <InfoBox
                            label="Created"
                            value={fmtLocal(detail.createdAt)}
                          />
                          <InfoBox
                            label="Subtotal"
                            value={money(detail.subtotalCents, detail.currency)}
                          />
                          <InfoBox
                            label="Tax"
                            value={money(detail.taxCents, detail.currency)}
                          />
                        </div>

                        <div className="rounded-xl bg-white/70 border border-black/5 p-3">
                          <div className="text-[11px] text-black/55">Total</div>
                          <div className="mt-1 font-averia-serif text-3xl text-tenton-brown">
                            {money(detail.totalCents, detail.currency)}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/60 border border-black/10 p-5 space-y-2">
                        <div className="text-sm font-medium text-tenton-brown">
                          Customer
                        </div>
                        <div className="text-sm text-black/80">
                          {detail.customer.firstName} {detail.customer.lastName}
                        </div>
                        <div className="text-sm text-black/70">
                          {detail.customer.phone}
                        </div>
                        <div className="text-sm text-black/70">
                          {detail.customer.email}
                        </div>

                        {detail.customer.note ? (
                          <div className="mt-2 rounded-xl bg-white/70 border border-black/5 p-3 text-sm">
                            <div className="text-[11px] text-black/55">
                              Note
                            </div>
                            <div className="mt-1 text-black/80">
                              {detail.customer.note}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="rounded-2xl bg-white/60 border border-black/10 p-5">
                        <div className="text-sm font-medium text-tenton-brown">
                          Items
                        </div>

                        <div className="mt-3 space-y-3">
                          {detail.lineItems.map((li) => (
                            <div
                              key={li.id}
                              className="rounded-2xl bg-white/70 border border-black/5 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div
                                    className="font-medium text-black/85 truncate"
                                    title={li.itemNameSnapshot}
                                  >
                                    {li.itemNameSnapshot}
                                  </div>
                                  <div className="mt-1 text-xs text-black/55">
                                    Qty {li.qty} •{" "}
                                    {money(
                                      li.unitBasePriceCentsSnapshot,
                                      li.currency
                                    )}
                                  </div>
                                </div>

                                <div className="text-sm font-medium text-tenton-brown whitespace-nowrap">
                                  {money(
                                    li.lineSubtotalCentsSnapshot,
                                    li.currency
                                  )}
                                </div>
                              </div>

                              {li.options.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {li.options.map((op) => (
                                    <div key={op.id} className="text-sm">
                                      <div className="text-[11px] text-black/50">
                                        {op.groupTitleSnapshot}
                                      </div>
                                      <div className="flex items-center justify-between gap-2">
                                        <div
                                          className="text-black/80 truncate"
                                          title={op.optionNameSnapshot}
                                        >
                                          {op.optionNameSnapshot} × {op.qty}
                                        </div>
                                        <div className="text-black/60 whitespace-nowrap">
                                          {op.unitPriceDeltaCentsSnapshot === 0
                                            ? "—"
                                            : money(
                                                op.unitPriceDeltaCentsSnapshot,
                                                li.currency
                                              )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {li.note ? (
                                <div className="mt-3 rounded-xl bg-white/80 border border-black/5 p-3 text-sm">
                                  <div className="text-[11px] text-black/55">
                                    Item note
                                  </div>
                                  <div className="mt-1">{li.note}</div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/60 border border-black/10 p-5 space-y-3">
                        <div className="text-sm font-medium text-tenton-brown">
                          Update status
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              disabled={updatingStatus || s === detail.status}
                              onClick={() => updateStatus(s)}
                              className={[
                                "h-10 rounded-xl border text-sm transition",
                                s === detail.status
                                  ? "bg-tenton-brown text-white border-tenton-brown cursor-default"
                                  : "bg-white/70 border-black/10 text-tenton-brown hover:bg-white/90",
                                updatingStatus ? "opacity-60" : "",
                              ].join(" ")}
                            >
                              {s}
                            </button>
                          ))}
                        </div>

                        {toast && (
                          <div className="text-sm text-black/70">{toast}</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl bg-white/60 border border-black/10 p-6 text-sm text-black/60">
                      No detail loaded.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mt-4 text-xs text-black/45">
          Using API base:{" "}
          <span className="font-medium text-black/60">
            {BASE || "(missing NEXT_PUBLIC_API_BASE_URL)"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Chip({
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

function Labeled({
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/70 border border-black/5 p-3">
      <div className="text-[11px] text-black/55">{label}</div>
      <div className="mt-1 text-sm text-black/80">{value}</div>
    </div>
  );
}

function EmptyState() {
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
