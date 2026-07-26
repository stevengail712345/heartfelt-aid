import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, PageHero } from "@/components/public-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — Compassion Beyond Borders Foundation" },
      {
        name: "description",
        content:
          "Compassion Beyond Borders is a small international foundation that verifies individual cases of financial hardship and publishes them honestly, in USD.",
      },
      { property: "og:title", content: "About Compassion Beyond Borders Foundation" },
      {
        property: "og:description",
        content: "How we find, verify and publish the stories we ask you to fund.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="About us"
        title="A small foundation with one rule: tell the truth about the money."
      />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 text-lg leading-relaxed text-muted-foreground sm:px-6">
        <p>
          Compassion Beyond Borders began in 2016 when a group of nurses, teachers and
          engineers across four continents pooled money to cover a single hospital bill
          for a stranger. The bill was $1,840. The family had already found $1,100 of it.
          We only had to close a gap.
        </p>
        <p className="text-foreground">
          That is still the whole idea. Most people in crisis are not asking for
          everything. They are asking for the part they could not reach.
        </p>
        <p>
          Today we work with local partners — clinics, head teachers, parish workers and
          community associations — in more than twenty countries. They bring us cases.
          We verify the documents: the hospital estimate, the school invoice, the
          builder's quote, the pharmacy receipt. We ask what the family has already
          raised and we publish that number too, because it belongs in the story.
        </p>

        <h2 className="pt-6 font-display text-3xl text-foreground">What we will never do</h2>
        <ul className="list-disc space-y-3 pl-6">
          <li>We do not hand over cash. Funds go to the hospital, school or supplier.</li>
          <li>We do not publish a person's story without their informed consent.</li>
          <li>We do not leave a campaign open after it has been met.</li>
          <li>We do not use photographs that a family would be ashamed to see.</li>
        </ul>

        <h2 className="pt-6 font-display text-3xl text-foreground">Who we are</h2>
        <p>
          The foundation is run by eleven staff across Nairobi, Manila, Lima and Utrecht,
          supported by more than two hundred volunteer verifiers. Our board publishes an
          annual report and our accounts are independently reviewed each year.
        </p>

        <div className="rounded-xl border border-border bg-secondary/60 p-7 text-base text-foreground">
          <p className="font-display text-2xl">Want to see the numbers instead?</p>
          <p className="mt-2 text-muted-foreground">
            Our transparency page breaks down exactly where each dollar goes.
          </p>
          <Link
            to="/transparency"
            className="mt-5 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View the breakdown
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
