import type { Player, Position } from "@/backend";
import PlayerCard from "@/components/PlayerCard";
import PlayerDetailModal from "@/components/PlayerDetailModal";
import SearchFilterBar, {
  POSITION_OPTIONS,
  type PositionFilter,
} from "@/components/SearchFilterBar";
import StatsSummary from "@/components/StatsSummary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFilterPlayers,
  useGetPlayerStats,
  useGetPlayers,
  useSearchPlayers,
} from "@/hooks/useQueries";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — PublicRegistryPage (route "/")
 *
 * Public landing page on the blue field: a simpler blue hero featuring the
 * kangaroo mascot, a white-card stats summary, a white-card search + position
 * filter, and a responsive grid of white player cards. Clicking a card opens
 * a detail modal.
 *
 * Search and filter state is persisted in the URL via TanStack Router search
 * params (`q` and `pos`), so the view survives refresh and is shareable.
 * ------------------------------------------------------------------------- */

/** Route search params — must match the IndexRoute validateSearch schema. */
interface RegistrySearch {
  q?: string;
  pos?: string;
}

/** Parse the `pos` URL param into a PositionFilter. */
function parsePositionFilter(raw: string | undefined): PositionFilter {
  if (!raw || raw === "all") return "all";
  const match = POSITION_OPTIONS.find((o) => o.value === raw);
  return match ? (match.value as PositionFilter) : "all";
}

/** Coerce a PositionFilter to a backend Position, or null for "all". */
function filterToPosition(filter: PositionFilter): Position | null {
  return filter === "all" ? null : (filter as Position);
}

/** Inline kangaroo mascot mark — the official academy logo in a round badge. */
function KangarooMascot() {
  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      {/* Soft halo on the blue field */}
      <div
        className="absolute inset-0 rounded-full bg-accent/20 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-white/80 bg-white/90 p-2.5 shadow-elevated backdrop-blur-sm">
        <img
          src="/assets/logo-ssb-sas-kanggooroo.jpeg"
          alt="Maskot kangguru SSB Sas Kanggooroo"
          className="h-full w-full animate-mascot-bounce rounded-full object-contain"
        />
      </div>
    </div>
  );
}

export default function PublicRegistryPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as RegistrySearch;

  const searchQuery = search.q ?? "";
  const positionFilter = parsePositionFilter(search.pos);

  // Local state mirrors URL for snappy live-typing; URL is the source of
  // truth and is updated on a short debounce via navigate.
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // --- Data hooks ---
  const statsQuery = useGetPlayerStats();
  const allPlayersQuery = useGetPlayers();
  const searchQuery_ = localQuery.trim();
  const positionParam = filterToPosition(positionFilter);

  const searchResults = useSearchPlayers(searchQuery_);
  const filterResults = useFilterPlayers(positionParam);

  /**
   * Resolve the displayed player list:
   *  - If a search query is active, use searchPlayers results (server-side).
   *  - Else if a position filter is active, use filterPlayers results.
   *  - Else use the full getPlayers list.
   * When both search and filter are active, apply the position filter
   * client-side on top of the search results.
   */
  const displayedPlayers: Player[] = useMemo(() => {
    let list: Player[] = [];
    if (searchQuery_) {
      list = searchResults.data ?? [];
    } else if (positionParam) {
      list = filterResults.data ?? [];
    } else {
      list = allPlayersQuery.data ?? [];
    }
    // If both search and position filter are active, filter client-side.
    if (searchQuery_ && positionParam) {
      list = list.filter((p) => p.posisi === positionParam);
    }
    return list;
  }, [
    searchQuery_,
    positionParam,
    searchResults.data,
    filterResults.data,
    allPlayersQuery.data,
  ]);

  // --- URL persistence ---
  const updateUrl = (nextQ: string, nextPos: PositionFilter) => {
    navigate({
      to: "/",
      search: {
        q: nextQ,
        pos: nextPos === "all" ? "all" : nextPos,
      },
      replace: true,
    });
  };

  const handleSearchChange = (value: string) => {
    setLocalQuery(value);
    updateUrl(value, positionFilter);
  };

  const handlePositionChange = (value: PositionFilter) => {
    updateUrl(localQuery, value);
  };

  const handleCardClick = (player: Player) => {
    setSelectedPlayer(player);
    setModalOpen(true);
  };

  // --- Loading / empty states ---
  const isInitialLoading =
    !searchQuery_ && !positionParam
      ? allPlayersQuery.isLoading
      : searchQuery_
        ? searchResults.isLoading
        : filterResults.isLoading;

  const showSkeletons = isInitialLoading && displayedPlayers.length === 0;
  const showEmpty = !isInitialLoading && displayedPlayers.length === 0;

  return (
    <div data-ocid="page.registry" className="flex flex-col">
      {/* Hero — simpler blue gradient with prominent kangaroo mascot */}
      <section className="bg-hero-field" aria-labelledby="registry-hero-title">
        <div className="container py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Copy */}
            <div className="animate-fade-in-up text-center md:text-left">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent shadow-subtle">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                SSB Sas Kanggooroo
              </span>
              <h1
                id="registry-hero-title"
                className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl"
              >
                Pemain Terdaftar
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90 md:mx-0">
                Jelajahi roster pemain akademi SSB Sas Kanggooroo. Pendaftaran
                terbuka untuk umum — daftarkan pemain baru tanpa perlu login.
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <a href="/daftar">
                  <Button
                    data-ocid="registry.daftar_button"
                    size="lg"
                    className="rounded-full"
                  >
                    Tambah Pemain
                  </Button>
                </a>
              </div>
            </div>

            {/* Mascot */}
            <div className="animate-fade-in">
              <KangarooMascot />
            </div>
          </div>
        </div>
      </section>

      {/* Stats summary — white card on blue field */}
      <StatsSummary stats={statsQuery.data} isLoading={statsQuery.isLoading} />

      {/* Search + filter + grid — white card surfaces on blue background */}
      <section
        className="bg-background"
        aria-labelledby="registry-roster-title"
      >
        <div className="container py-12 md:py-16">
          <h2
            id="registry-roster-title"
            className="mb-6 flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-white"
          >
            <Users className="h-6 w-6 text-accent" />
            Daftar Pemain
          </h2>

          {/* Search + filter inside a white card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-subtle md:p-6">
            <SearchFilterBar
              searchQuery={localQuery}
              onSearchChange={handleSearchChange}
              positionFilter={positionFilter}
              onPositionChange={handlePositionChange}
              resultCount={displayedPlayers.length}
            />
          </div>

          {/* Grid */}
          <div className="mt-8">
            {showSkeletons ? (
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                data-ocid="registry.loading_state"
              >
                {[
                  "sk-1",
                  "sk-2",
                  "sk-3",
                  "sk-4",
                  "sk-5",
                  "sk-6",
                  "sk-7",
                  "sk-8",
                  "sk-9",
                  "sk-10",
                ].map((skId) => (
                  <div
                    key={skId}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-subtle"
                  >
                    <Skeleton className="aspect-[4/5] w-full rounded-none" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : showEmpty ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center shadow-subtle"
                data-ocid="registry.empty_state"
              >
                <Users className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                  Tidak ada pemain ditemukan
                </h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {searchQuery_ || positionParam
                    ? "Coba ubah kata kunci pencarian atau filter posisi."
                    : "Belum ada pemain yang terdaftar. Daftarkan pemain pertama Anda."}
                </p>
                {!searchQuery_ && !positionParam && (
                  <a href="/daftar" className="mt-6">
                    <Button data-ocid="registry.empty_state.daftar_button">
                      Tambah Pemain
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                data-ocid="registry.grid"
              >
                {displayedPlayers.map((player, i) => (
                  <PlayerCard
                    key={player.id.toString()}
                    player={player}
                    index={i}
                    onClick={handleCardClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detail modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
