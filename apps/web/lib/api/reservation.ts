export type CreateReservationDto = {
  dateIso: string; // "2026-03-10"
  time: string; // "6:30 PM"
  partySize: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note?: string;
};

export type ReservationDto = {
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

export async function listReservations(params?: { date?: string }) {
  const qs = new URLSearchParams();

  if (params?.date) {
    qs.set("date", params.date);
  }

  const url = qs.toString()
    ? `/api/reservations?${qs.toString()}`
    : `/api/reservations`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) throw new Error(await res.text());

  return (await res.json()) as ReservationDto[];
}

export async function createReservation(dto: CreateReservationDto) {
  const res = await fetch(`/api/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) throw new Error(await res.text());

  return (await res.json()) as ReservationDto;
}

export async function getReservationById(id: string) {
  const res = await fetch(`/api/reservations/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error(await res.text());

  return (await res.json()) as ReservationDto;
}
