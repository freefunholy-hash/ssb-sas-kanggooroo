import { Position } from "@/backend";
import type { Player } from "@/backend";
import { AdminPlayerTable } from "@/components/AdminPlayerTable";
import { DeletePlayerDialog } from "@/components/DeletePlayerDialog";
import { EditPlayerModal } from "@/components/EditPlayerModal";
import { Button } from "@/components/ui/button";
import { useGetPlayers, useIsCallerAdmin } from "@/hooks/useQueries";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMemo, useState } from "react";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — AdminDashboardPage (route "/admin")
 *
 * The admin zone keeps its dark sidebar theme (bg-sidebar) for the shell and
 * access-denied states, but the admin table and controls sit on white card
 * surfaces (bg-card) so the working area reads cleanly against the dark
 * chrome.
 * ------------------------------------------------------------------------- */

type PositionFilter = "all" | Position;

const POSITION_LABELS: Record<PositionFilter, string> = {
  all: "Semua",
  [Position.GK]: "GK",
  [Position.DF]: "DF",
  [Position.MF]: "MF",
  [Position.FW]: "FW",
};

const POSITION_FILTERS: PositionFilter[] = [
  "all",
  Position.GK,
  Position.DF,
  Position.MF,
  Position.FW,
];

export default function AdminDashboardPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: players, isLoading: playersLoading } = useGetPlayers();

  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<PositionFilter>("all");
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    return players.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        p.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nisn ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition =
        positionFilter === "all" || p.posisi === positionFilter;
      return matchesSearch && matchesPosition;
    });
  }, [players, searchQuery, positionFilter]);

  const handleEdit = (player: Player) => {
    setEditPlayer(player);
    setEditOpen(true);
  };

  const handleDelete = (player: Player) => {
    setDeletePlayer(player);
    setDeleteOpen(true);
  };

  if (isAdminLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-sidebar">
        <div className="flex flex-col items-center gap-4 text-sidebar-foreground">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sidebar-border border-t-sidebar-primary" />
          <p className="text-sm text-sidebar-muted-foreground">
            Memeriksa akses admin...
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-sidebar px-4">
        <div className="max-w-md rounded-lg border border-sidebar-border bg-sidebar-card p-8 text-center shadow-subtle">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sidebar-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-sidebar-primary"
              role="img"
              aria-label="Ikon login"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-sidebar-foreground">
            Login Diperlukan
          </h2>
          <p className="mb-6 text-sm text-sidebar-muted-foreground">
            Halaman admin hanya dapat diakses oleh admin atau coach. Silakan
            login menggunakan Internet Identity untuk melanjutkan.
          </p>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
          >
            {isLoggingIn ? "Memproses..." : "Login dengan Internet Identity"}
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-sidebar px-4">
        <div className="max-w-md rounded-lg border border-sidebar-border bg-sidebar-card p-8 text-center shadow-subtle">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sidebar-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-sidebar-destructive"
              role="img"
              aria-label="Ikon akses ditolak"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-sidebar-foreground">
            Akses Ditolak
          </h2>
          <p className="text-sm text-sidebar-muted-foreground">
            Halaman ini hanya dapat diakses oleh admin atau coach yang telah
            login melalui Internet Identity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sidebar">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-sidebar-foreground">
            Dashboard Admin SSB Sas Kanggooroo
          </h1>
          <p className="mt-2 text-sm text-sidebar-muted-foreground">
            Kelola data pemain — tambah, edit, dan hapus informasi pemain sepak
            bola.
          </p>
        </header>

        {/* Controls on a white card surface */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-subtle">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                role="img"
                aria-label="Ikon pencarian"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Cari nama atau NISN pemain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {POSITION_FILTERS.map((pos) => (
                <Button
                  key={pos}
                  variant={positionFilter === pos ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPositionFilter(pos)}
                >
                  {POSITION_LABELS[pos]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Admin table on a white card surface */}
        <div className="rounded-2xl border border-border bg-card shadow-subtle">
          {playersLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">
                {players && players.length > 0
                  ? "Tidak ada pemain yang sesuai dengan filter."
                  : "Belum ada data pemain."}
              </p>
            </div>
          ) : (
            <AdminPlayerTable
              players={filteredPlayers}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        <div className="mt-4 text-sm text-sidebar-muted-foreground">
          Menampilkan {filteredPlayers.length} pemain
          {players ? ` dari total ${players.length}` : ""}.
        </div>
      </div>

      <EditPlayerModal
        player={editPlayer}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeletePlayerDialog
        player={deletePlayer}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
