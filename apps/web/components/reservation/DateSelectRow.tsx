"use client";

import { CalendarDays, ChevronDown } from "lucide-react";

export default function DateSelectRow({
  date,
  setDate,
  dateOptions,
}: {
  date: string;
  setDate: (v: string) => void;
  dateOptions: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-black/5 flex items-center justify-center">
        <CalendarDays className="text-tenton-brown" size={18} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-black/70">Date</span>

        <div className="relative">
          <select
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="appearance-none h-10 pl-3 pr-9 rounded-xl border border-black/10 bg-white text-sm text-black/75 focus:outline-none focus:ring-2 focus:ring-tenton-brown/30"
          >
            {dateOptions.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
