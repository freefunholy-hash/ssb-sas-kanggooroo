import type { ExternalBlob } from "@/backend";
import { Position } from "@/backend";
import type { Player } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — PlayerCard
 *
 * A clean white card roster entry: player photo (with a soft blue-tinted
 * fallback), name, position badge, NISN, and squad number. Clicking the card
 * opens the detail modal (handled by the parent via onClick). The photo is
 * an ExternalBlob at runtime — the bindgen layer converts the backend
 * FileReference (Uint8Array) into an ExternalBlob with getDirectURL(), so we
 * cast through unknown to reach it.
 * ------------------------------------------------------------------------- */

const POSITION_LABEL: Record<Position, string> = {
  [Position.GK]: "Kiper",
  [Position.DF]: "Bek",
  [Position.MF]: "Gelandang",
  [Position.FW]: "Penyerang",
};

const POSITION_SHORT: Record<Position, string> = {
  [Position.GK]: "GK",
  [Position.DF]: "DF",
  [Position.MF]: "MF",
  [Position.FW]: "FW",
};

/** Safely read a backend FileReference as an ExternalBlob for inline display. */
function toExternalBlob(ref: Uint8Array): ExternalBlob | null {
  const blob = ref as unknown as Partial<ExternalBlob>;
  if (blob && typeof blob.getDirectURL === "function") {
    return blob as ExternalBlob;
  }
  return null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export interface PlayerCardProps {
  player: Player;
  index: number;
  onClick: (player: Player) => void;
}

export default function PlayerCard({
  player,
  index,
  onClick,
}: PlayerCardProps) {
  const fotoBlob = toExternalBlob(player.foto);
  const fotoUrl = fotoBlob?.getDirectURL();
  const initials = getInitials(player.namaLengkap);
  const posisiLabel = POSITION_LABEL[player.posisi];
  const posisiShort = POSITION_SHORT[player.posisi];

  return (
    <Card
      data-ocid={`registry.card.${index + 1}`}
      onClick={() => onClick(player)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(player);
        }
      }}
      tabIndex={0}
      aria-label={`Lihat detail pemain ${player.namaLengkap}`}
      className={cn(
        "group relative cursor-pointer overflow-hidden p-0",
        "border-border bg-card shadow-subtle transition-smooth",
        "hover:-translate-y-1 hover:shadow-elevated focus-visible:-translate-y-1 focus-visible:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {/* Photo zone — clean white card with soft blue-tinted fallback */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/40">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={`Foto ${player.namaLengkap}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl font-bold text-primary/30">
              {initials}
            </span>
          </div>
        )}

        {/* Squad number chip — top-left, reads well on white */}
        <span
          className="absolute left-3 top-3 inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-primary px-2 font-stat text-sm font-bold text-primary-foreground shadow-subtle"
          aria-label={`Nomor punggung ${player.nomorPunggung.toString()}`}
        >
          {player.nomorPunggung.toString()}
        </span>

        {/* Position badge — top-right, accent green on white */}
        <Badge
          className="absolute right-3 top-3 rounded-full bg-accent/95 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground shadow-subtle"
          data-ocid={`registry.card.${index + 1}.position_badge`}
        >
          {posisiShort} · {posisiLabel}
        </Badge>
      </div>

      {/* Info zone — on white card */}
      <div className="flex flex-col gap-1.5 p-4">
        <h3
          className="font-display text-base font-bold leading-tight text-foreground line-clamp-1"
          title={player.namaLengkap}
        >
          {player.namaLengkap}
        </h3>
        <p className="text-xs text-muted-foreground">
          Posisi:{" "}
          <span className="font-medium text-foreground">{posisiLabel}</span>
        </p>
        <p
          className="font-stat text-xs text-muted-foreground"
          aria-label={`NISN ${player.nisn}`}
        >
          NISN: {player.nisn || "—"}
        </p>
      </div>
    </Card>
  );
}

export { POSITION_LABEL, POSITION_SHORT, toExternalBlob, getInitials };
