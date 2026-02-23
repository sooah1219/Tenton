"use client";

import ChevronDownIcon from "@/components/icons/ChevronDownIcon";
import { Clock, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type PickupDayValue = "Today" | "Tomorrow" | `+${number}d`;

type Props = {
  query: string;
  onQueryChange: (v: string) => void;

  pickupDay: PickupDayValue;
  onPickupDayChange: (v: PickupDayValue) => void;

  pickupTime: string;
  onPickupTimeChange: (v: string) => void;
};

const TZ = "America/Vancouver";
const OPEN = 12 * 60;
const CLOSE = 19 * 60 + 30;
const DAYS_AHEAD = 7;

function roundUpTo30(mins: number) {
  return Math.ceil(mins / 30) * 30;
}

function format12h(mins: number) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

function getNowVancouverMinutes() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (t: string) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);

  return get("hour") * 60 + get("minute");
}

function parseDayOffset(v: PickupDayValue): number {
  if (v === "Today") return 0;
  if (v === "Tomorrow") return 1;
  const m = v.match(/^\+(\d+)d$/);
  return m ? Number(m[1]) : 0;
}

function buildTimeSlotsClientOnly(dayOffset: number) {
  const nowMins = getNowVancouverMinutes();
  const start =
    dayOffset === 0 ? Math.max(roundUpTo30(nowMins + 30), OPEN) : OPEN;

  if (start > CLOSE) return [];

  const slots: string[] = [];
  for (let m = start; m <= CLOSE; m += 30) slots.push(format12h(m));
  return slots;
}

function buildDayValues(): PickupDayValue[] {
  const out: PickupDayValue[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    out.push(i === 0 ? "Today" : i === 1 ? "Tomorrow" : (`+${i}d` as const));
  }
  return out;
}

function formatDayLabelClientOnly(offset: number) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).formatToParts(new Date(Date.now() + offset * 86400000));

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("month")} ${get("day")}`;
}

export default function OrderFilters({
  query,
  onQueryChange,
  pickupDay,
  onPickupDayChange,
  pickupTime,
  onPickupTimeChange,
}: Props) {
  const [tick, setTick] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, [hydrated]);

  const dayValues = useMemo(() => buildDayValues(), []);

  const dayOptions = useMemo(() => {
    if (!hydrated) {
      return dayValues.map((v) => ({ value: v, label: v }));
    }
    return dayValues.map((v) => {
      const offset = parseDayOffset(v);
      return { value: v, label: formatDayLabelClientOnly(offset) };
    });
  }, [dayValues, hydrated]);

  const dayOffset = useMemo(() => parseDayOffset(pickupDay), [pickupDay]);

  const timeOptions = useMemo(() => {
    if (!hydrated) return [];
    return buildTimeSlotsClientOnly(dayOffset);
  }, [hydrated, dayOffset, tick]);

  useEffect(() => {
    if (!hydrated) return;
    const first = timeOptions[0] ?? "";
    if (!pickupTime || (first && !timeOptions.includes(pickupTime))) {
      onPickupTimeChange(first);
    }
  }, [hydrated, timeOptions.join("|"), pickupDay]); // eslint-disable-line

  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="flex items-center gap-2 rounded-lg bg-white border-2 border-tenton-border px-4 h-11 focus-within:border-tenton-brown transition-colors">
          <Search className="text-tenton-brown" size={18} />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search menu"
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2 justify-center md:justify-self-end">
          <div className="inline-flex items-center gap-1">
            <Clock className="text-tenton-brown" size={22} />
            <span className="text-md font-bold text-tenton-brown">
              Pickup Time
            </span>
          </div>

          <div className="relative">
            <select
              value={pickupDay}
              onChange={(e) =>
                onPickupDayChange(e.target.value as PickupDayValue)
              }
              className="appearance-none rounded-lg bg-white border border-tenton-border pl-4 pr-10 h-10 text-sm outline-none cursor-pointer focus:border-tenton-brown"
            >
              {dayOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tenton-brown" />
          </div>

          <div className="relative">
            <select
              value={pickupTime}
              onChange={(e) => onPickupTimeChange(e.target.value)}
              className="appearance-none cursor-pointer rounded-lg bg-white border border-tenton-border pl-4 pr-10 h-10 text-sm outline-none focus:border-tenton-brown"
            >
              {!hydrated ? (
                <option value="">Loading…</option>
              ) : timeOptions.length === 0 ? (
                <option value="">CLOSED</option>
              ) : (
                timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              )}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tenton-brown" />
          </div>
        </div>
      </div>
    </section>
  );
}
