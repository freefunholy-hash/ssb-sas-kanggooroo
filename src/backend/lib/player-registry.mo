import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/player-registry";

// Domain logic for the player-registry domain.
// Stateless module functions operating on the actor-owned Map state.

module {
  type Player = Types.Player;
  type PlayerInput = Types.PlayerInput;
  type PlayerUpdate = Types.PlayerUpdate;
  type PlayerStatsSummary = Types.PlayerStatsSummary;
  type Position = Types.Position;
  type PositionDistribution = Types.PositionDistribution;

  // Return all players as an array (snapshot of the registry).
  public func listPlayers(players : Map.Map<Nat, Player>) : [Player] {
    Array.fromIter(players.values());
  };

  // Return a single player by id, or null if not found.
  public func getPlayer(players : Map.Map<Nat, Player>, id : Nat) : ?Player {
    players.get(id);
  };

  // Add a new player. Assigns the next id from the counter, stamps the
  // registration timestamp, and inserts into the map. Returns the new id.
  public func addPlayer(
    players : Map.Map<Nat, Player>,
    nextId : { var nextPlayerId : Nat },
    input : PlayerInput,
  ) : Nat {
    let id = nextId.nextPlayerId;
    let player : Player = {
      id;
      namaLengkap = input.namaLengkap;
      tanggalLahir = input.tanggalLahir;
      alamat = input.alamat;
      kontak = input.kontak;
      nisn = input.nisn;
      posisi = input.posisi;
      nomorPunggung = input.nomorPunggung;
      foto = input.foto;
      dokumen = input.dokumen;
      statistik = input.statistik;
      riwayatMedis = input.riwayatMedis;
      timestamp = Time.now();
    };
    players.add(id, player);
    nextId.nextPlayerId := nextId.nextPlayerId + 1;
    id;
  };

  // Apply a partial update to an existing player. Returns the updated
  // player, or null if the id was not found.
  public func updatePlayer(
    players : Map.Map<Nat, Player>,
    id : Nat,
    update : PlayerUpdate,
  ) : ?Player {
    switch (players.get(id)) {
      case null { null };
      case (?player) {
        let updated : Player = {
          id = player.id;
          namaLengkap = update.namaLengkap ?? player.namaLengkap;
          tanggalLahir = update.tanggalLahir ?? player.tanggalLahir;
          alamat = update.alamat ?? player.alamat;
          kontak = update.kontak ?? player.kontak;
          nisn = update.nisn ?? player.nisn;
          posisi = update.posisi ?? player.posisi;
          nomorPunggung = update.nomorPunggung ?? player.nomorPunggung;
          foto = update.foto ?? player.foto;
          dokumen = update.dokumen ?? player.dokumen;
          statistik = update.statistik ?? player.statistik;
          riwayatMedis = update.riwayatMedis ?? player.riwayatMedis;
          timestamp = player.timestamp;
        };
        players.add(id, updated);
        ?updated;
      };
    };
  };

  // Remove a player by id. Returns true if a player was removed.
  public func deletePlayer(players : Map.Map<Nat, Player>, id : Nat) : Bool {
    let existed = players.containsKey(id);
    if (existed) {
      players.remove(id);
    };
    existed;
  };

  // Search players by name (case-insensitive substring match).
  public func searchPlayers(players : Map.Map<Nat, Player>, searchQuery : Text) : [Player] {
    let term = searchQuery.toLower();
    let matching = players.values().filter(
      func(player : Player) : Bool {
        player.namaLengkap.toLower().contains(#text term);
      },
    );
    Array.fromIter(matching);
  };

  // Filter players by position.
  public func filterPlayers(players : Map.Map<Nat, Player>, position : Position) : [Player] {
    let matching = players.values().filter(
      func(player : Player) : Bool { player.posisi == position },
    );
    Array.fromIter(matching);
  };

  // Count players in a single position (helper for distribution).
  public func countByPosition(players : Map.Map<Nat, Player>, position : Position) : Nat {
    let matching = players.values().filter(
      func(player : Player) : Bool { player.posisi == position },
    );
    matching.size();
  };

  // Compute the total player count and per-position distribution.
  public func computeStatsSummary(players : Map.Map<Nat, Player>) : PlayerStatsSummary {
    let total = players.size();
    let gk = countByPosition(players, #GK);
    let df = countByPosition(players, #DF);
    let mf = countByPosition(players, #MF);
    let fw = countByPosition(players, #FW);
    {
      totalPemain = total;
      distribusi = { gk; df; mf; fw };
    };
  };
};
