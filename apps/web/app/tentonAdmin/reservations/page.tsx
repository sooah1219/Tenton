"use client";

import { ArrowUpDown, Calendar, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ReservationApi = {
  id: string;
  reservedAt: string; // "2026-03-05T16:30:00"
  partySize: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string | null;
  createdAt: string; // "...Z"
  updatedAt: string; // "...Z"
};

type SortKey = "date_time_asc" | "date_time_desc" | "party_desc" | "party_asc";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDateLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function labelDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function nameOf(r: ReservationApi) {
  return `${r.firstName} ${r.lastName}`.trim();
}

function cmp(a: string | number, b: string | number) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// reservedAt: "2026-03-05T16:30:00"
// -> dateIso "2026-03-05", time "16:30"
function splitReservedAt(reservedAt: string) {
  const [datePart, timePartRaw] = reservedAt.split("T");
  const timePart = (timePartRaw ?? "").slice(0, 5); // "HH:mm"
  return { dateIso: datePart, time: timePart };
}

export default function ReservationsDashboardPage() {
  const today = toIsoDateLocal(new Date());

  // data
  const [rows, setRows] = useState<ReservationApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // filters
  const [rangePreset, setRangePreset] = useState<
    "today" | "tomorrow" | "7d" | "custom"
  >("today");
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("date_time_asc");

  // presets
  useEffect(() => {
    if (rangePreset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (rangePreset === "tomorrow") {
      const dt = new Date();
      dt.setDate(dt.getDate() + 1);
      const t = toIsoDateLocal(dt);
      setStartDate(t);
      setEndDate(t);
    } else if (rangePreset === "7d") {
      const dt = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 6);
      setStartDate(toIsoDateLocal(dt));
      setEndDate(toIsoDateLocal(end));
    }
  }, [rangePreset, today]);

  // fetch
  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setLoadError(null);

        const res = await fetch("/api/reservations", { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = (await res.json()) as ReservationApi[];

        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "Failed to load reservations.";
        if (!cancelled) setLoadError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = rows.filter((r) => {
      const { dateIso } = splitReservedAt(r.reservedAt);
      return dateIso >= startDate && dateIso <= endDate;
    });

    if (q) {
      list = list.filter((r) => {
        const { dateIso, time } = splitReservedAt(r.reservedAt);
        const hay = [
          nameOf(r),
          r.phone,
          r.email,
          r.note ?? "",
          dateIso,
          time,
          String(r.partySize),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    const sorted = [...list].sort((a, b) => {
      const A = splitReservedAt(a.reservedAt);
      const B = splitReservedAt(b.reservedAt);

      const aDT = `${A.dateIso} ${A.time}`;
      const bDT = `${B.dateIso} ${B.time}`;

      if (sort === "date_time_asc") return cmp(aDT, bDT);
      if (sort === "date_time_desc") return cmp(bDT, aDT);

      if (sort === "party_desc")
        return cmp(b.partySize, a.partySize) || cmp(aDT, bDT);
      if (sort === "party_asc")
        return cmp(a.partySize, b.partySize) || cmp(aDT, bDT);

      if (sort === "name_asc")
        return (
          cmp(nameOf(a).toLowerCase(), nameOf(b).toLowerCase()) || cmp(aDT, bDT)
        );
      return (
        cmp(nameOf(b).toLowerCase(), nameOf(a).toLowerCase()) || cmp(aDT, bDT)
      );
    });

    return sorted;
  }, [rows, startDate, endDate, query, sort]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, ReservationApi[]>();
    for (const r of filteredSorted) {
      const { dateIso } = splitReservedAt(r.reservedAt);
      const arr = map.get(dateIso) ?? [];
      arr.push(r);
      map.set(dateIso, arr);
    }
    return Array.from(map.entries()).sort((a, b) => cmp(a[0], b[0]));
  }, [filteredSorted]);

  const stats = useMemo(() => {
    const bookings = filteredSorted.length;
    const guests = filteredSorted.reduce((sum, r) => sum + r.partySize, 0);
    return { bookings, guests };
  }, [filteredSorted]);

  return (
    <div className="min-h-screen bg-tenton-bg pb-10">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
        <div className="mb-6">
          <h1 className="font-averia-serif text-4xl md:text-5xl text-tenton-brown">
            Reservations
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Manage bookings by date, time, and customer info.
          </p>
        </div>

        <section className="rounded-2xl bg-white/70 border border-black/10 shadow-sm overflow-hidden">
          <div className="p-5 space-y-4">
            {/* presets + search */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <Chip
                  active={rangePreset === "today"}
                  onClick={() => setRangePreset("today")}
                >
                  Today
                </Chip>
                <Chip
                  active={rangePreset === "tomorrow"}
                  onClick={() => setRangePreset("tomorrow")}
                >
                  Tomorrow
                </Chip>
                <Chip
                  active={rangePreset === "7d"}
                  onClick={() => setRangePreset("7d")}
                >
                  Next 7 days
                </Chip>
                <Chip
                  active={rangePreset === "custom"}
                  onClick={() => setRangePreset("custom")}
                >
                  Custom
                </Chip>
              </div>

              <div className="relative w-full md:w-[360px]">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name / phone / email / note…"
                  className="w-full h-10 rounded-xl border border-black/10 bg-white/70 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/25"
                />
              </div>
            </div>

            {/* date range + sort + stats */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px_220px] gap-3 items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Labeled label="Start date">
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setRangePreset("custom");
                        setStartDate(e.target.value);
                      }}
                      className="w-full h-10 rounded-xl border border-black/10 bg-white/70 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/25"
                    />
                  </div>
                </Labeled>

                <Labeled label="End date">
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setRangePreset("custom");
                        setEndDate(e.target.value);
                      }}
                      className="w-full h-10 rounded-xl border border-black/10 bg-white/70 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/25"
                    />
                  </div>
                </Labeled>
              </div>

              <Labeled label="Sort">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50">
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="w-full h-10 rounded-xl border border-black/10 bg-white/70 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/25"
                  >
                    <option value="date_time_asc">Date/Time (asc)</option>
                    <option value="date_time_desc">Date/Time (desc)</option>
                    <option value="party_desc">Party size (desc)</option>
                    <option value="party_asc">Party size (asc)</option>
                    <option value="name_asc">Name (A → Z)</option>
                    <option value="name_desc">Name (Z → A)</option>
                  </select>
                </div>
              </Labeled>

              <div className="rounded-2xl bg-white/60 border border-black/5 p-4">
                <div className="text-[11px] text-black/55">In range</div>
                <div className="mt-1 font-averia-serif text-2xl text-tenton-brown">
                  {stats.bookings} bookings
                </div>
                <div className="mt-1 text-sm text-black/60">
                  {stats.guests} guests
                </div>
              </div>
            </div>

            {loadError && (
              <div className="rounded-xl border border-red-500/30 bg-red-50 p-3 text-sm text-red-700">
                {loadError}
              </div>
            )}
          </div>

          <div className="border-t border-black/10" />

          {/* table */}
          <div className="hidden md:block">
            {loading ? (
              <div className="p-8 text-center text-sm text-black/60">
                Loading…
              </div>
            ) : groupedByDate.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-black/10">
                {groupedByDate.map(([d, items]) => (
                  <div key={d}>
                    <div className="px-5 py-3 bg-white/40">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-tenton-brown">
                          {labelDate(d)}{" "}
                          <span className="text-black/50 font-normal">
                            ({d})
                          </span>
                        </div>
                        <div className="text-sm text-black/60">
                          {items.length} booking{items.length === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-left text-black/60">
                          <tr className="border-t border-black/10 bg-white/60">
                            <th className="px-5 py-3 w-[90px]">Time</th>
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3 w-[90px]">Party</th>
                            <th className="px-5 py-3 w-[160px]">Phone</th>
                            <th className="px-5 py-3 w-[220px]">Email</th>
                            <th className="px-5 py-3">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {items.map((r) => {
                            const { time } = splitReservedAt(r.reservedAt);
                            return (
                              <tr key={r.id} className="hover:bg-white/50">
                                <td className="px-5 py-3 font-medium text-tenton-brown">
                                  {time}
                                </td>
                                <td className="px-5 py-3 font-medium">
                                  {nameOf(r)}
                                </td>
                                <td className="px-5 py-3">{r.partySize}</td>
                                <td className="px-5 py-3">{r.phone}</td>
                                <td className="px-5 py-3 text-black/70">
                                  {r.email}
                                </td>
                                <td className="px-5 py-3">
                                  {r.note ? (
                                    <span className="line-clamp-2">
                                      {r.note}
                                    </span>
                                  ) : (
                                    <span className="text-black/40">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {loading ? (
              <div className="p-8 text-center text-sm text-black/60">
                Loading…
              </div>
            ) : filteredSorted.length === 0 ? (
              <EmptyState />
            ) : (
              filteredSorted.map((r) => {
                const { dateIso, time } = splitReservedAt(r.reservedAt);
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl bg-white/70 border border-black/10 shadow-sm p-4"
                  >
                    <div className="text-xs text-black/50">
                      {labelDate(dateIso)} •{" "}
                      <span className="font-medium text-tenton-brown">
                        {time}
                      </span>
                    </div>
                    <div className="mt-1 font-medium">{nameOf(r)}</div>
                    <div className="text-xs text-black/50">{r.email}</div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl bg-white/60 border border-black/5 p-2">
                        <div className="text-xs text-black/50">Party</div>
                        <div className="mt-0.5 font-medium">{r.partySize}</div>
                      </div>
                      <div className="rounded-xl bg-white/60 border border-black/5 p-2">
                        <div className="text-xs text-black/50">Phone</div>
                        <div className="mt-0.5 font-medium">{r.phone}</div>
                      </div>
                    </div>

                    {r.note && (
                      <div className="mt-2 rounded-xl bg-white/60 border border-black/5 p-2 text-sm">
                        <div className="text-xs text-black/50">Note</div>
                        <div className="mt-0.5">{r.note}</div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-9 px-4 rounded-full border text-sm transition",
        active
          ? "bg-tenton-brown text-white border-tenton-brown"
          : "bg-white/60 text-tenton-brown border-black/10 hover:bg-white/80",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[12px] font-medium text-black/60">{label}</div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center">
      <div className="font-averia-serif text-2xl text-tenton-brown">
        No reservations
      </div>
      <div className="mt-2 text-sm text-black/60">
        Try changing the date range or clearing search.
      </div>
    </div>
  );
}
