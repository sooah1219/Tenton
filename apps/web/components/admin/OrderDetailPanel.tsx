"use client";

import type { OrderDTO, OrderStatus } from "@/types/order";
import { X } from "lucide-react";
import { fmtLocal, InfoBox, money, payPill, statusPill } from "./adminOrdersUi";

export default function OrderDetailPanel({
  selectedId,
  onClose,
  detail,
  detailLoading,
  detailError,
  statuses,
  updatingStatus,
  toast,
  onUpdateStatus,

  // ✅ front-only cooking
  isCooking,
  onStartCooking,
}: {
  selectedId: string | null;
  onClose: () => void;

  detail: OrderDTO | null;
  detailLoading: boolean;
  detailError: string | null;

  statuses: OrderStatus[];
  updatingStatus: boolean;
  toast: string | null;
  onUpdateStatus: (s: OrderStatus) => void;

  isCooking: boolean;
  onStartCooking: () => void;
}) {
  return (
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
              onClick={onClose}
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
                    {detail.payMethod === "store" ? "Pay in store" : "Card"}
                  </span>

                  {/* front-only cooking pill */}
                  {isCooking && (
                    <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800">
                      COOKING
                    </span>
                  )}
                </div>

                {/* Cooking start (front-only) */}
                <div className="rounded-2xl bg-white/60 border border-black/10 p-5 space-y-2">
                  <div className="text-sm font-medium text-tenton-brown">
                    Kitchen
                  </div>

                  <button
                    type="button"
                    onClick={onStartCooking}
                    disabled={isCooking}
                    className={[
                      "h-10 w-full rounded-xl border text-sm transition",
                      isCooking
                        ? "bg-orange-600 text-white border-orange-600 cursor-default"
                        : "bg-white/70 border-black/10 text-tenton-brown hover:bg-white/90",
                    ].join(" ")}
                    title="Front-only: mark as cooking"
                  >
                    {isCooking ? "Cooking started" : "Cooking start"}
                  </button>

                  <div className="text-[11px] text-black/55">
                    This is front-only UI state (no backend update).
                  </div>
                </div>

                {/* Items */}
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
                              {money(li.unitBasePriceCentsSnapshot)}
                            </div>
                          </div>

                          <div className="text-sm text-tenton-brown whitespace-nowrap">
                            {money(li.lineSubtotalCentsSnapshot)}
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
                                      : money(op.unitPriceDeltaCentsSnapshot)}
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

                {/* Update status */}
                <div className="rounded-2xl bg-white/60 border border-black/10 p-5 space-y-3">
                  <div className="text-sm font-medium text-tenton-brown">
                    Update status
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updatingStatus || s === detail.status}
                        onClick={() => onUpdateStatus(s)}
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

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <InfoBox label="Pickup" value={fmtLocal(detail.pickupAt)} />
                  <InfoBox label="Created" value={fmtLocal(detail.createdAt)} />
                  <InfoBox
                    label="Subtotal"
                    value={money(detail.subtotalCents)}
                  />
                  <InfoBox label="Tax" value={money(detail.taxCents)} />
                </div>

                <div className="rounded-xl bg-white/70 border border-black/5 p-3">
                  <div className="text-[11px] text-black/55">Total</div>
                  <div className="mt-1 font-averia-serif text-3xl text-tenton-brown">
                    {money(detail.totalCents)}
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
                    <div className="text-[11px] text-black/55">Note</div>
                    <div className="mt-1 text-black/80">
                      {detail.customer.note}
                    </div>
                  </div>
                ) : null}
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
  );
}
