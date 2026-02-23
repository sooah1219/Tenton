const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
}

export type CreateOrderItemDto = {
  menuItemId?: string | null;
  itemName: string;
  unitPriceCents: number;
  quantity: number;
};

export type CreateOrderDto = {
  customerName?: string | null;
  phone?: string | null;
  orderType: string;
  note?: string | null;
  items: CreateOrderItemDto[];
};

export type OrderListDto = {
  id: string;
  status: string;
  orderType: string;
  totalCents: number;
  createdAt: string;
};

export async function getOrders(params?: { status?: string; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));

  const res = await fetch(`${BASE_URL}/orders?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as OrderListDto[];
}

export async function createOrder(dto: CreateOrderDto) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { ok: boolean; id: string; totalCents: number };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as { ok: boolean; id: string; status: string };
}
