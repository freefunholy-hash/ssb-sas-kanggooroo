import { Position } from "@/backend";
import type { PlayerStatsSummary } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — StatsSummary
 *
 * Top-of-page summary on a white card surface floating on the blue field:
 * total player count + per-position distribution (GK / DF / MF / FW) as
 * visual stat cards. Reads from useGetPlayerStats.
 * ------------------------------------------------------------------------- */

interface PositionStat {
  key: Position;
  label: string;
  short: string;
  /** Tailwind classes for the accent chip. */
  chipClass: string;
}

const POSITION_STATS: PositionStat[] = [
  {
    key: Position.GK,
    label: "Kiper",
    short: "GK",
    chipClass: "bg-accent/20 text-accent",
  },
  {
    key: Position.DF,
    label: "Bek",
    short: "DF",
    chipClass: "bg-primary/15 text-primary",
  },
  {
    key: Position.MF,
    label: "Gelandang",
    short: "MF",
    chipClass: "bg-accent/20 text-accent",
  },
  {
    key: Position.FW,
    label: "Penyerang",
    short: "FW",
    chipClass: "bg-primary/15 text-primary",
  },
];

export interface StatsSummaryProps {
  stats: PlayerStatsSummary | undefined;
  isLoading: boolean;
}

export default function StatsSummary({ stats, isLoading }: StatsSummaryProps) {
  const total = stats ? stats.totalPemain.toString() : "0";
  const dist = stats?.distribusi;

  return (
    <section
      data-ocid="registry.stats.section"
      className="bg-background"
      aria-labelledby="stats-title"
    >
      <div className="container py-10 md:py-14">
        {/* White card surface holding the stats band */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-subtle md:p-8">
          <h2
            id="stats-title"
            className="font-display text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >
            Ringkasan Roster
          </h2>

          {/* Total + distribution grid */}
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
            {/* Total players — featured card */}
            <div
              data-ocid="registry.stats.total"
              className="col-span-2 flex flex-col justify-center rounded-xl border border-border bg-background/40 p-5 md:col-span-1"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total Pemain
              </span>
              {isLoading ? (
                <Skeleton className="mt-2 h-9 w-20" />
              ) : (
                <span className="mt-1 font-display text-4xl font-bold text-foreground">
                  {total}
                </span>
              )}
              <span className="mt-1 text-xs text-muted-foreground">
                pemain terdaftar
              </span>
            </div>

            {/* Per-position cards */}
            {POSITION_STATS.map((pos) => {
              const count = dist
                ? pos.key === Position.GK
                  ? dist.gk.toString()
                  : pos.key === Position.DF
                    ? dist.df.toString()
                    : pos.key === Position.MF
                      ? dist.mf.toString()
                      : dist.fw.toString()
                : "0";
              return (
                <div
                  key={pos.key}
                  data-ocid={`registry.stats.position.${pos.short.toLowerCase()}`}
                  className="flex flex-col gap-2 rounded-xl border border-border bg-background/40 p-5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
                        pos.chipClass,
                      )}
                    >
                      {pos.short}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {pos.label}
                    </span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <span className="font-stat text-3xl font-bold text-foreground">
                      {count}
                    </span>
                  )}
                  {/* Distribution bar — visual proportion of total */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        pos.key === Position.GK || pos.key === Position.MF
                          ? "bg-accent"
                          : "bg-primary",
                      )}
                      style={{
                        width:
                          stats && stats.totalPemain > 0n
                            ? `${(Number(count) / Number(stats.totalPemain)) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export { POSITION_STATS };
export type { PositionStat };
