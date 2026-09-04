"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";

export function Guard({
  need,
  children,
}: {
  need: "email" | "workday" | "major" | "home";
  children: React.ReactNode;
}) {
  const { ready, state } = useApp();
  const router = useRouter();
  const profileReady = Boolean(state.majorId);
  const homeReady = Boolean(state.homeSetupDone);

  useEffect(() => {
    if (!ready) return;
    if (!state.email) {
      router.replace("/");
      return;
    }
    if ((need === "workday" || need === "major" || need === "home") && !state.workdayDemo) {
      router.replace("/connect");
      return;
    }
    if ((need === "major" || need === "home") && !profileReady) {
      router.replace("/major");
      return;
    }
    if (need === "home" && !homeReady) {
      router.replace("/home");
    }
  }, [ready, state.email, state.workdayDemo, profileReady, homeReady, need, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-muted">
        Loading Class OP…
      </div>
    );
  }

  if (!state.email) return null;
  if ((need === "workday" || need === "major" || need === "home") && !state.workdayDemo) return null;
  if ((need === "major" || need === "home") && !profileReady) return null;
  if (need === "home" && !homeReady) return null;

  return <>{children}</>;
}
