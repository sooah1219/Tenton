const TZ = "America/Vancouver";
export type PickupDayValue = "Today" | "Tomorrow" | `+${number}d`;

function parseDayOffset(v: PickupDayValue): number {
  if (v === "Today") return 0;
  if (v === "Tomorrow") return 1;
  const m = v.match(/^\+(\d+)d$/);
  return m ? Number(m[1]) : 0;
}

function parseTime12hToMinutes(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error("Invalid pickupTime format");
  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[3].toUpperCase();

  if (hh === 12) hh = 0;
  if (ap === "PM") hh += 12;

  return hh * 60 + mm;
}

function getTimeZoneOffsetMinutesForDate(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "UTC";
  const m = tzName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
  if (!m) return 0;

  const sign = m[1] === "-" ? -1 : 1;
  const hh = Number(m[2]);
  const mm = Number(m[3] ?? 0);
  return sign * (hh * 60 + mm);
}

export function buildPickupAtIso(
  pickupDay: PickupDayValue,
  pickupTime: string
) {
  const dayOffset = parseDayOffset(pickupDay);
  const mins = parseTime12hToMinutes(pickupTime);

  // Vancouver date parts (YYYY-MM-DD)
  const vParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Date.now() + dayOffset * 86400000));

  const get = (t: string) => vParts.find((p) => p.type === t)?.value ?? "";
  const y = get("year");
  const mo = get("month");
  const d = get("day");

  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");

  // compute Vancouver offset for that local datetime (handles DST)
  const localGuess = new Date(`${y}-${mo}-${d}T${hh}:${mm}:00`);
  const offsetMinutes = getTimeZoneOffsetMinutesForDate(localGuess, TZ);

  const utcMs =
    Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(hh), Number(mm), 0) -
    offsetMinutes * 60_000;

  return new Date(utcMs).toISOString();
}
