import { Position } from "@/backend";
import type { Player } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

interface AdminPlayerTableProps {
  players: Player[];
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}

const POSITION_LABELS: Record<Position, string> = {
  [Position.GK]: "GK",
  [Position.DF]: "DF",
  [Position.MF]: "MF",
  [Position.FW]: "FW",
};

const POSITION_VARIANTS: Record<
  Position,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [Position.GK]: "default",
  [Position.DF]: "secondary",
  [Position.MF]: "outline",
  [Position.FW]: "destructive",
};

export function AdminPlayerTable({
  players,
  onEdit,
  onDelete,
}: AdminPlayerTableProps) {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const urls: Record<string, string> = {};
    for (const player of players) {
      if (player.foto && player.foto.length > 0) {
        try {
          const fotoBytes = new Uint8Array(player.foto);
          urls[player.id.toString()] = URL.createObjectURL(
            new Blob([fotoBytes]),
          );
        } catch {
          // ignore malformed foto bytes
        }
      }
    }
    setPhotoUrls(urls);
    return () => {
      for (const url of Object.values(urls)) {
        URL.revokeObjectURL(url);
      }
    };
  }, [players]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent/40">
            <TableHead className="w-[80px] text-sidebar-foreground">
              Foto
            </TableHead>
            <TableHead className="text-sidebar-foreground">Nama</TableHead>
            <TableHead className="text-sidebar-foreground">Posisi</TableHead>
            <TableHead className="text-sidebar-foreground">NISN</TableHead>
            <TableHead className="text-sidebar-foreground">
              No. Punggung
            </TableHead>
            <TableHead className="text-right text-sidebar-foreground">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            const photoUrl = photoUrls[player.id.toString()];
            return (
              <TableRow
                key={player.id.toString()}
                className="border-sidebar-border bg-sidebar-card hover:bg-sidebar-accent/30"
              >
                <TableCell>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={player.namaLengkap}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-sidebar-border"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-muted-foreground ring-2 ring-sidebar-border">
                      {player.namaLengkap.charAt(0).toUpperCase()}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-sidebar-foreground">
                  {player.namaLengkap}
                </TableCell>
                <TableCell>
                  <Badge variant={POSITION_VARIANTS[player.posisi]}>
                    {POSITION_LABELS[player.posisi]}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm text-sidebar-muted-foreground">
                  {player.nisn ?? "-"}
                </TableCell>
                <TableCell className="font-semibold text-sidebar-foreground">
                  {player.nomorPunggung.toString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(player)}
                      className="border-sidebar-border bg-sidebar-card text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(player)}
                    >
                      Hapus
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
