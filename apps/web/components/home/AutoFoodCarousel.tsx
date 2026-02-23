"use client";

import Image from "next/image";

type Item = { name: string; img: string };

const items: Item[] = [
  { name: "Original Ramen", img: "/ramen/original.png" },
  { name: "Spicy Miso Ramen", img: "/ramen/spicymiso.png" },
  { name: "Trio Katsu", img: "/katsu/trio.png" },
  { name: "Cheese Katsu", img: "/katsu/cheesekatsu.png" },
  { name: "Curry Katsu", img: "/katsu/currykatsu.png" },
  { name: "Black Ramen", img: "/ramen/black.png" },
  { name: "Beef Short Ribs", img: "/katsu/beefshortrib.png" },
  { name: "Curry Katsu Udon", img: "/ramen/curryudon.png" },
];

export default function AutoFoodCarousel() {
  const loop = [...items, ...items];

  return (
    <section className="w-full bg-tenton-bg py-10">
      <h1 className="text-center font-averia-sans text-tenton-brown text-[clamp(20px,4vw,32px)] mb-6">
        Menu Highlight
      </h1>

      <div className="w-full px-4 overflow-hidden">
        <div
          className="flex gap-3"
          style={{
            width: "max-content",
            animation: "tentonScrollX 50s linear infinite",
            willChange: "transform",
          }}
        >
          {loop.map((it, idx) => (
            <article
              key={`${it.name}-${idx}`}
              className="shrink-0 w-[clamp(140px,36vw,190px)] rounded-2xl bg-white border border-tenton-brown/10 shadow-sm p-3"
            >
              <div className="relative h-[120px] w-full">
                <Image
                  src={it.img}
                  alt={it.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="mt-2 text-center text-tenton-brown text-[13px] sm:text-[14px]">
                {it.name}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* keyframes (styled-jsx global style) */}
      <style jsx global>{`
        @keyframes tentonScrollX {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .no-motion {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
