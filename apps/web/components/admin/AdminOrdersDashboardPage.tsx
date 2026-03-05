"use client";

import { adminFetch } from "@/lib/adminApi";
import { RefreshCcw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { OrderDTO, OrderStatus } from "@/types/order";
import OrderDetailPanel from "./OrderDetailPanel";
import OrdersTable from "./OrdersTable";
import { Chip, EmptyState, cmp } from "./adminOrdersUi";

export type AdminOrderListRow = {
  id: string;
  status: OrderStatus;
  createdAt: string; // ISO
  totalCents: number;
  customerName: string;
};

const STATUSES: OrderStatus[] = ["CONFIRMED", "CANCELLED"];
const COOKING_STORAGE_KEY = "admin_orders_cooking_ids_v1";

function ymdInVancouver(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return (iso || "").slice(0, 10);
  return d.toLocaleDateString("en-CA", { timeZone: "America/Vancouver" });
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Failed";
}

export default function AdminOrdersDashboardPage() {
  // list
  const [rows, setRows] = useState<AdminOrderListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // filters
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");

  // date filter (default: today, "YYYY-MM-DD" in Vancouver)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Vancouver",
    });
  });
  const dateRef = useRef<HTMLInputElement | null>(null);

  const selectedDateLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
    return dt.toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Vancouver",
    });
  }, [selectedDate]);

  // selection + detail
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // updates
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // cooking (front-only)
  const [cookingIds, setCookingIds] = useState<Set<string>>(() => new Set());

  // new order modal
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const lastSeenNewestCreatedAtRef = useRef<string | null>(null);
  const didInitRef = useRef(false);

  // load cookingIds from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(COOKING_STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) setCookingIds(new Set(arr));
    } catch {
      // ignore
    }
  }, []);

  // persist cookingIds
  useEffect(() => {
    try {
      localStorage.setItem(
        COOKING_STORAGE_KEY,
        JSON.stringify(Array.from(cookingIds))
      );
    } catch {
      // ignore
    }
  }, [cookingIds]);

  function startCooking(orderId: string) {
    setCookingIds((prev) => {
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });

    setNewOrderModalOpen(false);
    setNewOrderId(null);
  }

  async function loadList(opts?: { silent?: boolean; detectNew?: boolean }) {
    const silent = !!opts?.silent;
    const detectNew = opts?.detectNew !== false; // default true

    try {
      if (!silent) setLoading(true);
      setLoadError(null);

      const res = await adminFetch("/api/admin/orders");
      const data = (await res.json()) as AdminOrderListRow[];
      const list = Array.isArray(data) ? data : [];

      setRows(list);

      // detect new order (by newest createdAt)
      if (detectNew && list.length > 0) {
        const newest = [...list].sort((a, b) =>
          cmp(b.createdAt, a.createdAt)
        )[0];
        const prev = lastSeenNewestCreatedAtRef.current;

        if (!didInitRef.current) {
          didInitRef.current = true;
          lastSeenNewestCreatedAtRef.current = newest.createdAt;
        } else if (prev && newest.createdAt > prev) {
          setNewOrderId(newest.id);
          setSelectedId(newest.id);
          setNewOrderModalOpen(true);
          lastSeenNewestCreatedAtRef.current = newest.createdAt;
        } else {
          lastSeenNewestCreatedAtRef.current = newest.createdAt;
        }
      }
    } catch (e: unknown) {
      setLoadError(getErrorMessage(e));
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // initial load
  useEffect(() => {
    loadList({ silent: false, detectNew: false });
  }, []);

  // polling every 5s (silent)
  useEffect(() => {
    const t = window.setInterval(() => {
      loadList({ silent: true, detectNew: true });
    }, 5000);

    return () => window.clearInterval(t);
  }, []);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = rows;

    // status chip filter (client-side)
    if (status !== "all") list = list.filter((r) => r.status === status);

    // date filter (Vancouver)
    list = list.filter((r) => ymdInVancouver(r.createdAt) === selectedDate);

    // search
    if (q) {
      list = list.filter((r) => {
        const hay = `${r.id} ${r.customerName}`.toLowerCase();
        return hay.includes(q);
      });
    }

    // newest first
    return [...list].sort((a, b) => cmp(b.createdAt, a.createdAt));
  }, [rows, query, selectedDate, status]);

  async function loadDetail(id: string) {
    try {
      setDetailLoading(true);
      setDetailError(null);
      setDetail(null);

      const res = await adminFetch(`/api/admin/orders/${id}`);
      const data = (await res.json()) as OrderDTO;
      setDetail(data);
    } catch (e: unknown) {
      setDetailError(getErrorMessage(e));
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
  }, [selectedId]);

  async function updateStatus(next: OrderStatus) {
    if (!selectedId) return;

    try {
      setUpdatingStatus(true);
      setToast(null);

      await adminFetch(`/api/admin/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      setRows((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, status: next } : r))
      );
      setDetail((prev) => (prev ? { ...prev, status: next } : prev));

      setToast("Status updated.");
      window.setTimeout(() => setToast(null), 1800);
    } catch (e: unknown) {
      setToast(getErrorMessage(e));
      window.setTimeout(() => setToast(null), 2500);
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
        </div>

        <section className="rounded-2xl bg-white/70 border border-black/10 shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 pt-2">
              <div className="font-averia-serif text-3xl md:text-4xl text-tenton-brown">
                {selectedDateLabel}
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    dateRef.current?.showPicker?.() ?? dateRef.current?.click()
                  }
                  className="h-10 px-3 rounded-xl border border-black/10 bg-white/60 text-tenton-brown hover:bg-white/80"
                >
                  Choose date
                </button>

                <input
                  ref={dateRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="sr-only"
                />
              </div>
            </div>

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
                  onClick={() => loadList({ silent: false, detectNew: false })}
                  className="h-10 px-3 rounded-xl border border-black/10 bg-white/60 text-tenton-brown hover:bg-white/80"
                  title="Refresh"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadError && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
          </div>

          <div className="border-t border-black/10" />

          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%]">
            <div className="border-r border-black/10">
              {loading ? (
                <div className="p-8 text-center text-sm text-black/60">
                  Loading…
                </div>
              ) : filteredSorted.length === 0 ? (
                <EmptyState />
              ) : (
                <OrdersTable
                  rows={filteredSorted}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>

            <OrderDetailPanel
              selectedId={selectedId}
              onClose={() => setSelectedId(null)}
              detail={detail}
              detailLoading={detailLoading}
              detailError={detailError}
              statuses={STATUSES}
              updatingStatus={updatingStatus}
              toast={toast}
              onUpdateStatus={updateStatus}
              isCooking={selectedId ? cookingIds.has(selectedId) : false}
              onStartCooking={() => selectedId && startCooking(selectedId)}
            />
          </div>
        </section>
      </div>

      {newOrderModalOpen && newOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-black/10 overflow-hidden">
            <div className="p-5">
              <div className="font-averia-serif text-2xl text-tenton-brown">
                New order arrived
              </div>

              <div className="mt-2 text-sm text-black/60">
                Order ID:{" "}
                <span className="font-medium text-black/75">{newOrderId}</span>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNewOrderModalOpen(false);
                    setNewOrderId(null);
                  }}
                  className="h-10 px-3 rounded-xl border border-black/10 bg-white/70 hover:bg-white"
                >
                  Dismiss
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(newOrderId);
                    setNewOrderModalOpen(false);
                  }}
                  className="h-10 px-3 rounded-xl bg-tenton-brown text-white hover:opacity-90"
                >
                  Open detail
                </button>
              </div>

              <div className="mt-3 text-[11px] text-black/45">
                Tip: Press <span className="font-medium">Cooking start</span> in
                the detail panel to mark it as cooking (front-only).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
