import { cn } from "@/lib/utils";
import { formatUsd, fundingMath } from "@/lib/format";

type Props = {
  campaign: {
    total_need_cents: number;
    pre_secured_cents: number;
    donated_cents: number;
  };
  className?: string;
  showLabels?: boolean;
};

export function FundingBar({ campaign, className, showLabels = true }: Props) {
  const m = fundingMath(campaign);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            m.isFullyFunded ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${Math.max(m.percent, 2)}%` }}
          role="progressbar"
          aria-valuenow={m.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Funding progress"
        />
      </div>
      {showLabels ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
          <p className="font-medium">
            <span className="text-foreground">{formatUsd(m.donated)}</span>
            <span className="text-muted-foreground"> raised of {formatUsd(m.goal)}</span>
          </p>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-wide",
              m.isFullyFunded ? "text-success" : "text-primary",
            )}
          >
            {m.isFullyFunded ? "Fully funded" : `${formatUsd(m.stillNeeded)} still needed`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
