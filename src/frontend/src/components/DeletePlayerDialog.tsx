import type { Player } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeletePlayer } from "@/hooks/useQueries";

interface DeletePlayerDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePlayerDialog({
  player,
  open,
  onOpenChange,
}: DeletePlayerDialogProps) {
  const deletePlayer = useDeletePlayer();

  const handleConfirm = async () => {
    if (!player) return;
    try {
      await deletePlayer.mutateAsync(player.id);
      onOpenChange(false);
    } catch {
      // error handled by react-query mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-sidebar-card text-sidebar-foreground">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pemain</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data pemain{" "}
            <span className="font-semibold text-sidebar-foreground">
              {player?.namaLengkap}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePlayer.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deletePlayer.isPending}
            className="bg-sidebar-destructive text-sidebar-destructive-foreground hover:bg-sidebar-destructive/90"
          >
            {deletePlayer.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
