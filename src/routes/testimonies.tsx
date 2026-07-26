import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/public-layout";
import { testimoniesQuery } from "@/lib/queries";

export const Route = createFileRoute("/testimonies")({
  head: () => ({
    meta: [
      { title: "Testimonies — Compassion Beyond Borders" },
      {
        name: "description",
        content:
          "Families and individuals who received help through Compassion Beyond Borders tell what happened next, in their own words.",
      },
      { property: "og:title", content: "Testimonies — Compassion Beyond Borders" },
      {
        property: "og:description",
        content: "What happened after the money arrived, told by the people who received it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(testimoniesQuery),
  component: TestimoniesPage,
});

function TestimoniesPage() {
  const { data: testimonies } = useSuspenseQuery(testimoniesQuery);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="After the gift"
        title="The people you helped, telling you what happened next."
        description="We go back to every family months later. These are their words, published with their permission."
      />

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6 md:py-24">
        {testimonies.map((t, i) => (
          <article
            key={t.id}
            className={`grid items-start gap-8 md:grid-cols-[minmax(0,320px)_1fr] ${
              i % 2 === 1 ? "md:[&>figure]:order-2" : ""
            }`}
          >
            <figure className="overflow-hidden rounded-xl border border-border bg-card shadow-lift">
              <img
                src={t.image_url}
                alt={t.person_name}
                width={900}
                height={900}
                loading={i === 0 ? "eager" : "lazy"}
                className="aspect-square w-full object-cover"
              />
              <figcaption className="p-4 text-sm">
                <span className="block font-semibold">{t.person_name}</span>
                <span className="text-muted-foreground">
                  {t.location}
                  {t.helped_year ? ` · helped in ${t.helped_year}` : ""}
                </span>
              </figcaption>
            </figure>

            <div>
              <blockquote className="font-display text-2xl leading-snug md:text-3xl">
                “{t.quote}”
              </blockquote>
              {t.body ? (
                <div className="mt-6 space-y-4 text-muted-foreground">
                  {t.body.split("\n\n").map((p, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              ) : null}
              {t.campaign_slug ? (
                <Link
                  to="/stories/$slug"
                  params={{ slug: t.campaign_slug }}
                  className="mt-6 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Read the original story →
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </PublicLayout>
  );
}
