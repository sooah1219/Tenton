"use client";

import MenuItemModal from "@/components/order/MenuItemModal"; // <-- adjust path
import type { MenuItem } from "@/components/order/OnlineOrderPage"; // <-- adjust path
import { useState } from "react";

const testItem: MenuItem = {
  id: "r1",
  name: "Original Ramen",
  price: 17.5,
  categoryId: "ramen",
  image: "/ramen/original.png",
};

export default function ModalTestPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#fbfaf8] p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-semibold text-tenton-brown">
          Modal Test Page
        </h1>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setOpen(true)}
            className="h-10 rounded-full bg-tenton-brown px-5 text-white font-semibold"
          >
            Open Modal
          </button>
          <button
            onClick={() => setOpen(false)}
            className="h-10 rounded-full border border-black/20 px-5 font-semibold"
          >
            Close
          </button>
        </div>
      </div>

      <MenuItemModal
        open={open}
        item={testItem}
        onClose={() => setOpen(false)}
        onAdd={(item, qty, config) => {
          console.log("ADD", { item, qty, config });
          setOpen(false);
        }}
      />
    </div>
  );
}
