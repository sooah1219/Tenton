import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!BASE) {
    return NextResponse.json(
      { message: "Missing API_BASE_URL" },
      { status: 500 }
    );
  }

  const { id } = await ctx.params;

  const res = await fetch(`${BASE}/api/reservations/${id}`, {
    cache: "no-store",
  });

  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
