"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { MenuItem } from "./OnlineOrderPage";
import { money } from "./OnlineOrderPage";

export type ProteinId = "chashu" | "karaage";
export type NoodleId = "thin" | "regular";

export type Topping = {
  id: string;
  name: string;
  price: number;
  img: string;
};

export type ItemConfig = {
  protein: ProteinId | null;
  noodle: NoodleId | null;
  toppings: string[]; // topping ids
  note?: string;
};

export const PROTEINS: {
  id: ProteinId;
  name: string;
  desc: string;
  img: string;
}[] = [
  {
    id: "chashu",
    name: "Chashu",
    desc: "(Pork Slice)",
    img: "/toppings/chashu.png",
  },
  {
    id: "karaage",
    name: "Karaage",
    desc: "(Deep Fried Chicken)",
    img: "/toppings/karaage.png",
  },
];

export const NOODLES: { id: NoodleId; name: string; img: string }[] = [
  { id: "thin", name: "Thin Noodle", img: "/toppings/thinnoodle.png" },
  {
    id: "regular",
    name: "Regular Noodle",
    img: "/toppings/noodle.png",
  },
];

export const TOPPINGS: Topping[] = [
  { id: "chashu", name: "Chashu", price: 4, img: "/toppings/chashu.png" },
  { id: "karaage", name: "Karaage", price: 4, img: "/toppings/karaage.png" },
  { id: "egg", name: "Egg", price: 3, img: "/toppings/egg.png" },
  {
    id: "beansprout",
    name: "Beansprout",
    price: 3,
    img: "/toppings/beansprout.png",
  },
  {
    id: "greenonion",
    name: "Greenonion",
    price: 3,
    img: "/toppings/greenonion.png",
  },
  { id: "broccoli", name: "Broccoli", price: 3, img: "/toppings/broccoli.png" },
  { id: "corn", name: "Corn", price: 3, img: "/toppings/corn.png" },
  { id: "fishcake", name: "Fishcake", price: 3, img: "/toppings/fishcake.png" },
  { id: "mushroom", name: "Mushroom", price: 3, img: "/toppings/mushroom.png" },
  { id: "seaweed", name: "Seaweed", price: 3, img: "/toppings/seaweed.png" },
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
  // ESC close only (no setState in effect)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  // key remount resets all inner state naturally (no reset effect)
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
  const [qty, setQty] = useState(1);
  const [protein, setProtein] = useState<ProteinId | null>(null);
  const [noodle, setNoodle] = useState<NoodleId | null>(null);
  const [toppings, setToppings] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const toppingTotal = useMemo(() => {
    const map = new Map(TOPPINGS.map((t) => [t.id, t.price]));
    return toppings.reduce((sum, id) => sum + (map.get(id) ?? 0), 0);
  }, [toppings]);

  const unitPrice = item.price + toppingTotal;
  const totalPrice = unitPrice * qty;

  const canAdd = protein !== null && noodle !== null;

  function toggleTopping(id: string) {
    setToppings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-[420px] h-[88vh] overflow-hidden rounded-2xl bg-white shadow-2xl ">
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
            <div className="pt-7 pb-2 flex justify-center">
              <div className="relative h-80 w-80 bg-white overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-3"
                  />
                ) : null}
              </div>
            </div>

            <div className="px-6 text-center">
              <h2 className="text-lg font-semibold text-tenton-brown">
                {item.name}
              </h2>
              <p className="mt-1 text-xs text-black/50">
                Our classic pork broth. Simple and satisfying
              </p>
            </div>

            {/* STEP 01 */}
            <div className="mt-5 px-6">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-black/60">
                <span>STEP 01. Choose Your Protein</span>
                <span className="text-[10px] font-semibold text-tenton-red">
                  Required
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                {PROTEINS.map((p) => {
                  const active = protein === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setProtein(p.id)}
                      className={[
                        "p-3 text-center transition",
                        // add check icon
                        // active
                        //   ? "border-tenton-brown shadow-sm"
                        //   : "border-black/10 hover:border-black/20",
                      ].join(" ")}
                    >
                      <div className="mx-auto relative h-14 w-14">
                        <Image
                          src={p.img}
                          alt={p.name}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span
                          className={[
                            "h-4 w-4 rounded-full border flex items-center justify-center text-[10px]",
                            active
                              ? "border-tenton-brown bg-tenton-brown text-white"
                              : "border-black/20 bg-white text-transparent",
                          ].join(" ")}
                        >
                          ✓
                        </span>
                        <div className="text-xs font-semibold">{p.name}</div>
                      </div>

                      <div className="text-[10px] text-black/45 mt-0.5">
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 02 */}
            <div className="mt-6 px-6">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-black/60">
                <span>STEP 02. Choose Your Noodle</span>
                <span className="text-[10px] font-semibold text-tenton-red">
                  Required
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                {NOODLES.map((n) => {
                  const active = noodle === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setNoodle(n.id)}
                      className={[
                        "p-3 text-center transition",
                        // active
                        //   ? "border-tenton-brown shadow-sm"
                        //   : "border-black/10 hover:border-black/20",
                      ].join(" ")}
                    >
                      <div className="mx-auto relative h-14 w-14">
                        <Image
                          src={n.img}
                          alt={n.name}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span
                          className={[
                            "h-4 w-4 rounded-full border flex items-center justify-center text-[10px]",
                            active
                              ? "border-tenton-brown bg-tenton-brown text-white"
                              : "border-black/20 bg-white text-transparent",
                          ].join(" ")}
                        >
                          ✓
                        </span>
                        <div className="text-xs font-semibold">{n.name}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 03 */}
            <div className="mt-7 px-6 pb-6">
              <div className="text-center text-[11px] font-semibold text-black/60">
                STEP 03. Extra Ramen Topping
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {TOPPINGS.map((t) => {
                  const active = toppings.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      className="text-center"
                    >
                      <div
                        className={[
                          "mx-auto relative h-16 w-16 rounded-full bg-white border shadow-sm overflow-hidden transition",
                          active
                            ? "border-tenton-brown"
                            : "border-black/10 hover:border-black/20",
                        ].join(" ")}
                      >
                        <Image
                          src={t.img}
                          alt={t.name}
                          fill
                          className="object-contain p-2"
                        />
                        {active ? (
                          <div className="absolute left-1 top-1 h-5 w-5 rounded-full bg-tenton-brown text-white text-[11px] flex items-center justify-center">
                            ✓
                          </div>
                        ) : null}
                      </div>

                      <div className="mt-2 text-[11px] font-semibold text-black/70">
                        {t.name}
                      </div>
                      <div className="text-[11px] text-black/40">
                        {money(t.price)}
                      </div>
                    </button>
                  );
                })}
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add note (optional)"
                className="mt-5 w-full rounded-xl border border-black/10 bg-[#fbfaf8] px-3 py-2 text-sm outline-none focus:border-tenton-brown"
                rows={3}
              />
            </div>
          </div>

          {/* Bottom bar */}
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

              <button
                disabled={!canAdd}
                onClick={() =>
                  onAdd(item, qty, {
                    protein,
                    noodle,
                    toppings,
                    note: note || undefined,
                  })
                }
                className={[
                  "flex-1 h-10 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition",
                  canAdd
                    ? "bg-tenton-brown text-white hover:bg-tenton-red"
                    : "bg-black/10 text-black/40 cursor-not-allowed",
                ].join(" ")}
              >
                <span className="opacity-95">Add to order</span>
                <span className="opacity-90">{money(totalPrice)}</span>
              </button>
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
