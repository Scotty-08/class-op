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
  const profileReady = Boolean(state.majorId && state.yearLevel);

  useEffect(() => {
    if (!state.workdayDemo) return;
    router.push(profileReady ? "/planner" : "/major");
  }, [state.workdayDemo, profileReady, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-cardinal">Step 2 of 3</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your registered schedule</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        Class OP&apos;s primary job is to put the classes you already registered for on a campus map and help you walk
        less. Iowa State registration lives in Workday (Microsoft / ISU SSO). This preview does{" "}
        <strong className="font-semibold text-ink">not</strong> call a live Workday API yet — Demo Workday loads a
        simulated registered Fall 2026 week (Beyer Loop). Live Find Course Sections / My Classes comes later.
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
            Simulated SSO success. Loads <strong className="font-medium text-ink">Demo · registered Fall 2026</strong>{" "}
            sections: MATH 1650 Lec 01, CPRE 1850, ENGL 1500 §11, CHEM 1670 Lec 04, ENGR 1010, LIB 1600 §10 (Beyer Loop
            from Friley).
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
            <MapPin className="h-3 w-3" />
            Then map my registered classes
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
        Demo Workday ≠ live Academic Progress. Rooms and true enrollment sync arrive with Workday SSO. Degree roadmap of
        remaining courses is secondary — after you map what you already have registered.
      </p>
    </div>
  );
}
