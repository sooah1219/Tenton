"use client";

import Button from "@/components/ui/CtaButton";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { lineExtraPriceCents, lineSummary, moneyFromCents } from "./helpers";
import type { CartLine } from "./OnlineOrderPage";
import type { PickupDayValue } from "./OrderFilters";

export default function CartSummary({
  cartRef,
  cartHydrated,
  cart,
  pickupDay,
  pickupTime,
  pickupDayLabel,
  decLine,
  incLine,
}: {
  cartRef: React.RefObject<HTMLElement | null>;
  cartHydrated: boolean;
  cart: CartLine[];
  pickupDay: PickupDayValue;
  pickupTime: string;
  pickupDayLabel: (d: PickupDayValue) => string;
  decLine: (key: string) => void;
  incLine: (key: string) => void;
}) {
  const router = useRouter();

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
    <aside ref={cartRef} className="lg:sticky lg:top-28 h-fit">
      <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/10">
          <div className="text-sm text-black/50 font-medium">Pick up at</div>
          <div className="text-2xl font-semibold tracking-tight">
            {pickupTime ? `${pickupDayLabel(pickupDay)} • ${pickupTime}` : "—"}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {!cartHydrated ? (
            <div className="text-sm text-black/50 py-8 text-center">
              Loading…
            </div>
          ) : cart.length === 0 ? (
            <div className="text-sm text-black/50 py-8 text-center">
              Your order is empty
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((l) => {
                const summary = lineSummary(l.config);
                const unitCents =
                  l.item.priceCents + lineExtraPriceCents(l.config);

                return (
                  <div
                    key={l.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {l.item.name}
                      </div>

                      {summary ? (
                        <div className="text-[11px] text-black/45 line-clamp-5 break-words">
                          {summary}
                        </div>
                      ) : null}

                      <div className="text-xs text-black/50">
                        {moneyFromCents(unitCents)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decLine(l.key)}
                        className="h-7 w-7 rounded-full border border-black/15 hover:border-black/30"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                      <div className="w-6 text-center text-sm font-semibold">
                        {l.qty}
                      </div>
                      <button
                        onClick={() => incLine(l.key)}
                        className="h-7 w-7 rounded-full border border-black/15 hover:border-black/30"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-black/10 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="text-black/60">Subtotal</div>
              <div>{moneyFromCents(subtotalCents)}</div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-black/60">GST (5%)</div>
              <div>{moneyFromCents(gstCents)}</div>
            </div>

            <div className="flex items-center justify-between font-semibold pt-2 border-t border-black/10">
              <div>TOTAL</div>
              <div>{moneyFromCents(totalCents)}</div>
            </div>
          </div>

          <Button
            disabled={cart.length === 0}
            onClick={() => router.push("/payment")}
            size="sm"
            variant={cart.length === 0 ? "ghost" : "primary"}
            showArrow={cart.length !== 0}
          >
            <span className="text-xs opacity-90">{totalItems} items</span>
            <span className="opacity-70">•</span>
            <span className="text-xs opacity-90">
              {moneyFromCents(totalCents)}
            </span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
