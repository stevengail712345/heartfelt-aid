import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { impactStatsQuery } from "@/lib/queries";
import { formatUsd } from "@/lib/format";

export const Route = createFileRoute("/transparency")({
  head: () => ({
    meta: [
      { title: "Where the money goes — Compassion Beyond Borders" },
      {
        name: "description",
        content:
          "A plain breakdown of how donations to Compassion Beyond Borders are spent: 91 cents of every dollar reaches the case it was given to.",
      },
      { property: "og:title", content: "Where the money goes" },
      {
        property: "og:description",
        content: "91% direct to cases, 6% verification and field work, 3% administration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(impactStatsQuery),
  component: TransparencyPage,
});

const SPLIT = [
  { label: "Direct to the published case", pct: 91, note: "Paid to hospitals, schools and suppliers." },
  { label: "Verification and field work", pct: 6, note: "Partner visits, documents, follow-up reporting." },
  { label: "Administration", pct: 3, note: "Payment processing, accounting, audit." },
];

function TransparencyPage() {
  const { data: stats } = useSuspenseQuery(impactStatsQuery);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Transparency"
        title="91 cents of every dollar reaches the story you gave it to."
        description="We would rather be boring and honest than inspiring and vague. Here is the whole split."
      />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <dl className="grid gap-6 sm:grid-cols-3">
          {[
            { label: "Total raised", value: formatUsd(stats.totalRaisedCents) },
            { label: "People helped", value: `${stats.livesHelped}+` },
            { label: "Countries", value: `${stats.countries}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-6 shadow-lift">
              <dd className="font-display text-3xl">{s.value}</dd>
              <dt className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-14 space-y-7">
          {SPLIT.map((row) => (
            <div key={row.label}>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold">{row.label}</h2>
                <span className="font-display text-2xl text-primary">{row.pct}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{row.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-4 text-muted-foreground">
          <h2 className="font-display text-3xl text-foreground">What happens to extra money</h2>
          <p>
            When a campaign passes its goal, we close it immediately. Anything received in
            the minutes before closing is moved — with the donor informed by email — to the
            oldest open case in the same category.
          </p>
          <h2 className="pt-4 font-display text-3xl text-foreground">If a case falls through</h2>
          <p>
            Occasionally a patient's condition changes or a family withdraws. We publish an
            update on the story, refund on request, and otherwise redirect the funds to a
            comparable case with the donor's consent.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
