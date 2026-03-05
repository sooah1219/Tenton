import { Check } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

type ReservationDto = {
  id: string;
  reservedAt: string;
  partySize: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatReservedAt(reservedAt: string) {
  const [datePart, timePartRaw] = reservedAt.split("T");
  const timePart = (timePartRaw ?? "").slice(0, 5); // "18:30"
  if (!datePart || timePart.length < 4) return reservedAt;

  const [hhStr, mmStr] = timePart.split(":");
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  const ampm = hh >= 12 ? "PM" : "AM";
  const hh12 = ((hh + 11) % 12) + 1;

  const d = new Date(`${datePart}T00:00:00`);
  const dateLabel = d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${dateLabel} • ${hh12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

async function getOrigin() {
  // ✅ Next 최신: headers()가 async인 경우가 있어서 await 처리
  const h = await headers();
  const host = h.get("host");

  // host가 없으면 fallback (개발용)
  if (!host) return "http://localhost:3000";

  const proto = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${proto}://${host}`;
}

async function getReservation(id: string): Promise<ReservationDto> {
  const origin = await getOrigin();

  // ✅ Next route handler를 호출 (same app) - 반드시 절대 URL
  const res = await fetch(`${origin}/api/reservations/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load reservation");
  }

  return res.json();
}

export default async function ReservationConfirmedPage({
  params,
}: {
  // ✅ 핵심: params가 Promise로 올 수 있으니 Promise로 받고 await로 풀기
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ 여기 중요
  const r = await getReservation(id);

  const storeAddress = "1731 Marine Drive, West Vancouver, Canada V7V1J5";
  const phone = "(604) 912-0288";
  const googleMapsUrl =
    "https://www.google.com/maps?q=1731+Marine+Drive,+West+Vancouver,+BC&output=embed";

  return (
    <div className="min-h-screen bg-[#fbfaf8]">
      <div className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl bg-white border border-black/10 shadow-sm">
            <div className="px-6 pt-6 pb-4 text-center border-b border-black/10">
              <div className="inline-flex items-center gap-2 text-tenton-red font-semibold text-[26px]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-tenton-red">
                  <Check size={14} className="text-white stroke-[3]" />
                </span>
                <span>Your Reservation is Confirmed</span>
              </div>
              <div className="mt-2 text-sm text-black/50">
                We’ve received your reservation request.
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between sm:block">
                    <div className="text-black/50">Name</div>
                    <div className="font-medium text-black/80">
                      {r.firstName} {r.lastName}
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <div className="text-black/50">Time</div>
                    <div className="font-medium text-black/80">
                      {formatReservedAt(r.reservedAt)}
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <div className="text-black/50">Guests</div>
                    <div className="font-medium text-black/80">
                      {r.partySize} {r.partySize === 1 ? "person" : "people"}
                    </div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <div className="text-black/50">Phone</div>
                    <div className="font-medium text-black/80">{r.phone}</div>
                  </div>
                  <div className="flex justify-between sm:block">
                    <div className="text-black/50">Email</div>
                    <div className="font-medium text-black/80">{r.email}</div>
                  </div>{" "}
                </div>
              </div>

              {r.note ? (
                <div>
                  <div className="text-sm font-semibold text-black/70 mb-2">
                    Special Instruction
                  </div>
                  <div className="text-sm text-black/60 whitespace-pre-wrap">
                    {r.note}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="text-sm font-semibold text-black/70 mb-2">
                  Store Address
                </div>
                <div className="text-sm text-black/60">{storeAddress}</div>

                <div className="mt-3 rounded-xl overflow-hidden border border-black/10">
                  <iframe
                    title="map"
                    src={googleMapsUrl}
                    className="w-full h-52"
                    loading="lazy"
                  />
                </div>

                <div className="mt-2 text-sm">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      storeAddress
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tenton-brown font-semibold hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={`tel:${phone}`}
                  className="h-10 px-6 rounded-full bg-tenton-red text-white font-semibold text-sm grid place-items-center border border-tenton-red hover:bg-white hover:text-tenton-red"
                >
                  Call Restaurant
                </a>

                <Link
                  href="/"
                  className="h-10 px-6 rounded-full border border-tenton-brown text-tenton-brown font-semibold text-sm grid place-items-center hover:bg-tenton-brown hover:text-white"
                >
                  Go back home
                </Link>
              </div>
            </div>
          </div>

          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
