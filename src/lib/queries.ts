import { queryOptions } from "@tanstack/react-query";
import {
  getCampaign,
  getImpactStats,
  listCampaigns,
  listTestimonies,
} from "./campaigns.functions";

export const campaignsQuery = queryOptions({
  queryKey: ["campaigns"],
  queryFn: () => listCampaigns(),
});

export const testimoniesQuery = queryOptions({
  queryKey: ["testimonies"],
  queryFn: () => listTestimonies(),
});

export const impactStatsQuery = queryOptions({
  queryKey: ["impact-stats"],
  queryFn: () => getImpactStats(),
});

export const campaignQuery = (slug: string) =>
  queryOptions({
    queryKey: ["campaign", slug],
    queryFn: () => getCampaign({ data: { slug } }),
  });
