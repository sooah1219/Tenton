"use client";

export default function TimeSlots({
  time,
  setTime,
  timeOptions,
}: {
  time: string;
  setTime: (v: string) => void;
  timeOptions: string[];
}) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
      {timeOptions.length === 0 ? (
        <div className="col-span-full text-sm text-black/50 py-2">CLOSED</div>
      ) : (
        timeOptions.map((t) => {
          const active = t === time;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTime(t)}
              className={[
                "h-9 rounded-xl text-[12px] font-semibold border transition cursor-pointer",
                active
                  ? "bg-tenton-brown text-white border-tenton-brown"
                  : "bg-white text-black/70 border-black/10 hover:border-tenton-brown",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })
      )}
    </div>
  );
}
