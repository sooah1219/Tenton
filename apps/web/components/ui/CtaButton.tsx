"use client";

import { ArrowRight } from "lucide-react";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  showArrow?: boolean;
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = true,
  showArrow = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition select-none";

  const widths = fullWidth ? "w-full" : "w-auto";

  const sizes = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-7 text-base",
  } as const;

  const variants = {
    primary: "bg-tenton-red text-white hover:bg-tenton-brown",
    secondary:
      "bg-white text-tenton-brown border border-black/10 hover:border-tenton-brown",
    ghost: "bg-black/10 text-black/40 hover:bg-black/5",
  } as const;

  const classes = [
    base,
    widths,
    sizes[size],
    variants[variant],
    "shadow-sm active:scale-[0.99]",
    props.disabled ? "cursor-not-allowed" : "cursor-pointer",
    className,
  ].join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
      {showArrow && <ArrowRight size={16} />}
    </button>
  );
}
