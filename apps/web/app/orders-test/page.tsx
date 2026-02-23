"use client";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
  type OrderListDto,
} from "@/lib/api";
import { useEffect, useState } from "react";

// cents → CAD
function centsToCad(cents: number) {
  return (cents / 100).toFixed(2);
}
function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Unknown error";
}

export default function OrdersTestPage() {
  const [orders, setOrders] = useState<OrderListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setErr(null);
    setLoading(true);
    try {
      const list = await getOrders({ limit: 50 });
      setOrders(list);
    } catch (e: unknown) {
      setErr(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setErr(null);
    setLoading(true);
    try {
      await createOrder({
        customerName: "Next Test",
        phone: "6041234567",
        orderType: "dine_in",
        note: "from Next.js",
        items: [
          { itemName: "Ebi Katsu", unitPriceCents: 1599, quantity: 2 },
          { itemName: "Miso Soup", unitPriceCents: 299, quantity: 1 },
        ],
      });
      await refresh();
    } catch (e: unknown) {
      setErr(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(id: string, status: string) {
    setErr(null);
    setLoading(true);
    try {
      await updateOrderStatus(id, status);
      await refresh();
    } catch (e: unknown) {
      setErr(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Orders API Test</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={refresh} disabled={loading}>
          Refresh
        </button>
        <button onClick={handleCreate} disabled={loading}>
          Create test order
        </button>
      </div>

      {err && (
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fee",
            color: "#900",
            borderRadius: 6,
          }}
        >
          {err}
        </pre>
      )}

      <div style={{ marginTop: 16 }}>
        {loading && <p>Loading...</p>}

        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.id}</div>
                <div style={{ opacity: 0.8 }}>
                  {o.orderType} • {o.status} • ${centsToCad(o.totalCents)}
                </div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {new Date(o.createdAt).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={() => setStatus(o.id, "accepted")}
                  disabled={loading}
                >
                  accepted
                </button>
                <button
                  onClick={() => setStatus(o.id, "cooking")}
                  disabled={loading}
                >
                  cooking
                </button>
                <button
                  onClick={() => setStatus(o.id, "ready")}
                  disabled={loading}
                >
                  ready
                </button>
                <button
                  onClick={() => setStatus(o.id, "completed")}
                  disabled={loading}
                >
                  completed
                </button>
                <button
                  onClick={() => setStatus(o.id, "cancelled")}
                  disabled={loading}
                >
                  cancelled
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
