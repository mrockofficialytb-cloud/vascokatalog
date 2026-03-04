"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type PollPayload = {
  latestId: string | null;
  latestCreatedAt: string | null;
  latestStatus: string | null;
  countNew: number;
};

export default function AdminInquiriesSmartRefresh({
  intervalMs = 15000,
}: {
  intervalMs?: number;
}) {
  const router = useRouter();
  const lastLatestId = useRef<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    let alive = true;

    async function tick() {
      try {
        const res = await fetch("/api/admin/inquiries/poll", { cache: "no-store" });
        if (!res.ok) return;

        const data = (await res.json()) as PollPayload;
        if (!alive) return;

        // první načtení -> jen uložit hodnotu, ne refresh
        if (!started.current) {
          started.current = true;
          lastLatestId.current = data.latestId;
          return;
        }

        // změnilo se ID poslední poptávky => přibyla nová poptávka
        if (data.latestId && data.latestId !== lastLatestId.current) {
          lastLatestId.current = data.latestId;
          router.refresh();
        }
      } catch {
        // ticho – nechceme spamovat konzoli
      }
    }

    // hned 1x a pak interval
    tick();
    const id = setInterval(tick, intervalMs);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}