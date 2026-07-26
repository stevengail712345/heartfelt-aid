export type Campaign = {
  id: string;
  slug: string;
  title: string;
  beneficiary_name: string;
  location: string;
  country: string;
  category: string;
  summary: string;
  story: string;
  image_url: string;
  total_need_cents: number;
  pre_secured_cents: number;
  donated_cents: number;
  donor_count: number;
  status: string;
  is_urgent: boolean;
  deadline: string | null;
  created_at: string;
};

export type CampaignUpdate = {
  id: string;
  campaign_id: string;
  title: string;
  body: string;
  created_at: string;
};

export type Testimony = {
  id: string;
  person_name: string;
  location: string;
  quote: string;
  body: string | null;
  image_url: string;
  campaign_slug: string | null;
  helped_year: number | null;
  is_published: boolean;
  sort_order: number;
};

export type ImpactStats = {
  totalRaisedCents: number;
  livesHelped: number;
  countries: number;
  campaignsFunded: number;
};
