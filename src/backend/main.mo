import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Entity "mo:caffeineai-oql/Entity";
import Expose "mo:caffeineai-oql/Expose";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Types "types/player-registry";
import PlayerRegistryApi "mixins/player-registry-api";

actor {
  // AccessControl + Internet Identity sign-in infrastructure.
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  // Player registry stable state. `nextId` is a record wrapper so the
  // mixin can mutate `nextPlayerId` by reference.
  let players : Map.Map<Nat, Types.Player>;
  let nextId : { var nextPlayerId : Nat };

  // Trap on unauthorized callers. Reused by the player-registry mixin
  // for updatePlayer / deletePlayer admin gating.
  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };
  };

  include PlayerRegistryApi(players, nextId, requireAdmin);

  // OQL exposure: make the players table queryable through the data
  // intelligence layer. The players table holds public data (open
  // registration, public read endpoints), so it is exposed as a
  // .public_() entity — anyone, including the Data Intelligence agent,
  // can read all rows. Write operations (updatePlayer / deletePlayer)
  // remain admin-gated via requireAdmin in PlayerRegistryApi; OQL only
  // adds the read-only schema() / execute() query methods.
  //
  // Manual mode is used because Player carries non-primitive fields:
  //   - posisi : Position (variant)        -> text column via positionLabel
  //   - foto   : FileReference (Blob)       -> omitted (binary, not queryable)
  //   - dokumen: [Document]                -> omitted (binary refs, not queryable)
  //   - statistik : PlayerStats (record)   -> flattened to gol/assist/pertandingan
  //   - riwayatMedis : MedicalRecord       -> flattened to 4 text columns
  // Each .payload(name, extract) declares one column; the implicit
  // _toRow : V -> Value for the extract's return type V (Nat / Text / Int)
  // is resolved from the value modules re-exported on the OQL package
  // (OQL.NatValue / OQL.TextValue / OQL.IntValue).
  func positionLabel(p : Types.Position) : Text {
    switch (p) {
      case (#GK) { "Kiper (GK)" };
      case (#DF) { "Bek (DF)" };
      case (#MF) { "Gelandang (MF)" };
      case (#FW) { "Penyerang (FW)" };
    };
  };

  include Expose({
    entities = [
      Entity.manual<Types.Player>(
        "player",
        func() = players.values(),
        "Player",
        "id",
      )
        .payload("id", func(p : Types.Player) : Nat { p.id })
        .payload("namaLengkap", func(p : Types.Player) : Text { p.namaLengkap })
        .payload("tanggalLahir", func(p : Types.Player) : Text { p.tanggalLahir })
        .payload("alamat", func(p : Types.Player) : Text { p.alamat })
        .payload("kontak", func(p : Types.Player) : Text { p.kontak })
        .payload("nisn", func(p : Types.Player) : Text { p.nisn })
        .payload("posisi", func(p : Types.Player) : Text { positionLabel(p.posisi) })
        .payload("nomorPunggung", func(p : Types.Player) : Nat { p.nomorPunggung })
        .payload("statistikGol", func(p : Types.Player) : Nat { p.statistik.gol })
        .payload("statistikAssist", func(p : Types.Player) : Nat { p.statistik.assist })
        .payload("statistikPertandingan", func(p : Types.Player) : Nat { p.statistik.pertandingan })
        .payload("golonganDarah", func(p : Types.Player) : Text { p.riwayatMedis.golonganDarah })
        .payload("alergi", func(p : Types.Player) : Text { p.riwayatMedis.alergi })
        .payload("kondisiKhusus", func(p : Types.Player) : Text { p.riwayatMedis.kondisiKhusus })
        .payload("riwayatCedera", func(p : Types.Player) : Text { p.riwayatMedis.riwayatCedera })
        .payload("timestamp", func(p : Types.Player) : Int { p.timestamp })
        .public_()
        .build(),
    ];
  });

};
