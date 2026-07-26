import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { CampaignCard } from "@/components/campaign-card";
import { campaignsQuery } from "@/lib/queries";
import { CATEGORY_LABELS, fundingMath } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "Stories to fund — Compassion Beyond Borders" },
      {
        name: "description",
        content:
          "Browse verified fundraising stories from around the world. Each one shows the total needed, what is already raised, and the exact amount still missing in USD.",
      },
      { property: "og:title", content: "Stories to fund — Compassion Beyond Borders" },
      {
        property: "og:description",
        content: "Verified stories of people needing financial help. See the exact gap and give in USD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(campaignsQuery),
  component: StoriesPage,
});

type Filter = "all" | "urgent" | "nearly" | "funded" | string;

function StoriesPage() {
  const { data: campaigns } = useSuspenseQuery(campaignsQuery);
  const [filter, setFilter] = useState<Filter>("all");

  const categories = useMemo(
    () => Array.from(new Set(campaigns.map((c) => c.category))),
    [campaigns],
  );

  const filtered = campaigns.filter((c) => {
    const m = fundingMath(c);
    if (filter === "all") return true;
    if (filter === "urgent") return c.is_urgent && !m.isFullyFunded;
    if (filter === "nearly") return !m.isFullyFunded && m.percent >= 60;
    if (filter === "funded") return m.isFullyFunded;
    return c.category === filter;
  });

  const chips: { value: Filter; label: string }[] = [
    { value: "all", label: `All (${campaigns.length})` },
    { value: "urgent", label: "Urgent" },
    { value: "nearly", label: "Almost complete" },
    { value: "funded", label: "Fully funded" },
    ...categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c })),
  ];

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Fundraising"
        title="Every story here is a real person waiting on a real number."
        description="Some need the full amount. Many have already sold, saved and borrowed their way most of the way there and need only the last part. Choose one."
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter stories">
          {chips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              aria-pressed={filter === chip.value}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === chip.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">
            No stories match this filter right now.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <CampaignCard key={c.id} campaign={c} eager={i < 3} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
