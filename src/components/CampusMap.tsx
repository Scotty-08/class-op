"use client";

import dynamic from "next/dynamic";
import type { DayCode, Meeting } from "@/lib/types";

const Inner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[360px] items-center justify-center rounded-2xl bg-stone-100 text-sm text-ink-muted">
      Loading campus map…
    </div>
  ),
});

export function CampusMap(props: { meetings: Meeting[]; selectedDays: DayCode[] }) {
  return <Inner {...props} />;
}
