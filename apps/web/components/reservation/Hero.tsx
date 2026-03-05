"use client";

import { cldImage } from "@/lib/cloudinary";
import Image from "next/image";

export default function Hero() {
  return (
    <div className="relative w-full h-[140px] md:h-[300px] lg:h-[360px] overflow-hidden">
      <Image
        src={cldImage("reservation_hero_lbsbne")}
        alt="Restaurant"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
