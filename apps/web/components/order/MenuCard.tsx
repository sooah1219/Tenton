"use client";

import type { MenuItem } from "@/types/menu";
import { Plus } from "lucide-react";
import Image from "next/image";
import { moneyFromCents } from "./helpers";

export default function MenuCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <article
      className="
        rounded-2xl bg-white shadow-lg overflow-hidden py-4 flex flex-col cursor-pointer
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
        border border-transparent hover:border-tenton-brown
      "
    >
      <div className="aspect-[4/3] flex items-center justify-center">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={400}
            height={300}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-black/30 text-sm">image</span>
        )}
      </div>

      <div className="p-4 text-center">
        <div className="font-semibold text-md">{item.name}</div>
        <div className="text-tenton-red text-md mt-1">
          {moneyFromCents(item.priceCents)}
        </div>
      </div>

      <div className="px-4 mt-auto flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(item);
          }}
          className="h-8 w-8 rounded-full bg-tenton-brown text-white cursor-pointer hover:bg-tenton-red transition flex items-center justify-center"
          aria-label={`Add ${item.name}`}
        >
          <Plus size={20} />
        </button>
      </div>
    </article>
  );
}
