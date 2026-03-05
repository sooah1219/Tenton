export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-xl bg-white border border-black/10 shadow-sm p-6">
        <div className="text-sm text-black/60">
          Confirming your reservation...
        </div>
        <div className="mt-4 h-10 w-full rounded-lg bg-black/5 animate-pulse" />
        <div className="mt-3 h-10 w-full rounded-lg bg-black/5 animate-pulse" />
        <div className="mt-3 h-52 w-full rounded-xl bg-black/5 animate-pulse" />
      </div>
    </div>
  );
}
