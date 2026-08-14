import { DocumentType, type ExternalBlob, Position } from "@/backend";
import type { Document, Player, PlayerUpdate } from "@/backend";
import { FileUploadField } from "@/components/FileUploadField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdatePlayer } from "@/hooks/useQueries";
import { useEffect, useRef, useState } from "react";

interface EditPlayerModalProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const POSITION_OPTIONS: { value: Position; label: string }[] = [
  { value: Position.GK, label: "GK - Penjaga Gawang" },
  { value: Position.DF, label: "DF - Bek" },
  { value: Position.MF, label: "MF - Gelandang" },
  { value: Position.FW, label: "FW - Penyerang" },
];

export function EditPlayerModal({
  player,
  open,
  onOpenChange,
}: EditPlayerModalProps) {
  const updatePlayer = useUpdatePlayer();

  const [namaLengkap, setNamaLengkap] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [kontak, setKontak] = useState("");
  const [nisn, setNisn] = useState("");
  const [posisi, setPosisi] = useState<Position>(Position.GK);
  const [nomorPunggung, setNomorPunggung] = useState("");
  const [golonganDarah, setGolonganDarah] = useState("");
  const [alergi, setAlergi] = useState("");
  const [kondisiKhusus, setKondisiKhusus] = useState("");
  const [riwayatCedera, setRiwayatCedera] = useState("");
  const [gol, setGol] = useState("");
  const [assist, setAssist] = useState("");
  const [pertandingan, setPertandingan] = useState("");

  const fotoBlobRef = useRef<ExternalBlob | null>(null);
  const dokumenKKRef = useRef<ExternalBlob | null>(null);
  const dokumenAktaRef = useRef<ExternalBlob | null>(null);
  const dokumenIjazahRef = useRef<ExternalBlob | null>(null);

  useEffect(() => {
    if (player && open) {
      setNamaLengkap(player.namaLengkap);
      setTanggalLahir(player.tanggalLahir);
      setAlamat(player.alamat);
      setKontak(player.kontak);
      setNisn(player.nisn ?? "");
      setPosisi(player.posisi);
      setNomorPunggung(player.nomorPunggung.toString());
      setGolonganDarah(player.riwayatMedis.golonganDarah ?? "");
      setAlergi(player.riwayatMedis.alergi ?? "");
      setKondisiKhusus(player.riwayatMedis.kondisiKhusus ?? "");
      setRiwayatCedera(player.riwayatMedis.riwayatCedera ?? "");
      setGol(player.statistik.gol.toString());
      setAssist(player.statistik.assist.toString());
      setPertandingan(player.statistik.pertandingan.toString());
    }
  }, [player, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    const update: PlayerUpdate = {};

    if (namaLengkap !== player.namaLengkap) update.namaLengkap = namaLengkap;
    if (tanggalLahir !== player.tanggalLahir)
      update.tanggalLahir = tanggalLahir;
    if (alamat !== player.alamat) update.alamat = alamat;
    if (kontak !== player.kontak) update.kontak = kontak;
    if (nisn !== (player.nisn ?? "")) update.nisn = nisn;
    if (posisi !== player.posisi) update.posisi = posisi;
    const newNomorPunggung = BigInt(nomorPunggung || "0");
    if (newNomorPunggung !== player.nomorPunggung)
      update.nomorPunggung = newNomorPunggung;

    const newGol = BigInt(gol || "0");
    const newAssist = BigInt(assist || "0");
    const newPertandingan = BigInt(pertandingan || "0");
    if (
      newGol !== player.statistik.gol ||
      newAssist !== player.statistik.assist ||
      newPertandingan !== player.statistik.pertandingan
    ) {
      update.statistik = {
        gol: newGol,
        assist: newAssist,
        pertandingan: newPertandingan,
      };
    }

    const newRiwayatMedis = {
      golonganDarah,
      alergi,
      kondisiKhusus,
      riwayatCedera,
    };
    const oldRiwayatMedis = player.riwayatMedis;
    if (
      newRiwayatMedis.golonganDarah !== (oldRiwayatMedis.golonganDarah ?? "") ||
      newRiwayatMedis.alergi !== (oldRiwayatMedis.alergi ?? "") ||
      newRiwayatMedis.kondisiKhusus !== (oldRiwayatMedis.kondisiKhusus ?? "") ||
      newRiwayatMedis.riwayatCedera !== (oldRiwayatMedis.riwayatCedera ?? "")
    ) {
      update.riwayatMedis = newRiwayatMedis;
    }

    if (fotoBlobRef.current) {
      update.foto = await fotoBlobRef.current.getBytes();
    }

    const dokumen: Document[] = [];
    if (dokumenKKRef.current) {
      dokumen.push({
        tipe: DocumentType.KK,
        fileName: dokumenKKRef.current.filename ?? "KK",
        fileReference: await dokumenKKRef.current.getBytes(),
      });
    }
    if (dokumenAktaRef.current) {
      dokumen.push({
        tipe: DocumentType.Akta,
        fileName: dokumenAktaRef.current.filename ?? "Akta",
        fileReference: await dokumenAktaRef.current.getBytes(),
      });
    }
    if (dokumenIjazahRef.current) {
      dokumen.push({
        tipe: DocumentType.Ijazah,
        fileName: dokumenIjazahRef.current.filename ?? "Ijazah",
        fileReference: await dokumenIjazahRef.current.getBytes(),
      });
    }
    if (dokumen.length > 0) {
      update.dokumen = dokumen;
    }

    try {
      await updatePlayer.mutateAsync({ id: player.id, update });
      onOpenChange(false);
    } catch {
      // error handled by react-query mutation state
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-sidebar-card text-sidebar-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Data Pemain</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sidebar-muted-foreground">
              Data Diri
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="namaLengkap">Nama Lengkap</Label>
                <Input
                  id="namaLengkap"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                <Input
                  id="tanggalLahir"
                  value={tanggalLahir}
                  onChange={(e) => setTanggalLahir(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Textarea
                  id="alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kontak">Kontak</Label>
                <Input
                  id="kontak"
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input
                  id="nisn"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="posisi">Posisi</Label>
                <Select
                  value={posisi}
                  onValueChange={(value) => setPosisi(value as Position)}
                >
                  <SelectTrigger id="posisi">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomorPunggung">Nomor Punggung</Label>
                <Input
                  id="nomorPunggung"
                  type="number"
                  min="0"
                  value={nomorPunggung}
                  onChange={(e) => setNomorPunggung(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sidebar-muted-foreground">
              Riwayat Medis
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="golonganDarah">Golongan Darah</Label>
                <Input
                  id="golonganDarah"
                  value={golonganDarah}
                  onChange={(e) => setGolonganDarah(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alergi">Alergi</Label>
                <Input
                  id="alergi"
                  value={alergi}
                  onChange={(e) => setAlergi(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kondisiKhusus">Kondisi Khusus</Label>
                <Input
                  id="kondisiKhusus"
                  value={kondisiKhusus}
                  onChange={(e) => setKondisiKhusus(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="riwayatCedera">Riwayat Cedera</Label>
                <Input
                  id="riwayatCedera"
                  value={riwayatCedera}
                  onChange={(e) => setRiwayatCedera(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sidebar-muted-foreground">
              Statistik
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gol">Gol</Label>
                <Input
                  id="gol"
                  type="number"
                  min="0"
                  value={gol}
                  onChange={(e) => setGol(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assist">Assist</Label>
                <Input
                  id="assist"
                  type="number"
                  min="0"
                  value={assist}
                  onChange={(e) => setAssist(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pertandingan">Pertandingan</Label>
                <Input
                  id="pertandingan"
                  type="number"
                  min="0"
                  value={pertandingan}
                  onChange={(e) => setPertandingan(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sidebar-muted-foreground">
              Foto Pemain
            </h3>
            <FileUploadField
              label="Unggah Foto Baru (opsional)"
              accept="image/*"
              preview={true}
              onFileChange={(blob) => {
                fotoBlobRef.current = blob;
              }}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sidebar-muted-foreground">
              Dokumen
            </h3>
            <p className="text-xs text-sidebar-muted-foreground">
              Unggah dokumen baru untuk menggantikan dokumen lama (opsional).
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileUploadField
                label="Kartu Keluarga (KK)"
                accept="image/*,application/pdf"
                onFileChange={(blob) => {
                  dokumenKKRef.current = blob;
                }}
              />
              <FileUploadField
                label="Akta Kelahiran"
                accept="image/*,application/pdf"
                onFileChange={(blob) => {
                  dokumenAktaRef.current = blob;
                }}
              />
              <FileUploadField
                label="Ijazah"
                accept="image/*,application/pdf"
                onFileChange={(blob) => {
                  dokumenIjazahRef.current = blob;
                }}
              />
            </div>
          </section>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePlayer.isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={updatePlayer.isPending}>
              {updatePlayer.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
