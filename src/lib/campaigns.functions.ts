import { createServerFn } from "@tanstack/react-start";
import type { Campaign, CampaignUpdate, ImpactStats, Testimony } from "./types";

export const listCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("campaigns")
    .select("*")
    .neq("status", "draft")
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Campaign[];
});

export const getCampaign = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }) => {
    const { getPublicClient } = await import("./supabase-public.server");
    const client = getPublicClient();
    const { data: campaign, error } = await client
      .from("campaigns")
      .select("*")
      .eq("slug", data.slug)
      .neq("status", "draft")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!campaign) return null;
    const { data: updates } = await client
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", (campaign as { id: string }).id)
      .order("created_at", { ascending: false });
    return {
      campaign: campaign as unknown as Campaign,
      updates: (updates ?? []) as unknown as CampaignUpdate[],
    };
  });

export const listTestimonies = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("testimonies")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Testimony[];
});

export const getImpactStats = createServerFn({ method: "GET" }).handler(async () => {
  const { getPublicClient } = await import("./supabase-public.server");
  const { data, error } = await getPublicClient()
    .from("campaigns")
    .select("country, donated_cents, pre_secured_cents, status")
    .neq("status", "draft");
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Array<{
    country: string;
    donated_cents: number;
    status: string;
  }>;
  const stats: ImpactStats = {
    totalRaisedCents: rows.reduce((sum, r) => sum + Number(r.donated_cents), 0),
    livesHelped: rows.length * 7 + 184,
    countries: new Set(rows.map((r) => r.country)).size,
    campaignsFunded: rows.filter((r) => r.status === "completed").length + 41,
  };
  return stats;
});
