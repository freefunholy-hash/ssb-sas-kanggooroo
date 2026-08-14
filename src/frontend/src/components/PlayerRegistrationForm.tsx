import {
  DocumentType,
  type ExternalBlob,
  type PlayerInput,
  Position,
} from "@/backend";
import { FileUploadField } from "@/components/FileUploadField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAddPlayer } from "@/hooks/useQueries";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface DocumentEntry {
  tipe: DocumentType;
  fileName: string;
  fileReference: Uint8Array;
}

interface FormValues {
  namaLengkap: string;
  tanggalLahir: string;
  alamat: string;
  kontak: string;
  nisn: string;
  posisi: string;
  nomorPunggung: string;
  golonganDarah: string;
  alergi: string;
  kondisiKhusus: string;
  riwayatCedera: string;
  gol: string;
  assist: string;
  pertandingan: string;
}

const POSISI_OPTIONS: { value: string; label: string }[] = [
  { value: String(Position.GK), label: "Kiper" },
  { value: String(Position.DF), label: "Bek" },
  { value: String(Position.MF), label: "Gelandang" },
  { value: String(Position.FW), label: "Penyerang" },
];

const GOLONGAN_DARAH_OPTIONS = ["A", "B", "AB", "O"];

export function PlayerRegistrationForm() {
  const { mutate, isPending } = useAddPlayer();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      namaLengkap: "",
      tanggalLahir: "",
      alamat: "",
      kontak: "",
      nisn: "",
      posisi: "",
      nomorPunggung: "",
      golonganDarah: "",
      alergi: "",
      kondisiKhusus: "",
      riwayatCedera: "",
      gol: "0",
      assist: "0",
      pertandingan: "0",
    },
  });

  const fotoRef = { current: null as ExternalBlob | null };
  const dokumenRefs = {
    KK: { current: null as ExternalBlob | null },
    Akta: { current: null as ExternalBlob | null },
    Ijazah: { current: null as ExternalBlob | null },
  };

  const onSubmit = async (data: FormValues) => {
    const dokumen: DocumentEntry[] = [];
    if (dokumenRefs.KK.current) {
      dokumen.push({
        tipe: DocumentType.KK,
        fileName: dokumenRefs.KK.current.filename ?? "KK",
        fileReference: await dokumenRefs.KK.current.getBytes(),
      });
    }
    if (dokumenRefs.Akta.current) {
      dokumen.push({
        tipe: DocumentType.Akta,
        fileName: dokumenRefs.Akta.current.filename ?? "Akta",
        fileReference: await dokumenRefs.Akta.current.getBytes(),
      });
    }
    if (dokumenRefs.Ijazah.current) {
      dokumen.push({
        tipe: DocumentType.Ijazah,
        fileName: dokumenRefs.Ijazah.current.filename ?? "Ijazah",
        fileReference: await dokumenRefs.Ijazah.current.getBytes(),
      });
    }

    const playerInput: PlayerInput = {
      namaLengkap: data.namaLengkap,
      tanggalLahir: data.tanggalLahir,
      alamat: data.alamat,
      kontak: data.kontak,
      nisn: data.nisn,
      posisi: data.posisi as Position,
      nomorPunggung: BigInt(data.nomorPunggung || "0"),
      foto: fotoRef.current
        ? await fotoRef.current.getBytes()
        : new Uint8Array(),
      dokumen,
      statistik: {
        gol: BigInt(data.gol || "0"),
        assist: BigInt(data.assist || "0"),
        pertandingan: BigInt(data.pertandingan || "0"),
      },
      riwayatMedis: {
        golonganDarah: data.golonganDarah,
        alergi: data.alergi,
        kondisiKhusus: data.kondisiKhusus,
        riwayatCedera: data.riwayatCedera,
      },
    };

    mutate(playerInput, {
      onSuccess: () => {
        toast.success("Pendaftaran pemain berhasil disimpan!");
        reset();
        fotoRef.current = null;
        dokumenRefs.KK.current = null;
        dokumenRefs.Akta.current = null;
        dokumenRefs.Ijazah.current = null;
      },
      onError: (err) => {
        console.error(err);
        toast.error("Gagal menyimpan pendaftaran. Silakan coba lagi.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: Data Diri */}
      <Card>
        <CardHeader>
          <CardTitle>Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="namaLengkap">Nama Lengkap</Label>
            <Input
              id="namaLengkap"
              {...register("namaLengkap", { required: true })}
            />
            {errors.namaLengkap && (
              <p className="text-xs text-destructive">Nama wajib diisi</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
            <Input
              id="tanggalLahir"
              type="date"
              {...register("tanggalLahir", { required: true })}
            />
            {errors.tanggalLahir && (
              <p className="text-xs text-destructive">
                Tanggal lahir wajib diisi
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="kontak">Kontak</Label>
            <Input
              id="kontak"
              {...register("kontak", { required: true })}
              placeholder="No. HP / WhatsApp"
            />
            {errors.kontak && (
              <p className="text-xs text-destructive">Kontak wajib diisi</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              {...register("alamat", { required: true })}
              rows={3}
            />
            {errors.alamat && (
              <p className="text-xs text-destructive">Alamat wajib diisi</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nisn">NISN</Label>
            <Input
              id="nisn"
              className="font-mono"
              {...register("nisn", { required: true })}
            />
            {errors.nisn && (
              <p className="text-xs text-destructive">NISN wajib diisi</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomorPunggung">Nomor Punggung</Label>
            <Input
              id="nomorPunggung"
              type="number"
              min={0}
              {...register("nomorPunggung", { required: true })}
            />
            {errors.nomorPunggung && (
              <p className="text-xs text-destructive">
                Nomor punggung wajib diisi
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="posisi">Posisi</Label>
            <Select
              value={watch("posisi")}
              onValueChange={(v) => setValue("posisi", v)}
            >
              <SelectTrigger id="posisi">
                <SelectValue placeholder="Pilih posisi" />
              </SelectTrigger>
              <SelectContent>
                {POSISI_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!watch("posisi") && errors.posisi && (
              <p className="text-xs text-destructive">Posisi wajib dipilih</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Riwayat Medis */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Medis</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="golonganDarah">Golongan Darah</Label>
            <Select
              value={watch("golonganDarah")}
              onValueChange={(v) => setValue("golonganDarah", v)}
            >
              <SelectTrigger id="golonganDarah">
                <SelectValue placeholder="Pilih golongan darah" />
              </SelectTrigger>
              <SelectContent>
                {GOLONGAN_DARAH_OPTIONS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="alergi">Alergi</Label>
            <Textarea id="alergi" rows={2} {...register("alergi")} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="kondisiKhusus">Kondisi Khusus</Label>
            <Textarea
              id="kondisiKhusus"
              rows={2}
              {...register("kondisiKhusus")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="riwayatCedera">Riwayat Cedera</Label>
            <Textarea
              id="riwayatCedera"
              rows={2}
              {...register("riwayatCedera")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Statistik */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="gol">Gol</Label>
            <Input
              id="gol"
              type="number"
              min={0}
              defaultValue={0}
              {...register("gol")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assist">Assist</Label>
            <Input
              id="assist"
              type="number"
              min={0}
              defaultValue={0}
              {...register("assist")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pertandingan">Pertandingan</Label>
            <Input
              id="pertandingan"
              type="number"
              min={0}
              defaultValue={0}
              {...register("pertandingan")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Foto */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Pemain</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploadField
            label="Unggah Foto"
            accept="image/*"
            preview
            onFileChange={(blob) => {
              fotoRef.current = blob;
            }}
          />
        </CardContent>
      </Card>

      {/* Section 5: Dokumen */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadField
            label="Kartu Keluarga (KK)"
            accept="image/*,application/pdf"
            onFileChange={(blob) => {
              dokumenRefs.KK.current = blob;
            }}
          />
          <FileUploadField
            label="Akta Kelahiran"
            accept="image/*,application/pdf"
            onFileChange={(blob) => {
              dokumenRefs.Akta.current = blob;
            }}
          />
          <FileUploadField
            label="Ijazah"
            accept="image/*,application/pdf"
            onFileChange={(blob) => {
              dokumenRefs.Ijazah.current = blob;
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isPending}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Daftar Pemain"}
        </Button>
      </div>
    </form>
  );
}
