"use client";

import type { MenuItem } from "@/types/menu";
import { Plus } from "lucide-react";
import Image from "next/image";
import { moneyFromCents } from "./helpers";

export default function MenuGrid({
  items,
  onOpen,
  showComboSection = false,
  comboTitle = "Make it Combo with Katsu",
  comboItems = [],
}: {
  items: MenuItem[];
  onOpen: (item: MenuItem) => void;

  showComboSection?: boolean;
  comboTitle?: string;
  comboItems?: MenuItem[];
}) {
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((it) => (
          <article
            key={it.id}
            onClick={() => onOpen(it)}
            className="
              rounded-2xl bg-white shadow-lg overflow-hidden py-2 md:py-4 flex flex-col cursor-pointer transition-all duration-300
              hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-tenton-brown
            "
          >
            <div className="aspect-[4/3] flex items-center justify-center">
              {it.imageUrl ? (
                <Image
                  src={it.imageUrl}
                  alt={it.name}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-black/30 text-sm">image</span>
              )}
            </div>

            <div className="p-2 md:p-4 text-center">
              <div className="font-semibold text-md">{it.name}</div>
              <div className="text-tenton-red text-md mt-1">
                {moneyFromCents(it.priceCents)}
              </div>
            </div>

            <div className="px-4 mt-auto flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(it);
                }}
                className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-tenton-brown text-white cursor-pointer hover:bg-tenton-red transition flex items-center justify-center"
                aria-label={`Configure ${it.name}`}
              >
                <Plus size={20} />
              </button>
            </div>
          </article>
        ))}
      </div>

      {showComboSection && comboItems.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-3xl font-averia-sans text-tenton-brown">
            {comboTitle.includes("Combo") ? (
              <>
                Make it <span className="text-tenton-red">Combo</span> with
                Katsu
              </>
            ) : (
              comboTitle
            )}
          </h2>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {comboItems.map((it) => (
              <article
                key={it.id}
                onClick={() => onOpen(it)}
                className="
                  rounded-2xl bg-white shadow-lg overflow-hidden py-2 md:py-4 flex flex-col cursor-pointer transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-tenton-brown
                "
              >
                <div className="aspect-[4/3] flex items-center justify-center">
                  {it.imageUrl ? (
                    <Image
                      src={it.imageUrl}
                      alt={it.name}
                      width={400}
                      height={300}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-black/30 text-sm">image</span>
                  )}
                </div>

                <div className="p-2 md:p-4 text-center">
                  <div className="font-semibold text-md">{it.name}</div>
                  <div className="text-tenton-red text-md mt-1">
                    {moneyFromCents(it.priceCents)}
                  </div>
                </div>

                <div className="px-4 mt-auto flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(it);
                    }}
                    className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-tenton-brown text-white cursor-pointer hover:bg-tenton-red transition flex items-center justify-center"
                    aria-label={`Configure ${it.name}`}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
