import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, HandHeart, ShieldCheck, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { CampaignCard } from "@/components/campaign-card";
import { campaignsQuery, impactStatsQuery, testimoniesQuery } from "@/lib/queries";
import { formatUsd, fundingMath } from "@/lib/format";
import heroAsset from "@/assets/hero.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compassion Beyond Borders — Fund real stories, in real time" },
      {
        name: "description",
        content:
          "Read the real stories of people who need financial help, see exactly how much is still missing in USD, and give directly to the case that moves you.",
      },
      { property: "og:title", content: "Compassion Beyond Borders Foundation" },
      {
        property: "og:description",
        content:
          "Real people, real amounts, real outcomes. Fund medical care, education, housing and emergencies worldwide.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(campaignsQuery),
      context.queryClient.ensureQueryData(impactStatsQuery),
      context.queryClient.ensureQueryData(testimoniesQuery),
    ]);
  },
  component: Index,
});

function Index() {
  const { data: campaigns } = useSuspenseQuery(campaignsQuery);
  const { data: stats } = useSuspenseQuery(impactStatsQuery);
  const { data: testimonies } = useSuspenseQuery(testimoniesQuery);

  const urgent = campaigns.filter((c) => !fundingMath(c).isFullyFunded).slice(0, 3);
  const nearlyThere = campaigns
    .filter((c) => {
      const m = fundingMath(c);
      return !m.isFullyFunded && m.percent >= 60;
    })
    .slice(0, 3);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <img
          src={heroAsset.url}
          alt="Hands of many people joined together"
          width={1600}
          height={1000}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Compassion Beyond Borders Foundation
          </h1>
          <p className="mt-5 max-w-3xl text-xl font-medium leading-snug text-ink-foreground/85">
            Somebody, somewhere, is short of the exact amount you can give.
          </p>
          <p className="mt-4 max-w-2xl text-lg text-ink-foreground/80">
            We publish real stories in full — the person, the need, the amount already
            raised, and the amount still missing. Every campaign closes when it is met.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/stories"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Find a story to fund <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to="/testimonies"
              className="inline-flex items-center gap-2 rounded-md border border-ink-foreground/25 px-6 py-3.5 text-sm font-semibold text-ink-foreground transition-colors hover:bg-ink-foreground/10"
            >
              See who you have already helped
            </Link>
          </div>

          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-ink-foreground/15 pt-10 md:grid-cols-4">
            {[
              { label: "Raised on this platform", value: formatUsd(stats.totalRaisedCents) },
              { label: "People helped", value: `${stats.livesHelped}+` },
              { label: "Countries reached", value: `${stats.countries}` },
              { label: "Campaigns completed", value: `${stats.campaignsFunded}` },
            ].map((s) => (
              <div key={s.label}>
                <dd className="font-display text-3xl text-accent md:text-4xl">{s.value}</dd>
                <dt className="mt-1 text-xs uppercase tracking-wide text-ink-foreground/60">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Urgent stories */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Open right now
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl">Stories waiting on the rest of the money</h2>
          </div>
          <Link
            to="/stories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View all {campaigns.length} stories <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {urgent.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} eager={i === 0} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-secondary/50 grain">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 className="text-3xl md:text-4xl">How your money reaches a person</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "A case is verified",
                body: "Our field partners meet the family, verify the hospital bill, school invoice or builder's quote, and record what the family has already raised themselves.",
              },
              {
                icon: HandHeart,
                title: "The gap is published",
                body: "We publish the full story with a photo and one number: the amount still missing. Some cases need everything. Many need only the last part.",
              },
              {
                icon: ShieldCheck,
                title: "It is paid directly",
                body: "Funds are paid to the hospital, school or supplier — never in cash — and we post updates on the story until it closes.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-xl border border-border bg-card p-7 shadow-lift">
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearly there */}
      {nearlyThere.length ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Almost closed
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl md:text-4xl">
            These families found most of the money themselves. A small amount finishes it.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nearlyThere.map((c) => (
              <CampaignCard key={c.id} campaign={c} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Testimonies */}
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                In their own words
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl">People who were helped by strangers</h2>
            </div>
            <Link
              to="/testimonies"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              All testimonies <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonies.slice(0, 3).map((t) => (
              <figure
                key={t.id}
                className="flex flex-col rounded-xl border border-ink-foreground/12 bg-ink-foreground/5 p-6"
              >
                <img
                  src={t.image_url}
                  alt={t.person_name}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="size-16 rounded-full object-cover"
                />
                <blockquote className="mt-5 font-display text-xl leading-snug">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 text-sm text-ink-foreground/60">
                  <span className="block font-semibold text-ink-foreground">{t.person_name}</span>
                  {t.location}
                  {t.helped_year ? ` · helped in ${t.helped_year}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl md:text-4xl">
          You do not have to fund a whole story to change one.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          $25 buys a week of a child's medication. $100 closes the last gap on a family's roof.
          Choose a story and give what you can, in USD.
        </p>
        <Link
          to="/stories"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse all stories <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </PublicLayout>
  );
}
