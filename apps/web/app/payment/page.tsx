"use client";

import type { CartLine } from "@/components/order/OnlineOrderPage";
import OrderSummaryCard from "@/components/order/OrderSummaryCard";
import PaymentForm from "@/components/order/PaymentForm";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  buildPickupAtIso,
  type PickupDayValue,
} from "@/components/order/pickupAt";
import type { CreateOrderRequestDTO } from "@/types/order";

const CART_KEY = "tenton_cart_v1";
const PICKUP_KEY = "tenton_pickup_v1";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5247";

export default function PaymentPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [payMethod, setPayMethod] = useState<"store" | "card">("store");

  // pickupAt (computed from stored pickupDay + pickupTime)
  const [pickupAt, setPickupAt] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  // hydrate cart + pickup selection
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      setCart(raw ? (JSON.parse(raw) as CartLine[]) : []);

      const pickRaw = localStorage.getItem(PICKUP_KEY);
      if (pickRaw) {
        const parsed = JSON.parse(pickRaw) as {
          pickupDay?: PickupDayValue;
          pickupTime?: string;
        };

        const day = parsed.pickupDay;
        const time = (parsed.pickupTime ?? "").trim();

        if (day && time) {
          setPickupAt(buildPickupAtIso(day, time));
        }
      }
    } catch {
      setCart([]);
      setPickupAt("");
    } finally {
      setHydrated(true);
    }
  }, []);

  const disabled = useMemo(() => {
    return !hydrated || submitting || cart.length === 0;
  }, [hydrated, submitting, cart.length]);

  function isRamenLine(line: CartLine) {
    // ramen is identified by category; required options validated server-side too
    return line.item?.categoryId === "ramen";
  }

  async function onPlaceOrder() {
    if (disabled) return;

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phone.trim() ||
      !email.trim()
    ) {
      alert("Please fill out customer info.");
      return;
    }

    if (!pickupAt) {
      alert("Please select a pickup time.");
      return;
    }

    const payload: CreateOrderRequestDTO = {
      payMethod,
      pickupAt,
      customer: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        note: note.trim() ? note.trim() : null,
      },
      items: cart.map((line) => {
        const base = {
          menuItemId: line.item.id,
          qty: line.qty,
          note: line.config?.note?.trim() ? line.config.note.trim() : undefined,
        };

        if (isRamenLine(line)) {
          const proteinId = (line.config?.proteinOptionId ?? "").trim();
          const noodleId = (line.config?.noodleOptionId ?? "").trim();

          return {
            ...base,
            ramen: {
              proteinOptionId: proteinId,
              noodleOptionId: noodleId,
              toppings: (line.config?.toppings ?? [])
                .map((t) => ({
                  optionId: (t.optionId ?? "").trim(),
                  qty: t.qty,
                }))
                .filter((t) => t.optionId && t.qty > 0),
              note: line.config?.note?.trim()
                ? line.config.note.trim()
                : undefined,
            },
          };
        }

        return base;
      }),
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        alert(text || "Failed to place order.");
        return;
      }

      const data = (await res.json()) as { orderId: string };

      // cleanup
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(PICKUP_KEY);

      router.push(`/order/confirmed/${data.orderId}`);
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-tenton-bg">
      <main className="mx-auto max-w-6xl p-4">
        <div className="relative flex items-center h-12 gap-2 md:my-8">
          <button
            onClick={() => router.back()}
            className="group h-8 w-8 rounded-full border border-black/10 bg-white flex items-center justify-center hover:bg-tenton-brown cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft
              size={20}
              className="text-tenton-brown group-hover:text-white"
            />
          </button>

          <span className="hidden sm:inline text-sm text-tenton-brown">
            Back to Order
          </span>

          <h1 className="absolute left-1/2 -translate-x-1/2 font-averia-serif text-3xl lg:text-5xl text-tenton-brown">
            Payment
          </h1>
        </div>

        {!hydrated ? (
          <div className="mt-6 text-center text-sm text-black/60">Loading…</div>
        ) : cart.length === 0 ? (
          <div className="mt-6 rounded-xl border border-black/10 bg-white p-5 text-sm text-black/70">
            Your cart is empty.
          </div>
        ) : (
          <section className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            <PaymentForm
              firstName={firstName}
              lastName={lastName}
              phone={phone}
              email={email}
              note={note}
              payMethod={payMethod}
              setFirstName={setFirstName}
              setLastName={setLastName}
              setPhone={setPhone}
              setEmail={setEmail}
              setNote={setNote}
              setPayMethod={setPayMethod}
              onPlaceOrder={onPlaceOrder}
              disabled={disabled}
            />

            <aside className="hidden md:block lg:sticky lg:top-10 h-fit">
              <OrderSummaryCard cart={cart} hydrated={hydrated} />
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}
