import { DocumentType, ExternalBlob, Position } from "@/backend";
import type { Document, Player } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useGeneratePlayerPDF } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  HeartPulse,
  Loader2,
  MapPin,
  Phone,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { POSITION_LABEL, toExternalBlob } from "./PlayerCard";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — PlayerDetailModal
 *
 * Full player profile in a Dialog: photo, data diri, NISN, posisi, nomor
 * punggung, statistik, riwayat medis, and dokumen identitas (download links
 * from object-storage). Includes a "Cetak / Unduh PDF" button that calls
 * the backend PDF generator and downloads the resulting Blob.
 * ------------------------------------------------------------------------- */

const DOCUMENT_LABEL: Record<DocumentType, string> = {
  [DocumentType.KK]: "Kartu Keluarga",
  [DocumentType.Akta]: "Akta Kelahiran",
  [DocumentType.Ijazah]: "Ijazah",
};

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Download an ExternalBlob-backed document with its original filename. */
async function downloadDocument(doc: Document) {
  const blob = toExternalBlob(doc.fileReference);
  if (!blob) return;
  const bytes = await blob.getBytes();
  const file = new Blob([bytes as BlobPart]);
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.fileName || DOCUMENT_LABEL[doc.tipe];
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 text-center">
      <span className="font-stat text-2xl font-bold text-foreground">
        {value}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export interface PlayerDetailModalProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PlayerDetailModal({
  player,
  open,
  onOpenChange,
}: PlayerDetailModalProps) {
  const pdfMutation = useGeneratePlayerPDF();
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!player) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent data-ocid="registry.modal" />
      </Dialog>
    );
  }

  const fotoBlob = toExternalBlob(player.foto);
  const fotoUrl = fotoBlob?.getDirectURL();
  const posisiLabel = POSITION_LABEL[player.posisi];

  const handleDownloadPdf = async () => {
    if (!player) return;
    setPdfError(null);
    try {
      const blob = await pdfMutation.mutateAsync(player.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profil-${player.namaLengkap.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "Gagal membuat PDF. Coba lagi.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="registry.modal"
        className="max-h-[90vh] max-w-3xl overflow-hidden p-0"
      >
        {/* Header band — photo + identity */}
        <div className="relative bg-hero-field">
          <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            {/* Photo */}
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border-2 border-card bg-card shadow-elevated sm:h-40 sm:w-40">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={`Foto ${player.namaLengkap}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="font-display text-4xl font-bold text-muted-foreground">
                    {player.namaLengkap.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Identity */}
            <DialogHeader className="flex-1 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {player.posisi} · {posisiLabel}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold text-accent"
                >
                  No. {player.nomorPunggung.toString()}
                </Badge>
              </div>
              <DialogTitle className="font-display text-2xl font-bold tracking-tight text-foreground">
                {player.namaLengkap}
              </DialogTitle>
              <DialogDescription className="font-stat text-sm text-muted-foreground">
                NISN: {player.nisn || "—"}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <Separator />

        {/* Scrollable body */}
        <ScrollArea className="max-h-[55vh]" data-ocid="registry.modal.scroll">
          <div className="flex flex-col gap-6 p-6">
            {/* Data Diri */}
            <section data-ocid="registry.modal.section.data_diri">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                Data Diri
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow label="Nama Lengkap" value={player.namaLengkap} />
                <InfoRow
                  label="Tanggal Lahir"
                  value={formatDate(player.tanggalLahir)}
                />
                <InfoRow label="Alamat" value={player.alamat} />
                <InfoRow label="Kontak" value={player.kontak} />
                <InfoRow label="NISN" value={player.nisn} />
                <InfoRow label="Posisi" value={posisiLabel} />
              </dl>
            </section>

            <Separator />

            {/* Statistik */}
            <section data-ocid="registry.modal.section.statistik">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
                <Trophy className="h-4 w-4 text-accent" />
                Statistik
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <StatChip label="Gol" value={player.statistik.gol.toString()} />
                <StatChip
                  label="Assist"
                  value={player.statistik.assist.toString()}
                />
                <StatChip
                  label="Pertandingan"
                  value={player.statistik.pertandingan.toString()}
                />
              </div>
            </section>

            <Separator />

            {/* Riwayat Medis */}
            <section data-ocid="registry.modal.section.medis">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
                <HeartPulse className="h-4 w-4 text-accent" />
                Riwayat Medis
              </h3>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow
                  label="Golongan Darah"
                  value={player.riwayatMedis.golonganDarah}
                />
                <InfoRow label="Alergi" value={player.riwayatMedis.alergi} />
                <InfoRow
                  label="Kondisi Khusus"
                  value={player.riwayatMedis.kondisiKhusus}
                />
                <InfoRow
                  label="Riwayat Cedera"
                  value={player.riwayatMedis.riwayatCedera}
                />
              </dl>
            </section>

            <Separator />

            {/* Dokumen Identitas */}
            <section data-ocid="registry.modal.section.dokumen">
              <h3 className="mb-1 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-foreground">
                <FileText className="h-4 w-4 text-accent" />
                Dokumen Identitas
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Unduh dokumen terverifikasi pemain dari penyimpanan aman
                akademi.
              </p>
              {player.dokumen.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Belum ada dokumen yang diunggah.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {player.dokumen.map((doc, i) => (
                    <li key={`${doc.tipe}-${i}`}>
                      <button
                        type="button"
                        onClick={() => downloadDocument(doc)}
                        data-ocid={`registry.modal.document.${doc.tipe.toLowerCase()}`}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-left transition-smooth",
                          "hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/15 text-accent">
                            <FileText className="h-4 w-4" />
                          </span>
                          <span className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">
                              {DOCUMENT_LABEL[doc.tipe]}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {doc.fileName || "dokumen"}
                            </span>
                          </span>
                        </span>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </ScrollArea>

        {/* Footer — PDF action */}
        <Separator />
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            PDF berisi data teks + foto pemain saja, diproses oleh backend.
          </p>
          <div className="flex flex-col gap-2 sm:items-end">
            {pdfError && (
              <p
                className="text-xs text-destructive"
                data-ocid="registry.modal.pdf_error"
                role="alert"
              >
                {pdfError}
              </p>
            )}
            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfMutation.isPending}
              data-ocid="registry.modal.pdf_button"
              className="w-full sm:w-auto"
            >
              {pdfMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membuat PDF…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Cetak / Unduh PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
