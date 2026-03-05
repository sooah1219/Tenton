"use client";

import type { Category } from "@/types/menu";
import Image from "next/image";
import { useEffect, useRef } from "react";

export function CategoryIcons({
  activeCat,
  setActiveCat,
  CATEGORIES,
}: {
  activeCat: string;
  setActiveCat: (id: string) => void;
  CATEGORIES: Category[];
}) {
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    itemRefs.current[activeCat]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCat]);

  return (
    <div className="relative w-full">
      <div className="mx-auto w-full max-w-[1000px]">
        <div
          className="
            w-full flex
            overflow-x-auto min-[650px]:overflow-x-hidden
            px-2 pb-2
            justify-start min-[650px]:justify-between
          "
        >
          {CATEGORIES.filter((c) => c.id !== "combo").map((c) => {
            const active = c.id === activeCat;

            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                ref={(node) => {
                  itemRefs.current[c.id] = node;
                }}
                className="
                  group
                  flex-none
                  flex flex-col items-center justify-center
                  min-w-[84px]
                  cursor-pointer
                "
              >
                {/* icon */}
                <div className="relative h-20 w-20 lg:h-30 lg:w-30">
                  {c.icon ? (
                    <Image
                      src={c.icon}
                      alt={c.name}
                      fill
                      className={[
                        "object-contain transition-opacity duration-200",
                        active
                          ? "opacity-100"
                          : "opacity-40 group-hover:opacity-100",
                      ].join(" ")}
                    />
                  ) : (
                    <span className="text-black/30 text-sm">icon</span>
                  )}
                </div>

                {/* label */}
                <span
                  className={[
                    "text-sm text-md transition-colors duration-200",
                    active
                      ? "text-tenton-brown opacity-100"
                      : "text-font-brown opacity-25 group-hover:text-tenton-brown group-hover:opacity-100",
                  ].join(" ")}
                >
                  {c.name}
                </span>

                {/* underline */}
                <span
                  className={[
                    "mt-1 h-[1px] w-10 bg-gradient-to-r from-transparent via-tenton-brown/60 to-transparent transition-opacity duration-200",
                    active
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
