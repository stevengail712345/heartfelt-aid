import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PublicLayout } from "@/components/public-layout";
import {
  adminListCampaigns,
  adminUpdateAmounts,
  claimFirstAdmin,
  getAdminStatus,
} from "@/lib/admin.functions";
import { formatUsd } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Funding editor — Compassion Beyond Borders" },
      {
        name: "description",
        content: "Bulk-edit the amount needed, amount raised and remaining gap for every campaign.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Draft = { need: number; donated: number };

/** dollars <-> cents helpers (the editor works in whole dollars) */
const toDollars = (cents: number) => Math.round(cents / 100);
const toCents = (dollars: number) => Math.max(Math.round(dollars) * 100, 0);

function AdminPage() {
  const queryClient = useQueryClient();
  const fetchStatus = useServerFn(getAdminStatus);
  const fetchCampaigns = useServerFn(adminListCampaigns);
  const saveAmounts = useServerFn(adminUpdateAmounts);
  const claim = useServerFn(claimFirstAdmin);

  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => fetchStatus() });
  const campaigns = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: () => fetchCampaigns(),
    enabled: status.data?.isAdmin === true,
  });

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const rows = useMemo(() => {
    return (campaigns.data ?? []).map((c) => {
      const pre = toDollars(c.pre_secured_cents);
      const draft = drafts[c.id];
      const need = draft?.need ?? toDollars(c.total_need_cents);
      const goal = Math.max(need - pre, 0);
      const donated = Math.min(draft?.donated ?? toDollars(c.donated_cents), goal);
      return {
        id: c.id,
        title: c.title,
        beneficiary: c.beneficiary_name,
        pre,
        need,
        goal,
        donated,
        remaining: Math.max(goal - donated, 0),
        dirty:
          need !== toDollars(c.total_need_cents) || donated !== toDollars(c.donated_cents),
      };
    });
  }, [campaigns.data, drafts]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          need: acc.need + r.need,
          goal: acc.goal + r.goal,
          donated: acc.donated + r.donated,
          remaining: acc.remaining + r.remaining,
        }),
        { need: 0, goal: 0, donated: 0, remaining: 0 },
      ),
    [rows],
  );

  const dirtyCount = rows.filter((r) => r.dirty).length;

  function setField(id: string, patch: Partial<Draft>) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setDrafts((prev) => {
      const base = prev[id] ?? { need: row.need, donated: row.donated };
      const next = { ...base, ...patch };
      const goal = Math.max(next.need - row.pre, 0);
      next.donated = Math.min(Math.max(next.donated, 0), goal);
      return { ...prev, [id]: next };
    });
  }

  const save = useMutation({
    mutationFn: () =>
      saveAmounts({
        data: {
          rows: rows
            .filter((r) => r.dirty)
            .map((r) => ({
              id: r.id,
              total_need_cents: toCents(r.need),
              pre_secured_cents: toCents(r.pre),
              donated_cents: toCents(r.donated),
            })),
        },
      }),
    onSuccess: (res) => {
      setDrafts({});
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["impact-stats"] });
      toast.success(`Saved ${res.updated} ${res.updated === 1 ? "story" : "stories"}`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const claimAdmin = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-status"] });
      toast.success("You are now an administrator");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not grant access"),
  });

  if (status.isLoading) {
    return (
      <PublicLayout>
        <p className="mx-auto max-w-6xl px-4 py-24 text-muted-foreground sm:px-6">Loading…</p>
      </PublicLayout>
    );
  }

  if (!status.data?.isAdmin) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
          <h1 className="font-display text-3xl">Admin access required</h1>
          {status.data?.adminCount === 0 ? (
            <>
              <p className="mt-3 text-muted-foreground">
                No administrator exists yet. You can claim the first admin account.
              </p>
              <button
                onClick={() => claimAdmin.mutate()}
                disabled={claimAdmin.isPending}
                className="mt-6 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {claimAdmin.isPending ? "Granting…" : "Make me the administrator"}
              </button>
            </>
          ) : (
            <p className="mt-3 text-muted-foreground">
              Your account does not have administrator rights. Ask an existing admin to add you.
            </p>
          )}
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">Funding editor</h1>
            <p className="mt-2 text-muted-foreground">
              Amounts are in whole US dollars. Remaining always equals needed minus what the
              family already secured minus raised, so the three stay consistent.
            </p>
          </div>
          <button
            onClick={() => save.mutate()}
            disabled={!dirtyCount || save.isPending}
            className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : `Save ${dirtyCount || ""} change${dirtyCount === 1 ? "" : "s"}`}
          </button>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            ["Total needed", totals.need],
            ["Family secured", totals.need - totals.goal],
            ["Raised by donors", totals.donated],
            ["Still needed", totals.remaining],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-xl border border-border bg-card p-4">
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-display text-2xl">{formatUsd((value as number) * 100)}</dd>
            </div>
          ))}
        </dl>

        {campaigns.isLoading ? (
          <p className="mt-10 text-muted-foreground">Loading stories…</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Story</th>
                  <th className="px-4 py-3 font-semibold">Needed ($)</th>
                  <th className="px-4 py-3 font-semibold">Family secured</th>
                  <th className="px-4 py-3 font-semibold">Raised ($)</th>
                  <th className="px-4 py-3 font-semibold">Remaining ($)</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className={r.dirty ? "border-t border-border bg-primary/5" : "border-t border-border"}
                  >
                    <td className="max-w-[280px] px-4 py-2.5">
                      <p className="truncate font-medium">{r.beneficiary}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.title}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        aria-label={`Amount needed for ${r.beneficiary}`}
                        inputMode="numeric"
                        value={r.need}
                        onChange={(e) =>
                          setField(r.id, { need: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })
                        }
                        className="w-28 rounded-md border border-border bg-card px-2 py-1.5 text-right outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatUsd(r.pre * 100)}</td>
                    <td className="px-4 py-2.5">
                      <input
                        aria-label={`Amount raised for ${r.beneficiary}`}
                        inputMode="numeric"
                        value={r.donated}
                        onChange={(e) =>
                          setField(r.id, {
                            donated: Number(e.target.value.replace(/[^0-9]/g, "")) || 0,
                          })
                        }
                        className="w-28 rounded-md border border-border bg-card px-2 py-1.5 text-right outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        aria-label={`Amount remaining for ${r.beneficiary}`}
                        inputMode="numeric"
                        value={r.remaining}
                        onChange={(e) => {
                          const remaining = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
                          setField(r.id, { donated: Math.max(r.goal - remaining, 0) });
                        }}
                        className="w-28 rounded-md border border-border bg-card px-2 py-1.5 text-right outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {r.goal > 0 ? Math.round((r.donated / r.goal) * 100) : 100}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
