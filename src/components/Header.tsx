"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useApp } from "@/lib/context";
import { MAJORS } from "@/lib/majors";

export function Header() {
  const { state, ready, signOut } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const major = MAJORS.find((m) => m.id === state.majorId);

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-paper-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href={state.workdayDemo && state.majorId ? "/planner" : "/"} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cardinal text-sm font-bold text-white shadow-sm">
            OP
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-semibold tracking-tight text-ink">Class OP</span>
            <span className="block text-[11px] text-ink-muted">Iowa State schedule optimizer</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLink href="/planner" active={pathname === "/planner"}>
            Planner
          </NavLink>
          <NavLink href="/about" active={pathname === "/about"}>
            About
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {ready && state.email ? (
            <div className="hidden items-center gap-2 md:flex">
              {major ? (
                <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-medium text-ink">
                  {major.name.replace(" B.S.", "")}
                </span>
              ) : null}
              <span className="max-w-[180px] truncate rounded-full bg-stone-100 px-2.5 py-1 text-[11px] text-ink-muted">
                {state.email}
              </span>
            </div>
          ) : null}
          {ready && state.email ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-ink-muted hover:bg-stone-100 hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-[13px] font-medium ${
        active ? "bg-stone-900 text-white" : "text-ink-muted hover:bg-stone-100 hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
