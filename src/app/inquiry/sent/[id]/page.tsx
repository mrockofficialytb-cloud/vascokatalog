import Link from "next/link";

export default async function InquirySentPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/30 p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Poptávka byla odeslána ✅</h1>
          <p className="mt-2 text-sm text-zinc-400">
            ID poptávky: <span className="font-semibold text-zinc-200">{params.id}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Zpět do katalogu
            </Link>
            <Link
              href="/cart"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Nová poptávka
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}