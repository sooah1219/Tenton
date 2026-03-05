import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const base = process.env.API_BASE_URL;
  if (!base) {
    return NextResponse.json(
      { message: "BACKEND_API_BASE_URL is not set" },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const target = qs ? `${base}/api/menu/items?${qs}` : `${base}/api/menu/items`;

  const res = await fetch(target, { cache: "no-store" });
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
