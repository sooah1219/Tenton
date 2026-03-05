"use client";

import CartIcon from "@/components/icons/Cart.svg";
import { useEffect, useMemo, useRef, useState } from "react";

import CartSummary from "./CartSummary";
import { CategoryIcons } from "./CategoryIcons";
import MenuGrid from "./MenuGrid";
import MenuItemModal, { type ItemConfig } from "./MenuItemModal";
import OrderFilters, { type PickupDayValue } from "./OrderFilters";

import { configKey, lineExtraPriceCents } from "./helpers";

import { getCategories, getMenuItems } from "@/lib/api/menu";
import type { Category, MenuItem } from "@/types/menu";

export type CartLine = {
  key: string;
  item: MenuItem;
  qty: number;
  config: ItemConfig;
};

const PICKUP_KEY = "tenton_pickup_v1";
const CART_KEY = "tenton_cart_v1";

export default function OnlineOrderPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("ramen");

  const [pickupDay, setPickupDay] = useState<PickupDayValue>("Today");
  const [pickupTime, setPickupTime] = useState<string>("");

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  const [cartInView, setCartInView] = useState(false);
  const cartRef = useRef<HTMLElement | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      setCart(raw ? (JSON.parse(raw) as CartLine[]) : []);
    } catch {
      setCart([]);
    }

    try {
      const pickRaw = localStorage.getItem(PICKUP_KEY);
      if (pickRaw) {
        const parsed = JSON.parse(pickRaw) as {
          pickupDay?: PickupDayValue;
          pickupTime?: string;
        };

        if (parsed.pickupDay) setPickupDay(parsed.pickupDay);
        if (typeof parsed.pickupTime === "string")
          setPickupTime(parsed.pickupTime);
      }
    } catch {
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

  useEffect(() => {
    if (!cartHydrated) return;
    if (!pickupTime) return;
    try {
      localStorage.setItem(
        PICKUP_KEY,
        JSON.stringify({ pickupDay, pickupTime })
      );
    } catch {}
  }, [pickupDay, pickupTime, cartHydrated]);

  useEffect(() => {
    const el = cartRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => setCartInView(entry.isIntersecting),
      { threshold: 0.25 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoadingMenu(true);
      setMenuError(null);
      try {
        const [cats, its] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);
        if (!alive) return;

        const sortedCats = [...cats].sort((a, b) => a.sortOrder - b.sortOrder);
        const sortedItems = [...its].sort((a, b) => a.sortOrder - b.sortOrder);

        setCategories(sortedCats);
        setItems(sortedItems);

        if (
          sortedCats.length > 0 &&
          !sortedCats.find((c) => c.id === activeCat)
        ) {
          setActiveCat(sortedCats[0].id);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Failed to load menu.";
        setMenuError(message);
      } finally {
        if (!alive) return;
        setLoadingMenu(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (it.categoryId === "combo") return false;
      const okCat = it.categoryId === activeCat;
      const okQ = !q || it.name.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [items, activeCat, query]);

  const comboItems = useMemo(() => {
    return items.filter((it) => it.categoryId === "combo");
  }, [items]);

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

  function pickupDayLabel(day: PickupDayValue) {
    if (day === "Today") return "Today";
    if (day === "Tomorrow") return "Tomorrow";

    const n = Number(day.replace("+", "").replace("d", ""));
    const d = new Date();
    d.setDate(d.getDate() + n);

    return d.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

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

  function scrollToCart() {
    cartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-tenton-bg">
      <main className="mx-auto max-w-6xl p-4">
        <h1 className="font-averia-serif text-center text-3xl lg:text-5xl lg:pt-5 text-tenton-brown">
          Online Order
        </h1>

        {loadingMenu ? (
          <div className="mt-6 text-center text-sm text-black/60">
            Loading menu…
          </div>
        ) : menuError ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {menuError}
          </div>
        ) : (
          <>
            <section>
              <CategoryIcons
                activeCat={activeCat}
                setActiveCat={setActiveCat}
                CATEGORIES={categories}
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
                <MenuGrid
                  items={filtered}
                  onOpen={openModal}
                  showComboSection={activeCat === "ramen"}
                  comboItems={comboItems}
                />
              </div>

              <CartSummary
                cartRef={cartRef}
                cartHydrated={cartHydrated}
                cart={cart}
                pickupDay={pickupDay}
                pickupTime={pickupTime}
                pickupDayLabel={pickupDayLabel}
                decLine={decLine}
                incLine={incLine}
              />
            </section>
          </>
        )}
      </main>

      {cartHydrated && cart.length > 0 && !cartInView && (
        <div className="fixed bottom-4 md:bottom-8 inset-x-0 z-50 flex justify-center lg:hidden">
          <button
            onClick={scrollToCart}
            className="w-[200px] h-12 rounded-full border border-tenton-brown bg-tenton-brown text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition hover:bg-white hover:text-tenton-brown"
          >
            <CartIcon className="h-[18px] w-[18px]" />
            <span className="font-semibold">View cart</span>
            <span className="opacity-80">•</span>
            <span className="text-sm">{totalItems}</span>
          </button>
        </div>
      )}

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
