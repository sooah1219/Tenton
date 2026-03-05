"use client";

import Image from "next/image";
import { useMemo } from "react";

import type { CartLine } from "@/components/order/OnlineOrderPage";
import {
  lineExtraPriceCents,
  lineSummary,
  moneyFromCents,
} from "@/components/order/helpers";

export default function OrderSummaryCard({
  cart,
  hydrated,
}: {
  cart: CartLine[];
  hydrated: boolean;
}) {
  const subtotalCents = useMemo(() => {
    return cart.reduce((sum, l) => {
      const unitCents = l.item.priceCents + lineExtraPriceCents(l.config);
      return sum + unitCents * l.qty;
    }, 0);
  }, [cart]);

  const gstCents = useMemo(
    () => Math.round(subtotalCents * 0.05),
    [subtotalCents]
  );

  const totalCents = useMemo(
    () => subtotalCents + gstCents,
    [subtotalCents, gstCents]
  );

  const totalItems = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);

  return (
    <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-black/10">
        <div className="text-sm text-black/50 font-medium">
          My Item ({totalItems})
        </div>
        <div className="text-2xl font-semibold tracking-tight">
          Order Summary
        </div>
      </div>

      <div className="p-4">
        {!hydrated ? (
          <div className="text-sm text-black/50 py-8 text-center">Loading…</div>
        ) : cart.length === 0 ? (
          <div className="text-sm text-black/50 py-8 text-center">
            Your order is empty
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((l) => {
              const unitCents =
                l.item.priceCents + lineExtraPriceCents(l.config);
              const summary = lineSummary(l.config);

              return (
                <div key={l.key} className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-black/5 shrink-0">
                    {l.item.imageUrl ? (
                      <Image
                        src={l.item.imageUrl}
                        alt={l.item.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">
                      {l.item.name}
                    </div>

                    {summary ? (
                      <div className="text-[11px] text-black/45 line-clamp-5 break-words">
                        {summary}
                      </div>
                    ) : null}

                    <div className="text-[11px] text-black/45">x {l.qty}</div>
                  </div>

                  <div className="text-sm font-semibold">
                    {moneyFromCents(unitCents * l.qty)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-black/10 pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-black/60">SUB-TOTAL</span>
            <span>{moneyFromCents(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-black/60">GST (5%)</span>
            <span>{moneyFromCents(gstCents)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between font-semibold">
          <span>TOTAL</span>
          <span>{moneyFromCents(totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
