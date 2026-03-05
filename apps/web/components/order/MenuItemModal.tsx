"use client";

import Button from "@/components/ui/CtaButton";
import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { ID, MenuItem } from "@/types/menu";
import type { RamenSelection } from "@/types/ramen";
import { moneyFromCents } from "./helpers";

export type ItemConfig = RamenSelection;

type UiOption = {
  id: ID;
  name: string;
  desc?: string;
  priceDeltaCents: number;
  imageUrl: string;
};

export const PROTEINS: UiOption[] = [
  {
    id: "protein_chashu",
    name: "Chashu",
    desc: "(Pork Slice)",
    priceDeltaCents: 0,
    imageUrl: "/toppings/chashu.png",
  },
  {
    id: "protein_karaage",
    name: "Karaage",
    desc: "(Deep Fried Chicken)",
    priceDeltaCents: 0,
    imageUrl: "/toppings/karaage.png",
  },
];

export const NOODLES: UiOption[] = [
  {
    id: "noodle_thin",
    name: "Thin Noodle",
    priceDeltaCents: 0,
    imageUrl: "/toppings/thinnoodle.png",
  },
  {
    id: "noodle_regular",
    name: "Regular Noodle",
    priceDeltaCents: 0,
    imageUrl: "/toppings/noodle.png",
  },
];

export const TOPPINGS: UiOption[] = [
  {
    id: "top_chashu",
    name: "Chashu",
    priceDeltaCents: 400,
    imageUrl: "/toppings/chashu.png",
  },
  {
    id: "top_karaage",
    name: "Karaage",
    priceDeltaCents: 400,
    imageUrl: "/toppings/karaage.png",
  },
  {
    id: "top_egg",
    name: "Egg",
    priceDeltaCents: 300,
    imageUrl: "/toppings/egg.png",
  },
  {
    id: "top_beansprout",
    name: "Beansprout",
    priceDeltaCents: 300,
    imageUrl: "/toppings/beansprout.png",
  },
  {
    id: "top_greenonion",
    name: "Greenonion",
    priceDeltaCents: 300,
    imageUrl: "/toppings/greenonion.png",
  },
  {
    id: "top_broccoli",
    name: "Broccoli",
    priceDeltaCents: 300,
    imageUrl: "/toppings/broccoli.png",
  },
  {
    id: "top_corn",
    name: "Corn",
    priceDeltaCents: 300,
    imageUrl: "/toppings/corn.png",
  },
  {
    id: "top_fishcake",
    name: "Fishcake",
    priceDeltaCents: 300,
    imageUrl: "/toppings/fishcake.png",
  },
  {
    id: "top_mushroom",
    name: "Mushroom",
    priceDeltaCents: 300,
    imageUrl: "/toppings/mushroom.png",
  },
  {
    id: "top_seaweed",
    name: "Seaweed",
    priceDeltaCents: 300,
    imageUrl: "/toppings/seaweed.png",
  },
];

export default function MenuItemModal({
  open,
  item,
  onClose,
  onAdd,
}: {
  open: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, qty: number, config: ItemConfig) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <MenuItemModalInner
      key={item.id}
      item={item}
      onClose={onClose}
      onAdd={onAdd}
    />
  );
}

function MenuItemModalInner({
  item,
  onClose,
  onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (item: MenuItem, qty: number, config: ItemConfig) => void;
}) {
  const isRamen = item.kind === "ramen" || item.categoryId === "ramen";
  const panelH = isRamen ? "h-[88vh]" : "h-[70vh]";

  const [qty, setQty] = useState(1);

  const [proteinOptionId, setProteinOptionId] = useState<ID | null>(null);
  const [noodleOptionId, setNoodleOptionId] = useState<ID | null>(null);

  const [toppingIds, setToppingIds] = useState<ID[]>([]);
  const [note, setNote] = useState("");

  const toppingExtraCents = useMemo(() => {
    const map = new Map(TOPPINGS.map((t) => [t.id, t.priceDeltaCents]));
    return toppingIds.reduce((sum, id) => sum + (map.get(id) ?? 0), 0);
  }, [toppingIds]);

  const unitPriceCents = item.priceCents + toppingExtraCents;
  const totalPriceCents = unitPriceCents * qty;

  const canAdd = isRamen
    ? proteinOptionId !== null && noodleOptionId !== null
    : true;

  function toggleTopping(id: ID) {
    setToppingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function buildConfig(): ItemConfig {
    return {
      proteinOptionId: (proteinOptionId ?? "") as ID,
      noodleOptionId: (noodleOptionId ?? "") as ID,
      toppings: toppingIds.map((id) => ({ optionId: id, qty: 1 })),
      note: note || undefined,
    };
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div
          className={`relative w-full max-w-[420px] ${panelH} overflow-hidden rounded-2xl bg-white shadow-2xl`}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full text-bold text-white bg-tenton-brown border border-tenton-brown shadow flex items-center justify-center cursor-pointer hover:bg-white hover:text-tenton-brown"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Scroll */}
          <div className="h-full overflow-y-auto pb-28">
            {/* Image */}
            <div className="flex justify-center mt-5 mb-3">
              <div className="relative w-60 h-44 overflow-hidden">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : null}
              </div>
            </div>

            <div className="px-6 text-center">
              <h2 className="text-lg font-semibold text-tenton-red">
                {item.name}
              </h2>
              {item.description ? (
                <p className="mt-1 text-[14px] text-black">
                  {item.description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-8 mt-8">
              {isRamen ? (
                <>
                  {/* STEP 01 */}
                  <div className="px-6">
                    <div className="flex items-center justify-center gap-2 text-[14px] font-semibold text-black/60">
                      <span>STEP 01. Choose Your Protein</span>
                      <span className="text-[9px] text-white bg-tenton-brown px-2 py-0.5 rounded-2xl">
                        Required
                      </span>
                    </div>

                    <div className="grid grid-cols-2">
                      {PROTEINS.map((p) => {
                        const active = proteinOptionId === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setProteinOptionId(p.id)}
                            className={["text-center transition"].join(" ")}
                          >
                            <div className="mx-auto relative h-30 w-30 hover:scale-120">
                              <Image
                                src={p.imageUrl}
                                alt={p.name}
                                fill
                                className="object-contain cursor-pointer"
                              />
                            </div>

                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={[
                                  "h-4 w-4 rounded-full border flex items-center justify-center text-[10px] cursor-pointer",
                                  active
                                    ? "border-tenton-brown bg-tenton-brown text-white"
                                    : "border-black/20 bg-white text-transparent",
                                ].join(" ")}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </span>
                              <div className="text-xs font-semibold cursor-pointer">
                                {p.name}
                              </div>
                            </div>

                            {p.desc ? (
                              <div className="text-[10px] text-black/45 mt-0.5">
                                {p.desc}
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 02 */}
                  <div className="px-6">
                    <div className="flex items-center justify-center gap-2 text-[14px] font-semibold text-black/60">
                      <span>STEP 02. Choose Your Noodle</span>
                      <span className="text-[9px] text-white bg-tenton-brown px-2 py-0.5 rounded-2xl">
                        Required
                      </span>
                    </div>

                    <div className="grid grid-cols-2">
                      {NOODLES.map((n) => {
                        const active = noodleOptionId === n.id;
                        return (
                          <button
                            key={n.id}
                            onClick={() => setNoodleOptionId(n.id)}
                            className={["text-center transition"].join(" ")}
                          >
                            <div className="mx-auto relative h-30 w-30 hover:scale-120">
                              <Image
                                src={n.imageUrl}
                                alt={n.name}
                                fill
                                className="object-contain cursor-pointer"
                              />
                            </div>

                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={[
                                  "h-4 w-4 rounded-full border flex items-center justify-center text-[10px] cursor-pointer",
                                  active
                                    ? "border-tenton-brown bg-tenton-brown text-white"
                                    : "border-black/20 bg-white text-transparent",
                                ].join(" ")}
                              >
                                <Check className="h-3 w-3 stroke-[3]" />
                              </span>
                              <div className="text-xs font-semibold cursor-pointer">
                                {n.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 03 */}
                  <div className="px-6 pb-6">
                    <div className="text-center text-[14px] font-semibold text-black/60">
                      STEP 03. Extra Ramen Topping
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {TOPPINGS.map((t) => {
                        const active = toppingIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleTopping(t.id)}
                            className="text-center"
                          >
                            <div className="mx-auto relative h-20 w-20 overflow-hidden transition hover:scale-120 cursor-pointer">
                              <Image
                                src={t.imageUrl}
                                alt={t.name}
                                fill
                                className="object-contain"
                              />
                              {active ? (
                                <div className="absolute left-3 top-3 h-5 w-5 rounded-full bg-tenton-brown text-white text-[11px] flex items-center justify-center">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </div>
                              ) : null}
                            </div>

                            <div className="text-[11px] font-semibold text-black/70">
                              {t.name}
                            </div>
                            <div className="text-[11px] text-black/40">
                              {moneyFromCents(t.priceDeltaCents)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : null}

              <div className="px-6 pb-6">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note (optional)"
                  className="w-full rounded-xl border border-black/10 bg-[#fbfaf8] px-3 py-2 text-sm outline-none focus:border-tenton-brown"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/10">
            <div className="px-5 py-4 flex items-center gap-3">
              <div className="flex items-center rounded-full bg-[#f4f1ea] border border-black/10 overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="h-10 w-10 flex items-center justify-center text-lg text-black/70 hover:bg-black/5"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <div className="w-10 text-center font-semibold text-sm">
                  {qty}
                </div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="h-10 w-10 flex items-center justify-center text-lg text-black/70 hover:bg-black/5"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <Button
                disabled={!canAdd}
                onClick={() => onAdd(item, qty, buildConfig())}
                size="sm"
                variant={canAdd ? "primary" : "ghost"}
                className="flex-1 h-10"
              >
                <span className="opacity-95">Add to order</span>
                <span className="opacity-90">
                  {moneyFromCents(totalPriceCents)}
                </span>
              </Button>
            </div>

            {!canAdd ? (
              <div className="px-6 pb-4 -mt-2 text-[11px] text-tenton-red text-center">
                Please select Protein and Noodle
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
