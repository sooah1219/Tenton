"use client";

import MenuCard from "./MenuCard";
import type { MenuItem } from "./OnlineOrderPage";

export default function MenuGrid({
  items,
  onAdd,
}: {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {items.map((it) => (
        <MenuCard key={it.id} item={it} onAdd={onAdd} />
      ))}
    </div>
  );
}
