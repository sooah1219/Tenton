export function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
}

export function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function adminFetch(path: string, init?: RequestInit) {
  const BASE = apiBase();
  if (!BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");

  const res = await fetch(joinUrl(BASE, path), {
    ...init,
    credentials: "include", // ✅ 쿠키 인증 핵심
    headers: {
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res;
}
