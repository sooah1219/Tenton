"use client";

import CallIcon from "@/components/icons/Call.svg";
import CartIcon from "@/components/icons/Cart.svg";
import Image from "next/image";
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="w-full bg-tenton-bg sticky top-0 z-50">
      <div
        className="
          mx-auto flex w-full items-center justify-between
          h-[clamp(56px,4.2vw,80px)]
          max-w-[1500px]
          px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-14
        "
      >
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          <div className="relative h-[clamp(36px,3vw,56px)] w-[clamp(30px,2.2vw,44px)]">
            <Image
              src="/logo.png"
              alt="Tenton logo"
              fill
              className="object-contain"
            />
          </div>

          <span
            className="
              font-averia font-bold text-tenton-brown whitespace-nowrap
              text-[clamp(15px,1.45vw,22px)]
            "
          >
            Tenton Ramen <span className="text-tenton-red">N</span> Tonkatsu
          </span>
        </Link>
        {/* todo change phone num */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          <Link
            href="tel:+1-000-000-0000"
            className="
              inline-flex items-center justify-center rounded-full
              bg-tenton-red border-2 border-tenton-red text-tenton-bg
              h-[clamp(34px,2.8vw,44px)]
              px-[clamp(10px,1.6vw,18px)]
              text-[clamp(13px,1.1vw,16px)]
              font-semibold
              transition-colors duration-200
              hover:bg-white hover:text-tenton-red
            "
          >
            <CallIcon className="h-[clamp(14px,1.2vw,18px)] w-[clamp(14px,1.2vw,18px)]" />
            <span className="hidden sm:inline ml-2">Call</span>
          </Link>

          <Link
            href="/order"
            className="
              hidden sm:inline-flex items-center justify-center rounded-full
              border-2 border-tenton-brown text-tenton-brown font-semibold
              h-[clamp(34px,2.8vw,44px)]
              px-[clamp(10px,1.6vw,18px)]
              text-[clamp(13px,1.1vw,16px)]
              transition-colors duration-200
              hover:bg-tenton-brown hover:text-white
            "
          >
            <CartIcon className="h-[clamp(14px,1.2vw,18px)] w-[clamp(14px,1.2vw,18px)]" />
            <span className="ml-2">Order</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
