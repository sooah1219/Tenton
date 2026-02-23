"use client";

import Image from "next/image";
import type { MenuItem } from "./OnlineOrderPage";
import { money } from "./OnlineOrderPage";

export default function ComboSection({
  title,
  items,
  onAdd,
}: {
  title: string;
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <div className="mt-10">
      <h3 className="text-lg font-semibold text-[#4a2f25] mb-3">{title}</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((it) => (
          <article
            key={it.id}
            className="rounded-2xl bg-white border border-black/10 shadow-sm overflow-hidden"
          >
            <div className="aspect-[4/3] bg-[#f2efe9] flex items-center justify-center">
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

            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm">{it.name}</div>
                  <div className="text-tenton-red text-sm mt-1">
                    {money(it.price)}
                  </div>
                </div>

                <button
                  onClick={() => onAdd(it)}
                  className="h-8 w-8 rounded-full bg-[#6d3a30] text-white hover:bg-[#9b3d2e] transition flex items-center justify-center"
                  aria-label={`Add ${it.name}`}
                >
                  +
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
