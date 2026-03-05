export const TZ = "America/Vancouver";
export const OPEN = 11 * 60 + 30; // 11:30
export const CLOSE = 19 * 60 + 30; // 7:30
export const INTERVAL = 30;

export function formatISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildDateOptions(daysAhead = 14) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const arr: { value: string; label: string }[] = [];
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const value = formatISO(d);
    const label =
      i === 0
        ? `Today • ${d.toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
          })}`
        : i === 1
        ? `Tomorrow • ${d.toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
          })}`
        : d.toLocaleDateString("en-CA", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });

    arr.push({ value, label });
  }
  return arr;
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function getNowVancouverMinutes() {
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

export function roundUpTo(mins: number, step: number) {
  return Math.ceil(mins / step) * step;
}

export function format12h(mins: number) {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function buildAllDaySlots() {
  const slots: string[] = [];
  for (let m = OPEN; m <= CLOSE; m += INTERVAL) slots.push(format12h(m));
  return slots;
}

export function buildTimeSlotsFromNowPlus30() {
  const now = getNowVancouverMinutes();

  if (now > CLOSE) return buildAllDaySlots();

  const earliest = roundUpTo(now + 30, INTERVAL);
  const start = Math.max(earliest, OPEN);

  if (start > CLOSE) return [];
  const slots: string[] = [];
  for (let m = start; m <= CLOSE; m += INTERVAL) slots.push(format12h(m));
  return slots;
}
