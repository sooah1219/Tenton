// app/order/confirmed/[orderId]/page.tsx
import ConfirmedPageClient from "./ConfirmedPageClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function Page({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
    cache: "no-store",
  });
  const order = await res.json();

  return <ConfirmedPageClient order={order} />;
}
