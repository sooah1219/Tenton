"use client";

import type { OrderDTO } from "@/types/order";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

function moneyFromCents(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format((cents ?? 0) / 100);
}

function formatPickupTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConfirmedPageClient({ order }: { order: OrderDTO }) {
  const storeAddress = "1731 Marine Drive, West Vancouver, Canada V7V1J6";
  const phone = "6041234567";

  const googleMapsUrl = useMemo(() => {
    const q = encodeURIComponent(storeAddress);
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [storeAddress]);

  const customerName = useMemo(() => {
    const first = order.customer?.firstName ?? "";
    const last = order.customer?.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || "-";
  }, [order]);

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      <div className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white border border-black/10 shadow-sm">
            <div className="px-6 pt-6 pb-4 text-center border-b border-black/10">
              <div className="inline-flex items-center gap-2 text-tenton-red font-semibold text-[26px]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-tenton-red">
                  <Check size={14} className="text-white stroke-[3]" />
                </span>
                <span>Your Order is Confirmed</span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between sm:block">
                  <div className="text-black/50">Customer</div>
                  <div className="font-medium text-black/80">
                    {customerName}
                  </div>
                </div>

                <div className="flex justify-between sm:block">
                  <div className="text-black/50">Order Number</div>
                  <div className="font-medium text-black/80">
                    #{order.id.slice(0, 8)}
                  </div>
                </div>

                <div className="flex justify-between sm:block">
                  <div className="text-black/50">Pick up Time</div>
                  <div className="font-medium text-black/80">
                    {formatPickupTime(order.pickupAt)}
                  </div>
                </div>

                <div className="flex justify-between sm:block">
                  <div className="text-black/50">Subtotal</div>
                  <div className="font-medium text-black/80">
                    {moneyFromCents(order.subtotalCents)}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-black/70 mb-3">
                  Order Summary
                </div>

                <div className="flex flex-col gap-3">
                  {order.lineItems.map((li) => (
                    <div
                      key={li.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-black/5">
                          {li.itemImageUrlSnapshot ? (
                            <Image
                              src={li.itemImageUrlSnapshot}
                              alt={li.itemNameSnapshot}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-[11px] text-black/40">
                              —
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-medium text-black/80">
                            {li.qty} × {li.itemNameSnapshot}
                          </div>

                          {li.note ? (
                            <div className="text-[12px] text-black/50">
                              Note: {li.note}
                            </div>
                          ) : null}

                          {li.options?.length ? (
                            <div className="mt-1 text-[12px] text-black/45">
                              {li.options
                                .map((op) => {
                                  const qty =
                                    op.qty && op.qty !== 1 ? ` ×${op.qty}` : "";
                                  return `${op.optionNameSnapshot}${qty}`;
                                })
                                .join(", ")}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-black/70">
                        {moneyFromCents(li.lineSubtotalCentsSnapshot)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-black/10 pt-4 text-sm">
                  <div className="flex justify-between text-black/60">
                    <span>Subtotal</span>
                    <span className="font-medium text-black/80">
                      {moneyFromCents(order.subtotalCents)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-black/60">
                    <span>Tax</span>
                    <span className="font-medium text-black/80">
                      {moneyFromCents(order.taxCents)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between text-black/80">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      {moneyFromCents(order.totalCents)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-black/70 mb-2">
                  Store Address
                </div>
                <div className="text-sm text-black/60">{storeAddress}</div>

                <div className="mt-3 rounded-xl overflow-hidden border border-black/10">
                  <iframe
                    title="map"
                    src={googleMapsUrl}
                    className="w-full h-52"
                    loading="lazy"
                  />
                </div>

                <div className="mt-2 text-sm">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      storeAddress
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tenton-brown font-semibold hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={`tel:${phone}`}
                  className="h-10 px-6 rounded-full bg-tenton-red text-white font-semibold text-sm grid place-items-center border border-tenton-red hover:bg-white hover:text-tenton-red"
                >
                  Call Restaurant
                </a>

                <Link
                  href="/"
                  className="h-10 px-6 rounded-full border border-tenton-brown text-tenton-brown font-semibold text-sm grid place-items-center hover:bg-tenton-brown hover:text-white"
                >
                  Go back home
                </Link>
              </div>
            </div>
          </div>

          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
