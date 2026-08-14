import Storage "mo:caffeineai-object-storage/Storage";
import Time "mo:core/Time";

// Domain type definitions for the player-registry domain.
// Public API signatures live in mixins/player-registry-api.mo and
// domain logic signatures live in lib/player-registry.mo; both are
// stubs filled in by the develop phase.

module {
  // Cross-cutting timestamp alias (nanoseconds since epoch, per mo:core/Time).
  public type Timestamp = Time.Time;

  // Player field position on the pitch.
  public type Position = {
    #GK; // Kiper (Goalkeeper)
    #DF; // Bek (Defender)
    #MF; // Gelandang (Midfielder)
    #FW; // Penyerang (Forward)
  };

  // Official identity document type accepted at registration.
  public type DocumentType = {
    #KK;    // Kartu Keluarga
    #Akta;  // Akta Kelahiran
    #Ijazah; // Ijazah
  };

  // Reference to an off-chain file stored via the object-storage extension.
  // The backend only keeps the reference; the frontend performs the upload.
  public type FileReference = Storage.ExternalBlob;

  // An uploaded identity document (KK / Akta / Ijazah).
  // NOTE: identity documents are stored in state but are intentionally
  // EXCLUDED from generated PDF profiles (per user instruction).
  public type Document = {
    tipe : DocumentType;
    fileName : Text;
    fileReference : FileReference;
  };

  // Player cumulative match statistics.
  public type PlayerStats = {
    gol : Nat;          // goals scored
    assist : Nat;       // assists made
    pertandingan : Nat; // matches played
  };

  // Player medical history record.
  public type MedicalRecord = {
    golonganDarah : Text;   // blood type, e.g. "O", "A", "B", "AB"
    alergi : Text;          // known allergies (free text, "" if none)
    kondisiKhusus : Text;   // special conditions (free text, "" if none)
    riwayatCedera : Text;   // injury history (free text, "" if none)
  };

  // A registered player. Public registration is open to everyone (no login);
  // edit/delete is restricted to admin/coach via Internet Identity.
  public type Player = {
    id : Nat;
    namaLengkap : Text;       // full name
    tanggalLahir : Text;      // date of birth (ISO date string, e.g. "2012-04-15")
    alamat : Text;            // home address
    kontak : Text;            // contact (parent/guardian phone or email)
    nisn : Text;              // NISN (Nomor Induk Siswa Nasional)
    posisi : Position;        // field position
    nomorPunggung : Nat;      // squad number
    foto : FileReference;      // player photo (object-storage reference)
    dokumen : [Document];      // identity documents (excluded from PDF)
    statistik : PlayerStats;  // cumulative match statistics
    riwayatMedis : MedicalRecord; // medical history
    timestamp : Timestamp;    // registration timestamp
  };

  // Input payload for registering a new player. The `id` and `timestamp`
  // are assigned by the backend; callers supply the rest.
  public type PlayerInput = {
    namaLengkap : Text;
    tanggalLahir : Text;
    alamat : Text;
    kontak : Text;
    nisn : Text;
    posisi : Position;
    nomorPunggung : Nat;
    foto : FileReference;
    dokumen : [Document];
    statistik : PlayerStats;
    riwayatMedis : MedicalRecord;
  };

  // Input payload for editing an existing player. All fields are optional;
  // omitted fields retain their existing values.
  public type PlayerUpdate = {
    namaLengkap : ?Text;
    tanggalLahir : ?Text;
    alamat : ?Text;
    kontak : ?Text;
    nisn : ?Text;
    posisi : ?Position;
    nomorPunggung : ?Nat;
    foto : ?FileReference;
    dokumen : ?[Document];
    statistik : ?PlayerStats;
    riwayatMedis : ?MedicalRecord;
  };

  // Distribution of players across the four field positions.
  public type PositionDistribution = {
    gk : Nat; // count of #GK
    df : Nat; // count of #DF
    mf : Nat; // count of #MF
    fw : Nat; // count of #FW
  };

  // Summary returned by getPlayerStats(): total player count plus the
  // per-position distribution.
  public type PlayerStatsSummary = {
    totalPemain : Nat;
    distribusi : PositionDistribution;
  };
};
