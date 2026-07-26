import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { FundingBar } from "./funding-bar";
import { categoryLabel, daysLeft, formatUsd, fundingMath } from "@/lib/format";
import type { Campaign } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CampaignCard({ campaign, eager }: { campaign: Campaign; eager?: boolean }) {
  const m = fundingMath(campaign);
  const days = daysLeft(campaign.deadline);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lift transition-all duration-300 hover:-translate-y-1 hover:shadow-deep">
      <Link to="/stories/$slug" params={{ slug: campaign.slug }} className="block overflow-hidden">
        <div className="relative aspect-[3/2] overflow-hidden bg-sand">
          <img
            src={campaign.image_url}
            alt={`${campaign.beneficiary_name} in ${campaign.location}`}
            width={1200}
            height={800}
            loading={eager ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-foreground backdrop-blur">
              {categoryLabel(campaign.category)}
            </span>
            {campaign.is_urgent && !m.isFullyFunded ? (
              <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                Urgent
              </span>
            ) : null}
            {m.isFullyFunded ? (
              <span className="rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-success-foreground">
                Funded
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden />
          {campaign.location}, {campaign.country}
        </p>

        <h3 className="text-xl leading-snug">
          <Link
            to="/stories/$slug"
            params={{ slug: campaign.slug }}
            className="transition-colors hover:text-primary"
          >
            {campaign.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.summary}</p>

        {m.hasFamilyContribution ? (
          <p className="rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
            Family already secured <strong>{formatUsd(m.preSecured)}</strong> of the{" "}
            {formatUsd(m.totalNeed)} needed.
          </p>
        ) : null}

        <div className="mt-auto space-y-3 pt-2">
          <FundingBar campaign={campaign} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{campaign.donor_count} donors</span>
            <span className={cn(days !== null && days <= 30 && "font-semibold text-primary")}>
              {m.isFullyFunded
                ? "Goal reached"
                : days !== null
                  ? `${days} days left`
                  : "Ongoing"}
            </span>
          </div>
          <Link
            to="/stories/$slug"
            params={{ slug: campaign.slug }}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {m.isFullyFunded ? "Read the outcome" : "Read story & donate"}
          </Link>
        </div>
      </div>
    </article>
  );
}
