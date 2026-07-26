import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { FundingBar } from "@/components/funding-bar";
import { CampaignCard } from "@/components/campaign-card";
import { campaignQuery, campaignsQuery } from "@/lib/queries";
import { categoryLabel, daysLeft, formatUsd, fundingMath } from "@/lib/format";
import { cn } from "@/lib/utils";

const PRESETS = [25, 50, 100, 250, 500];

export const Route = createFileRoute("/stories/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(campaignQuery(params.slug));
    if (!result) throw notFound();
    await context.queryClient.ensureQueryData(campaignsQuery);
    return result;
  },
  head: ({ loaderData }) => {
    const c = loaderData?.campaign;
    if (!c) return {};
    const m = fundingMath(c);
    const description = `${c.summary} ${
      m.isFullyFunded ? "Fully funded." : `${formatUsd(m.stillNeeded)} still needed.`
    }`;
    return {
      meta: [
        { title: `${c.title} — Compassion Beyond Borders` },
        { name: "description", content: description.slice(0, 158) },
        { property: "og:title", content: c.title },
        { property: "og:description", content: description.slice(0, 158) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StoryPage,
});

function StoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(campaignQuery(slug));
  const { data: all } = useSuspenseQuery(campaignsQuery);
  const [amount, setAmount] = useState<number>(50);
  const [custom, setCustom] = useState("");

  if (!data) return null;
  const { campaign, updates } = data;
  const m = fundingMath(campaign);
  const days = daysLeft(campaign.deadline);
  const related = all.filter((c) => c.id !== campaign.id && c.category === campaign.category).slice(0, 3);

  return (
    <PublicLayout>
      <article>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <Link to="/stories" className="text-sm font-medium text-primary hover:underline">
            ← All stories
          </Link>
        </div>

        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:gap-14">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
                {categoryLabel(campaign.category)}
              </span>
              {campaign.is_urgent && !m.isFullyFunded ? (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  Urgent
                </span>
              ) : null}
              {m.isFullyFunded ? (
                <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold uppercase tracking-wider text-success-foreground">
                  Fully funded
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl leading-[1.05] text-balance-tight md:text-5xl">
              {campaign.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden /> {campaign.location}, {campaign.country}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="size-4" aria-hidden /> {campaign.donor_count} donors
              </span>
              {days !== null && !m.isFullyFunded ? (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden /> {days} days left
                </span>
              ) : null}
            </div>

            <img
              src={campaign.image_url}
              alt={`${campaign.beneficiary_name} in ${campaign.location}`}
              width={1600}
              height={1067}
              className="mt-8 aspect-[3/2] w-full rounded-xl object-cover shadow-lift"
            />

            <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted-foreground">
              {campaign.story.split("\n\n").map((p, i) => (
                <p key={i} className={cn(i === 0 && "text-xl text-foreground")}>
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-10 flex items-start gap-3 rounded-xl border border-border bg-secondary/60 p-6">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <p className="text-sm text-muted-foreground">
                This case was verified in person by our field partner in {campaign.country}.
                Documents on file include the cost estimate and proof of the amount the family
                has already raised. Funds are paid directly to the provider, never in cash.
              </p>
            </div>

            {updates.length ? (
              <section className="mt-14">
                <h2 className="font-display text-3xl">Updates</h2>
                <ol className="mt-6 space-y-6 border-l border-border pl-6">
                  {updates.map((u) => (
                    <li key={u.id} className="relative">
                      <span className="absolute -left-[31px] top-1.5 size-2.5 rounded-full bg-primary" />
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{u.title}</h3>
                      <p className="mt-1.5 text-muted-foreground">{u.body}</p>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          {/* Donation panel */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-xl border border-border bg-card p-6 shadow-lift">
              <p className="font-display text-4xl">{formatUsd(m.donated)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                raised of the {formatUsd(m.goal)} we are asking for
              </p>

              <FundingBar campaign={campaign} showLabels={false} className="mt-5" />

              <dl className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total cost of the need</dt>
                  <dd className="font-medium">{formatUsd(m.totalNeed)}</dd>
                </div>
                {m.hasFamilyContribution ? (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Already secured by the family</dt>
                    <dd className="font-medium text-success">−{formatUsd(m.preSecured)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Donated so far</dt>
                  <dd className="font-medium text-success">−{formatUsd(m.donated)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2.5 text-base">
                  <dt className="font-semibold">Still needed</dt>
                  <dd className="font-display text-2xl text-primary">
                    {formatUsd(m.stillNeeded)}
                  </dd>
                </div>
              </dl>

              {m.isFullyFunded ? (
                <div className="mt-6 rounded-md bg-success/10 p-4 text-sm text-foreground">
                  <p className="font-semibold text-success">This campaign is complete.</p>
                  <p className="mt-1 text-muted-foreground">
                    Thank you. Choose another story to keep the work going.
                  </p>
                  <Link
                    to="/stories"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    Fund another story
                  </Link>
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-sm font-semibold">Choose an amount (USD)</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setAmount(p);
                          setCustom("");
                        }}
                        className={cn(
                          "rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors",
                          amount === p && !custom
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        ${p}
                      </button>
                    ))}
                    <input
                      value={custom}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
                        setCustom(v);
                        if (v) setAmount(Number(v));
                      }}
                      inputMode="numeric"
                      placeholder="Other"
                      aria-label="Custom amount in USD"
                      className="rounded-md border border-border bg-card px-3 py-2.5 text-center text-sm font-semibold outline-none focus:border-primary"
                    />
                  </div>

                  <button
                    disabled={!amount}
                    className="mt-4 w-full rounded-md bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    Donate {amount ? formatUsd(amount * 100) : ""}
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Secure card payment. You will receive a receipt by email.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-3xl">Other {categoryLabel(campaign.category).toLowerCase()} cases</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </PublicLayout>
  );
}
