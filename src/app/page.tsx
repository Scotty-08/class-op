"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ShieldCheck, CalendarRange } from "lucide-react";
import { useApp } from "@/lib/context";

const ISU = /@iastate\.edu$/i;

export default function HomePage() {
  const { ready, state, setEmail } = useApp();
  const router = useRouter();
  const [email, setLocal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const profileReady = Boolean(state.majorId);

  useEffect(() => {
    if (!ready) return;
    if (state.email && state.workdayDemo && profileReady) router.replace("/planner");
    else if (state.email && state.workdayDemo) router.replace("/major");
    else if (state.email) router.replace("/connect");
  }, [ready, state.email, state.workdayDemo, profileReady, router]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) {
      setError("Enter your Iowa State email.");
      return;
    }
    if (!ISU.test(value)) {
      setError(
        "Class OP is for Iowa State students only. Sign in with an @iastate.edu address — other domains are not accepted.",
      );
      return;
    }
    setError(null);
    setEmail(value);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
      <section>
        <p className="mb-3 inline-flex rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-ink">
          Preview · not an official ISU app
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Map what you registered.
          <span className="block text-cardinal">Walk less at Iowa State.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          Class OP puts your registered sections on a real campus map, starting from Friley / 212 Beyer Ct. Pick your
          major — we&apos;ll load the catalog plan and map what&apos;s on Workday.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-ink">
          <li className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-cardinal" />
            ISU-only gate — Net-ID email must end in @iastate.edu
          </li>
          <li className="flex gap-3">
            <CalendarRange className="mt-0.5 h-5 w-5 text-cardinal" />
            Demo Workday loads Current Classes (COMS 3190, COMS 3090, CPRE 3100, EE 2300), then you pick your major
          </li>
          <li className="flex gap-3">
            <MapPin className="mt-0.5 h-5 w-5 text-cardinal" />
            View my plan (CPRE 2026–27 roadmap) and map registered classes on the planner
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-paper-card p-6 shadow-card sm:p-8">
        <h2 className="text-lg font-semibold">Sign in with your ISU email</h2>
        <p className="mt-1 text-sm text-ink-muted">This preview stores the session in your browser only.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-muted">Iowa State email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="netid@iastate.edu"
              value={email}
              onChange={(e) => {
                setLocal(e.target.value);
                setError(null);
              }}
              className="input"
            />
          </label>
          {error ? (
            <div role="alert" className="rounded-xl border border-cardinal/30 bg-cardinal-soft px-3 py-2 text-sm text-cardinal-dark">
              {error}
            </div>
          ) : (
            <p className="text-xs text-ink-muted">Gmail, Outlook, and other schools are rejected.</p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-cardinal py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cardinal-dark"
          >
            Continue
          </button>
        </form>
      </section>
    </div>
  );
}
