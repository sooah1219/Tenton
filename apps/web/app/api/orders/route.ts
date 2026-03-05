import { NextResponse } from "next/server";

const BASE = process.env.API_BASE_URL;

export async function GET(req: Request) {
  if (!BASE)
    return NextResponse.json(
      { message: "Missing API_BASE_URL" },
      { status: 500 }
    );

  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();

  const url = qs ? `${BASE}/api/orders?${qs}` : `${BASE}/api/orders`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function POST(req: Request) {
  if (!BASE)
    return NextResponse.json(
      { message: "Missing API_BASE_URL" },
      { status: 500 }
    );

  const body = await req.json();

  const res = await fetch(`${BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
