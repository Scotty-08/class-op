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
    if (need === "major" && !state.majorId) {
      router.replace("/major");
    }
  }, [ready, state.email, state.workdayDemo, state.majorId, need, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
        Loading Class OP…
      </div>
    );
  }

  if (!state.email) return null;
  if ((need === "workday" || need === "major") && !state.workdayDemo) return null;
  if (need === "major" && !state.majorId) return null;

  return <>{children}</>;
}
