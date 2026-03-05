"use client";

import { adminFetch } from "@/lib/adminApi";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Login failed";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/tentonAdmin/orders";

  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await adminFetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      router.replace(next);
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-tenton-bg">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm"
      >
        <div className="text-2xl font-semibold text-tenton-brown">
          Admin Login
        </div>

        <label className="block mt-4 text-sm text-black/70">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full h-10 rounded-xl border border-black/10 bg-white/80 px-3"
        />

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        <button
          disabled={loading}
          className="mt-4 w-full h-10 rounded-xl bg-tenton-brown text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
