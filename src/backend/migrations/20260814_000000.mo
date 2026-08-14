import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

// Migration: convert the canister from the previous salon application shape
// to the SSB Sas Kanggooroo player-registry shape.
//
// The preceding init migration (20250101_000000_Init.mo) is frozen, so this
// file expresses the salon -> player-registry transformation as a new
// append-only chain entry. History is append-only; the frozen init file
// cannot be rewritten.
//
// OldActor = the salon stable shape produced by the init migration.
// NewActor = the player-registry stable shape declared in main.mo:
//   - accessControlState : AccessControl.AccessControlState  (kept)
//   - players            : Map.Map<Nat, Player>               (new, seeded)
//   - nextId             : { var nextPlayerId : Nat }         (new)
// The salon fields (businessInfo, services, team, testimonials, gallery,
// bookingRequests, nextRequestId) are consumed in OldActor and intentionally
// omitted from NewActor -- an explicit discard per the build requirement.
//
// Player/Document/Position/etc. types are inlined here (no project imports)
// so this frozen chain entry does not drift if the actor's types change in
// a later version. Only mo:core and mops package imports are allowed.

module {
  // --- Inlined old (salon) stable types ---

  type DayHours = { days : Text; hours : Text };

  type BusinessInfo = {
    name : Text;
    tagline : Text;
    phone : Text;
    email : Text;
    address : Text;
    openingHours : [DayHours];
  };

  type Service = {
    id : Nat;
    name : Text;
    description : Text;
    price : Text;
    duration : Text;
  };

  type TeamMember = {
    id : Nat;
    name : Text;
    role : Text;
    bio : Text;
    photo : Text;
  };

  type Testimonial = { id : Nat; author : Text; quote : Text };

  type GalleryImage = { id : Nat; url : Text; caption : Text };

  type BookingRequest = {
    id : Nat;
    name : Text;
    contact : Text;
    service : Text;
    preferredTime : Text;
    message : Text;
    createdAt : Int;
    handled : Bool;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    businessInfo : BusinessInfo;
    services : [Service];
    team : [TeamMember];
    testimonials : [Testimonial];
    gallery : [GalleryImage];
    bookingRequests : Map.Map<Nat, BookingRequest>;
    var nextRequestId : Nat;
  };

  // --- Inlined new (player-registry) stable types ---

  type Position = {
    #GK; // Kiper (Goalkeeper)
    #DF; // Bek (Defender)
    #MF; // Gelandang (Midfielder)
    #FW; // Penyerang (Forward)
  };

  type DocumentType = {
    #KK;     // Kartu Keluarga
    #Akta;   // Akta Kelahiran
    #Ijazah; // Ijazah
  };

  // ExternalBlob is Blob (see extension-object-storage skill); inline as
  // Blob so the migration is self-contained.
  type FileReference = Blob;

  type Document = {
    tipe : DocumentType;
    fileName : Text;
    fileReference : FileReference;
  };

  type PlayerStats = {
    gol : Nat;
    assist : Nat;
    pertandingan : Nat;
  };

  type MedicalRecord = {
    golonganDarah : Text;
    alergi : Text;
    kondisiKhusus : Text;
    riwayatCedera : Text;
  };

  type Player = {
    id : Nat;
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
    timestamp : Int;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    players : Map.Map<Nat, Player>;
    nextId : { var nextPlayerId : Nat };
  };

  public func migration(old : OldActor) : NewActor {
    // Reuse the existing access-control state (admin assignments, user
    // roles) so Internet Identity sign-ins survive the conversion.
    let players = Map.empty<Nat, Player>();

    // Seed 7 SSB Sas Kanggooroo sample players with varied positions.
    let seed : [Player] = [
      {
        id = 0;
        namaLengkap = "Ahmad Fauzan Pratama";
        tanggalLahir = "2012-03-12";
        alamat = "Jl. Melati No. 5, Yogyakarta";
        kontak = "0812-3456-7890";
        nisn = "0034567891";
        posisi = #GK;
        nomorPunggung = 1;
        foto = "" : Blob; // empty Blob for seed data
        dokumen = [];
        statistik = { gol = 0; assist = 0; pertandingan = 12 };
        riwayatMedis = {
          golonganDarah = "O";
          alergi = "Debu";
          kondisiKhusus = "";
          riwayatCedera = "";
        };
        timestamp = 0;
      },
      {
        id = 1;
        namaLengkap = "Bagas Saputra";
        tanggalLahir = "2011-07-22";
        alamat = "Jl. Kenari No. 18, Sleman";
        kontak = "0813-2222-1111";
        nisn = "0034567892";
        posisi = #DF;
        nomorPunggung = 4;
        foto = "" : Blob;
        dokumen = [];
        statistik = { gol = 2; assist = 1; pertandingan = 15 };
        riwayatMedis = {
          golonganDarah = "A";
          alergi = "";
          kondisiKhusus = "";
          riwayatCedera = "Cedera pergelangan kaki (2023)";
        };
        timestamp = 0;
      },
      {
        id = 2;
        namaLengkap = "Candra Wijaya";
        tanggalLahir = "2012-01-09";
        alamat = "Jl. Mawar No. 7, Bantul";
        kontak = "0857-9999-4321";
        nisn = "0034567893";
        posisi = #DF;
        nomorPunggung = 5;
        foto = "" : Blob;
        dokumen = [];
        statistik = { gol = 1; assist = 3; pertandingan = 14 };
        riwayatMedis = {
          golonganDarah = "B";
          alergi = "";
          kondisiKhusus = "Asma ringan";
          riwayatCedera = "";
        };
        timestamp = 0;
      },
      {
        id = 3;
        namaLengkap = "Dimas Anggara";
        tanggalLahir = "2011-11-30";
        alamat = "Jl. Anggrek No. 22, Yogyakarta";
        kontak = "0812-7777-8888";
        nisn = "0034567894";
        posisi = #MF;
        nomorPunggung = 8;
        foto = "" : Blob;
        dokumen = [];
        statistik = { gol = 5; assist = 7; pertandingan = 16 };
        riwayatMedis = {
          golonganDarah = "AB";
          alergi = "";
          kondisiKhusus = "";
          riwayatCedera = "";
        };
        timestamp = 0;
      },
      {
        id = 4;
        namaLengkap = "Eka Permana";
        tanggalLahir = "2012-05-17";
        alamat = "Jl. Dahlia No. 3, Sleman";
        kontak = "0856-5555-1234";
        nisn = "0034567895";
        posisi = #MF;
        nomorPunggung = 10;
        foto = "" : Blob;
        dokumen = [];
        statistik = { gol = 8; assist = 6; pertandingan = 16 };
        riwayatMedis = {
          golonganDarah = "O";
          alergi = "Kacang";
          kondisiKhusus = "";
          riwayatCedera = "";
        };
        timestamp = 0;
      },
      {
        id = 5;
        namaLengkap = "Fajar Nugroho";
        tanggalLahir = "2011-09-04";
        alamat = "Jl. Cempaka No. 11, Bantul";
        kontak = "0813-4444-5555";
        nisn = "0034567896";
        posisi = #FW;
        nomorPunggung = 9;
        foto = "" : Blob;
        dokumen = [];
        statistik = { gol = 14; assist = 4; pertandingan = 16 };
        riwayatMedis = {
          golonganDarah = "A";
          alergi = "";
          kondisiKhusus = "";
          riwayatCedera = "Hamstring (2024)";
        };
        timestamp = 0;
      },
      {
        id = 6;
        namaLengkap = "Galang Ramadhan";
        tanggalLahir = "2012-12-25";
        alamat = "Jl. Teratai No. 9, Yogyakarta";
        kontak = "0857-3333-2222";
        nisn = "0034567897";
        posisi = #FW;
        nomorPunggung = 11;
        foto = "" : Blob;
        dokumen = [];
        statistik = { gol = 10; assist = 8; pertandingan = 15 };
        riwayatMedis = {
          golonganDarah = "B";
          alergi = "";
          kondisiKhusus = "";
          riwayatCedera = "";
        };
        timestamp = 0;
      },
    ];

    for (player in seed.values()) {
      players.add(player.id, player);
    };

    {
      // Keep the existing access-control state.
      accessControlState = old.accessControlState;
      players;
      nextId = { var nextPlayerId = seed.size() };
    };
  };
};
