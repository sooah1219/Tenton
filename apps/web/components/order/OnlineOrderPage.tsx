"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CategoryIcons } from "./categoryIcons";
import MenuItemModal, {
  type ItemConfig,
  NOODLES,
  PROTEINS,
  TOPPINGS,
} from "./MenuItemModal";
import OrderFilters, { type PickupDayValue } from "./OrderFilters";
import TopBar from "./topBar";

export type Category = { id: string; name: string; icon: string };
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  image?: string; //
  categoryId: string;
};

export type CartLine = {
  key: string; //
  item: MenuItem;
  qty: number;
  config: ItemConfig;
};

export function money(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

const CART_KEY = "tenton_cart_v1";

const CATEGORIES: Category[] = [
  { id: "ramen", name: "Ramen", icon: "/icons/ramen.svg" },
  { id: "katsu", name: "Katsu", icon: "/icons/tonkatsu.svg" },
  { id: "udon", name: "Udon", icon: "/icons/udon.svg" },
  { id: "don", name: "Rice Bowl", icon: "/icons/rice.svg" },
  { id: "appetizer", name: "Appetizer", icon: "/icons/gyoza.svg" },
  { id: "salad", name: "Salad", icon: "/icons/salad.svg" },
  { id: "dessert", name: "Dessert", icon: "/icons/dessert.svg" },
];

const ITEMS: MenuItem[] = [
  // Ramen
  {
    id: "r1",
    name: "Original Ramen",
    price: 17.5,
    categoryId: "ramen",
    image: "/ramen/original.png",
  },
  {
    id: "r2",
    name: "Miso Ramen",
    price: 18.5,
    categoryId: "ramen",
    image: "/ramen/miso.png",
  },
  {
    id: "r3",
    name: "Spicy Miso Ramen",
    price: 19.5,
    categoryId: "ramen",
    image: "/ramen/spicymiso.png",
  },
  {
    id: "r4",
    name: "Black Ramen",
    price: 19.5,
    categoryId: "ramen",
    image: "/ramen/black.png",
  },
  {
    id: "r5",
    name: "Vegetable Ramen",
    price: 20.0,
    categoryId: "ramen",
    image: "/ramen/vegetable.png",
  },

  // Katsu combo
  {
    id: "c1",
    name: "Pork Combo",
    price: 7.0,
    categoryId: "combo",
    image: "/porkCombo.png",
  },
  {
    id: "c2",
    name: "Cheese Combo",
    price: 7.0,
    categoryId: "combo",
    image: "/cheeseCombo.png",
  },
  {
    id: "c3",
    name: "Chicken Combo",
    price: 7.0,
    categoryId: "combo",
    image: "/chickenCombo.png",
  },
  // Katsu
  {
    id: "t1",
    name: "Tonkatsu",
    price: 24.5,
    categoryId: "katsu",
    image: "/katsu/trio.png",
  },
  {
    id: "t2",
    name: "Cheese Katsu",
    price: 24.0,
    categoryId: "katsu",
    image: "/katsu/cheesekatsu.png",
  },
  {
    id: "t3",
    name: "Katsu Trio Set",
    price: 24.0,
    categoryId: "katsu",
    image: "/katsu/trio.png",
  },
  {
    id: "t4",
    name: "Curry Katsu",
    price: 24.0,
    categoryId: "katsu",
    image: "/katsu/currykatsu.png",
  },
  {
    id: "t5",
    name: "Chicken Katsu",
    price: 24.5,
    categoryId: "katsu",
    image: "/katsu/trio.png",
  },
  {
    id: "t6",
    name: "Ebi Katsu",
    price: 24.5,
    categoryId: "katsu",
    image: "/katsu/ebikatsu.png",
  },
  {
    id: "t7",
    name: "Fish Katsu",
    price: 24.5,
    categoryId: "katsu",
    image: "/katsu/fishkatsu.png",
  },
  {
    id: "t8",
    name: "Tofu Katsu",
    price: 24.5,
    categoryId: "katsu",
    image: "/katsu/tofukatsu.png",
  },
  {
    id: "t9",
    name: "Hamburg Steak",
    price: 29.5,
    categoryId: "katsu",
    image: "/katsu/hamburg.png",
  },
  {
    id: "t10",
    name: "Beef Short Ribs",
    price: 29.5,
    categoryId: "katsu",
    image: "/katsu/beefshortrib.png",
  },
];
function configKey(itemId: string, cfg: ItemConfig) {
  return `${itemId}|${JSON.stringify(cfg)}`;
}

function optionNameById(id: string, list: { id: string; name: string }[]) {
  return list.find((x) => x.id === id)?.name ?? "";
}

function toppingsSummary(ids: string[]) {
  const nameMap = new Map(TOPPINGS.map((t) => [t.id, t.name]));
  return ids.map((id) => nameMap.get(id) ?? "").filter(Boolean);
}

function lineExtraPrice(cfg: ItemConfig) {
  const priceMap = new Map(TOPPINGS.map((t) => [t.id, t.price]));
  return (cfg.toppings ?? []).reduce(
    (sum, id) => sum + (priceMap.get(id) ?? 0),
    0
  );
}

function lineSummary(cfg: ItemConfig) {
  const protein = cfg.protein ? optionNameById(cfg.protein, PROTEINS) : "";
  const noodle = cfg.noodle ? optionNameById(cfg.noodle, NOODLES) : "";
  const tops = toppingsSummary(cfg.toppings ?? []);
  return [protein, noodle, ...tops].filter(Boolean).join(" · ");
}

export default function OnlineOrderPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("ramen");
  const [pickupDay, setPickupDay] = useState<PickupDayValue>("Today");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      setCart(raw ? (JSON.parse(raw) as CartLine[]) : []);
    } catch {
      setCart([]);
    } finally {
      setCartHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, cartHydrated]);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter((it) => {
      const okCat = it.categoryId === activeCat;
      const okQ = !q || it.name.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [activeCat, query]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, l) => {
      const unit = l.item.price + lineExtraPrice(l.config);
      return sum + unit * l.qty;
    }, 0);
  }, [cart]);

  const totalItems = useMemo(() => cart.reduce((n, l) => n + l.qty, 0), [cart]);

  function openModal(item: MenuItem) {
    setSelectedItem(item);
    setModalOpen(true);
  }

  function addFromModal(item: MenuItem, qty: number, cfg: ItemConfig) {
    const key = configKey(item.id, cfg);

    setCart((prev) => {
      const idx = prev.findIndex((l) => l.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { key, item, qty, config: cfg }];
    });

    setModalOpen(false);
    setSelectedItem(null);
  }

  function decLine(key: string) {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.key === key);
      if (idx < 0) return prev;
      const line = prev[idx];
      if (line.qty <= 1) return prev.filter((l) => l.key !== key);
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty - 1 };
      return next;
    });
  }

  function incLine(key: string) {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.key === key);
      if (idx < 0) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-tenton-bg">
      <TopBar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="font-averia-serif text-center text-3xl lg:text-5xl lg:pt-5 text-tenton-brown">
          Online Order
        </h1>

        <section>
          <CategoryIcons
            activeCat={activeCat}
            setActiveCat={setActiveCat}
            CATEGORIES={CATEGORIES}
          />

          <div className="grid grid-cols-1 gap-3">
            <OrderFilters
              query={query}
              onQueryChange={setQuery}
              pickupDay={pickupDay}
              onPickupDayChange={setPickupDay}
              pickupTime={pickupTime}
              onPickupTimeChange={setPickupTime}
            />
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((it) => (
                <article
                  key={it.id}
                  onClick={() => openModal(it)}
                  className="
                    rounded-2xl bg-white shadow-lg overflow-hidden py-4 flex flex-col cursor-pointer transition-all duration-300
                    hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-tenton-brown
                  "
                >
                  <div className="aspect-[4/3] flex items-center justify-center">
                    {it.image ? (
                      <Image
                        src={it.image}
                        alt={it.name}
                        width={400}
                        height={300}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-black/30 text-sm">image</span>
                    )}
                  </div>

                  <div className="p-4 text-center">
                    <div className="font-semibold text-md">{it.name}</div>
                    <div className="text-tenton-red text-md mt-1">
                      {money(it.price)}
                    </div>
                  </div>

                  <div className="px-4 mt-auto flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(it);
                      }}
                      className="h-8 w-8 rounded-full bg-tenton-brown text-white cursor-pointer hover:bg-tenton-red transition flex items-center justify-center"
                      aria-label={`Configure ${it.name}`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 h-fit">
            <div className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-black/10">
                <div className="text-sm text-black/50 font-medium">
                  Pick up at
                </div>
                <div className="text-2xl font-semibold tracking-tight mt-1">
                  {pickupTime || "—"}
                </div>
              </div>

              <div className="p-4">
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
                      const unit = l.item.price + lineExtraPrice(l.config);

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
                              <div className="text-[11px] text-black/45 truncate mt-0.5">
                                {summary}
                              </div>
                            ) : null}

                            <div className="text-xs text-black/50 mt-0.5">
                              {money(unit)}
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

                <div className="mt-6 border-t border-black/10 pt-4 flex items-center justify-between">
                  <div className="text-sm font-semibold text-black/60">
                    TOTAL
                  </div>
                  <div className="text-sm font-semibold">{money(subtotal)}</div>
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
                  <span className="text-xs opacity-90">{money(subtotal)}</span>
                  <span className="opacity-70">→</span>
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <MenuItemModal
        open={modalOpen}
        item={selectedItem}
        onClose={() => {
          setModalOpen(false);
          setSelectedItem(null);
        }}
        onAdd={addFromModal}
      />
    </div>
  );
}
