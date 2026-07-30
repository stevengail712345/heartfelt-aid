import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/stories", label: "Stories" },
  { to: "/testimonies", label: "Testimonies" },
  { to: "/about", label: "About" },
  { to: "/transparency", label: "Transparency" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-32 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-4" onClick={() => setOpen(false)}>
          <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Heart className="size-8 fill-current" aria-hidden />
          </span>
          <span className="leading-tight">
            <h1 className="block font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Compassion Beyond Borders
            </h1>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Foundation
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                to="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
              >
                Admin
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/stories"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Donate now
          </Link>
        </div>

        <button
          className="inline-flex size-10 items-center justify-center rounded-md border border-border lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border bg-background lg:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Admin
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  void handleSignOut();
                }}
                className="rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/stories"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
          >
            Donate now
          </Link>
        </nav>
      </div>
    </header>
  );
}
