"use client";

import type { OrderStatus } from "@/types/order";
import { ChevronRight } from "lucide-react";
import type { AdminOrderListRow } from "./AdminOrdersDashboardPage";
import { fmtLocal, money, statusPill } from "./adminOrdersUi";

export default function OrdersTable({
  rows,
  selectedId,
  onSelect,
}: {
  rows: AdminOrderListRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col className="w-[220px]" />
          <col className="w-[140px]" />
          <col className="w-[140px]" />
          <col className="w-[260px]" />
          <col />
          <col className="w-[60px]" />
        </colgroup>

        <thead className="text-left text-black/60">
          <tr className="bg-white/60 border-b border-black/10">
            <th className="px-5 py-3 whitespace-nowrap">Created</th>
            <th className="px-5 py-3 whitespace-nowrap">Status</th>
            <th className="px-5 py-3 whitespace-nowrap">Total</th>
            <th className="px-5 py-3 whitespace-nowrap">Customer</th>
            <th className="px-5 py-3 whitespace-nowrap">Order ID</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-black/5">
          {rows.map((r) => {
            const active = r.id === selectedId;
            return (
              <tr
                key={r.id}
                className={[
                  "hover:bg-white/50 cursor-pointer",
                  active ? "bg-white/60" : "",
                ].join(" ")}
                onClick={() => onSelect(r.id)}
              >
                <td className="px-5 py-3 whitespace-nowrap text-black/80">
                  {fmtLocal(r.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <span className={statusPill(r.status as OrderStatus)}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 whitespace-nowrap font-medium text-tenton-brown">
                  {money(r.totalCents, "CAD")}
                </td>
                <td className="px-5 py-3">
                  <span className="block truncate" title={r.customerName}>
                    {r.customerName}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="block truncate text-black/60" title={r.id}>
                    {r.id}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-black/40">
                  <ChevronRight className="inline-block h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
