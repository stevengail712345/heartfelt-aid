import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Campaign } from "./types";

type AmountRow = {
  id: string;
  total_need_cents: number;
  pre_secured_cents: number;
  donated_cents: number;
};

function clampInt(value: unknown, max = 100_000_000_00): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, max);
}

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { count } = await context.supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    return { isAdmin: Boolean(isAdmin), adminCount: count ?? 0 };
  });

/** Bootstrap: the first signed-in user may claim admin when no admin exists yet. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) throw new Error("An administrator already exists.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("campaigns")
      .select("*")
      .order("total_need_cents", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Campaign[];
  });

export const adminUpdateAmounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { rows: AmountRow[] }) => ({
    rows: (input.rows ?? []).slice(0, 200).map((r) => ({
      id: String(r.id),
      total_need_cents: clampInt(r.total_need_cents),
      pre_secured_cents: clampInt(r.pre_secured_cents),
      donated_cents: clampInt(r.donated_cents),
    })),
  }))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    let updated = 0;
    for (const row of data.rows) {
      const need = row.total_need_cents;
      const pre = Math.min(row.pre_secured_cents, need);
      const goal = Math.max(need - pre, 0);
      const donated = Math.min(row.donated_cents, goal);
      const status = goal > 0 && donated >= goal ? "completed" : "published";
      const { error } = await context.supabase
        .from("campaigns")
        .update({
          total_need_cents: need,
          pre_secured_cents: pre,
          donated_cents: donated,
          status,
        })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      updated += 1;
    }
    return { updated };
  });
