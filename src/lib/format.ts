export function formatUsd(cents: number, opts?: { compact?: boolean }): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: opts?.compact ? "compact" : "standard",
  }).format(dollars);
}

export type FundingMath = {
  totalNeed: number;
  preSecured: number;
  donated: number;
  goal: number;
  raisedTotal: number;
  stillNeeded: number;
  percent: number;
  isFullyFunded: boolean;
  hasFamilyContribution: boolean;
};

export function fundingMath(c: {
  total_need_cents: number;
  pre_secured_cents: number;
  donated_cents: number;
}): FundingMath {
  const totalNeed = Number(c.total_need_cents);
  const preSecured = Number(c.pre_secured_cents);
  const donated = Number(c.donated_cents);
  const goal = Math.max(totalNeed - preSecured, 0);
  const stillNeeded = Math.max(goal - donated, 0);
  const percent = goal > 0 ? Math.min(Math.round((donated / goal) * 100), 100) : 100;
  return {
    totalNeed,
    preSecured,
    donated,
    goal,
    raisedTotal: preSecured + donated,
    stillNeeded,
    percent,
    isFullyFunded: stillNeeded === 0,
    hasFamilyContribution: preSecured > 0,
  };
}

export function daysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(Math.ceil(diff / 86_400_000), 0);
}

export const CATEGORY_LABELS: Record<string, string> = {
  medical: "Medical",
  education: "Education",
  housing: "Housing",
  emergency: "Emergency",
  livelihood: "Livelihood",
  water: "Clean water",
};

export function categoryLabel(value: string): string {
  return CATEGORY_LABELS[value] ?? value;
}
