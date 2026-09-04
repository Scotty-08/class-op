"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin, MonitorPlay } from "lucide-react";
import { Guard } from "@/components/Guard";
import { useApp } from "@/lib/context";

const WORKDAY = "https://www.myworkday.com/isu/d/home.htmld";

export default function ConnectPage() {
  return (
    <Guard need="email">
      <ConnectInner />
    </Guard>
  );
}

function ConnectInner() {
  const { state, connectDemo } = useApp();
  const router = useRouter();
  const profileReady = Boolean(state.majorId);

  useEffect(() => {
    if (!state.workdayDemo) return;
    if (profileReady && state.homeSetupDone) router.push("/planner");
    else if (profileReady) router.push("/home");
    else router.push("/major");
  }, [state.workdayDemo, profileReady, state.homeSetupDone, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Step 2 · Workday</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your registered schedule</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Class OP puts the classes you already registered for on a campus map. Iowa State registration lives in Workday.
        This preview does <strong className="font-semibold text-ink">not</strong> call a live Workday API yet — Demo
        Workday loads Scott&apos;s Fall 2026 <strong className="font-semibold text-ink">Current Classes</strong> export
        (COMS 3190, COMS 3090, CPRE 3100, EE 2300). Next you pick your major — we&apos;ll load the catalog plan and map
        what&apos;s on Workday.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => connectDemo()}
          className="rounded-2xl border-2 border-gold bg-gold-soft p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <MonitorPlay className="h-6 w-6 text-gold-dark" />
          <div className="mt-3 text-lg font-semibold text-ink">Demo Workday</div>
          <p className="mt-1 text-sm text-ink-muted">
            Simulated SSO success. Loads <strong className="font-medium text-ink">Current Classes · Fall 2026</strong>{" "}
            onto the map: Science Hall, Pearson, Carver, Coover, Food Sciences — online / empty-day meetings stay in the
            list only.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
            <MapPin className="h-3 w-3" />
            Then pick your major
          </span>
        </button>

        <a
          href={WORKDAY}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-stone-200 bg-paper-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-stone-400"
        >
          <ExternalLink className="h-6 w-6 text-cardinal" />
          <div className="mt-3 text-lg font-semibold text-ink">Open ISU Workday</div>
          <p className="mt-1 text-sm text-ink-muted">
            Opens <span className="font-mono text-[11px]">myworkday.com/isu</span> in a new tab. Real SSO will later
            read My Classes / Find Course Sections — it does not import into Class OP yet.
          </p>
          <span className="mt-4 inline-block text-xs font-semibold text-cardinal">Opens official Workday ↗</span>
        </a>
      </div>

      <p className="mt-6 rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs leading-relaxed text-ink-muted">
        After Demo Workday, pick your major. We load that major&apos;s catalog plan and map registered Current Classes.
        Optional Y1 Beyer Loop demo seed remains available on the planner as a reset.
      </p>
    </div>
  );
}
