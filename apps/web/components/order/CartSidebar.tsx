"use client";

import type { MenuItem } from "@/types/menu";
import { moneyFromCents } from "./helpers";
import type { CartLine } from "./OnlineOrderPage";

export default function CartSidebar({
  pickupTime,
  cart,
  subtotalCents,
  totalItems,
  onAdd,
  onRemove,
}: {
  pickupTime: string;
  cart: CartLine[];
  subtotalCents: number;
  totalItems: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
}) {
  return (
    <aside className="lg:sticky lg:top-28 h-fit">
      <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-black/10">
          <div className="text-sm text-black/50 font-medium">Pick up at</div>
          <div className="text-2xl font-semibold tracking-tight mt-1">
            {pickupTime}
          </div>
        </div>

        <div className="p-4">
          {cart.length === 0 ? (
            <div className="text-sm text-black/50 py-8 text-center">
              Your order is empty
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((l) => (
                <div
                  key={l.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {l.item.name}
                    </div>
                    <div className="text-xs text-black/50">
                      {moneyFromCents(l.item.priceCents)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemove(l.item.id)}
                      className="h-7 w-7 rounded-full border border-black/15 hover:border-black/30"
                      aria-label="Decrease"
                    >
                      −
                    </button>

                    <div className="w-6 text-center text-sm font-semibold">
                      {l.qty}
                    </div>

                    <button
                      onClick={() => onAdd(l.item)}
                      className="h-7 w-7 rounded-full border border-black/15 hover:border-black/30"
                      aria-label="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-black/10 pt-4 flex items-center justify-between">
            <div className="text-sm font-semibold text-black/60">TOTAL</div>
            <div className="text-sm font-semibold">
              {moneyFromCents(subtotalCents)}
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            className={[
              "mt-4 w-full h-11 rounded-full font-semibold text-sm transition flex items-center justify-center gap-2",
              cart.length === 0
                ? "bg-black/10 text-black/40 cursor-not-allowed"
                : "bg-[#6d3a30] text-white hover:bg-[#9b3d2e]",
            ].join(" ")}
          >
            <span className="text-xs opacity-90">{totalItems} items</span>
            <span className="opacity-70">•</span>
            <span className="text-xs opacity-90">
              {moneyFromCents(subtotalCents)}
            </span>
            <span className="opacity-70">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
