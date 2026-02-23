import type { SVGProps } from "react";

type RamenSteamProps = SVGProps<SVGSVGElement> & {
  gradientId: string;
};

export default function RamenSteam({
  className,
  gradientId,
  ...rest
}: RamenSteamProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 200"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="40%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M60 180
           C40 140, 80 130, 60 100
           C40 70, 80 60, 60 30
           C50 15, 70 5, 60 0"
        stroke={`url(#${gradientId})`}
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
