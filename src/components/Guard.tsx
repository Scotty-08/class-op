"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

export function Guard({
  need,
  children,
}: {
  need: "email" | "workday" | "major";
  children: React.ReactNode;
}) {
  const { ready, state } = useApp();
  const router = useRouter();
  const profileReady = Boolean(state.majorId);

  useEffect(() => {
    if (!ready) return;
    if (!state.email) {
      router.replace("/");
      return;
    }
    if ((need === "workday" || need === "major") && !state.workdayDemo) {
      router.replace("/connect");
      return;
    }
    if (need === "major" && !profileReady) {
      router.replace("/major");
    }
  }, [ready, state.email, state.workdayDemo, profileReady, need, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
        Loading Class OP…
      </div>
    );
  }

  if (!state.email) return null;
  if ((need === "workday" || need === "major") && !state.workdayDemo) return null;
  if (need === "major" && !profileReady) return null;

  return <>{children}</>;
}
