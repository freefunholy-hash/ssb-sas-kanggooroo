import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import PlayerLib "../lib/player-registry";
import Types "../types/player-registry";

// Public API surface for the player-registry domain.
//
// Authorization model (per user instructions):
//   - Public (no login): getPlayers, getPlayer, addPlayer, getPlayerStats,
//     searchPlayers, filterPlayers, generatePlayerPDF
//   - Admin/Coach (Internet Identity): updatePlayer, deletePlayer
// Admin gating reuses the existing AccessControl + MixinAuthorization
// helpers (isCallerAdmin / getCallerUserRole) wired in main.mo; the
// requireAdmin callback traps on unauthorized callers.

mixin (
  players : Map.Map<Nat, Types.Player>,
  nextId : { var nextPlayerId : Nat },
  requireAdmin : (Principal) -> (),
) {

  // Public: return all registered players.
  public query func getPlayers() : async [Types.Player] {
    PlayerLib.listPlayers(players);
  };

  // Public: return a single player by id, or null.
  public query func getPlayer(id : Nat) : async ?Types.Player {
    PlayerLib.getPlayer(players, id);
  };

  // Public (open registration, no login): register a new player.
  // Returns the assigned player id.
  public shared func addPlayer(input : Types.PlayerInput) : async Nat {
    PlayerLib.addPlayer(players, nextId, input);
  };

  // Admin/Coach only: edit an existing player. Returns the updated
  // player, or null if the id was not found.
  public shared ({ caller }) func updatePlayer(id : Nat, update : Types.PlayerUpdate) : async ?Types.Player {
    requireAdmin(caller);
    PlayerLib.updatePlayer(players, id, update);
  };

  // Admin/Coach only: delete a player by id. Returns true if removed.
  public shared ({ caller }) func deletePlayer(id : Nat) : async Bool {
    requireAdmin(caller);
    PlayerLib.deletePlayer(players, id);
  };

  // Public: return total player count and per-position distribution.
  public query func getPlayerStats() : async Types.PlayerStatsSummary {
    PlayerLib.computeStatsSummary(players);
  };

  // Public: case-insensitive name search.
  public query func searchPlayers(searchQuery : Text) : async [Types.Player] {
    PlayerLib.searchPlayers(players, searchQuery);
  };

  // Public: filter players by field position.
  public query func filterPlayers(position : Types.Position) : async [Types.Player] {
    PlayerLib.filterPlayers(players, position);
  };

  // Public: generate a PDF profile for a player containing player data
  // text PLUS the player photo (per user instruction: "data teks + foto
  // pemain"). Identity documents (KK/Akta/Ijazah) are intentionally
  // EXCLUDED from the PDF. Returns the PDF as a Blob.
  //
  // The PDF is a minimal single-page document built by hand: a header,
  // catalog/pages/page/font/content/image objects, an xref table, and a
  // trailer. Player text fields are laid out as labeled lines in the
  // content stream, and the player photo is embedded as an image XObject
  // referenced via a 'Do' operator below the text block.
  public func generatePlayerPDF(id : Nat) : async Blob {
    let player = PlayerLib.getPlayer(players, id)
      ?? Runtime.trap("Player not found");
    buildPlayerPDF(player);
  };

  // --- PDF construction helpers (private to the mixin) ---

  // Build the full PDF document bytes for a player profile (text + photo).
  private func buildPlayerPDF(player : Types.Player) : Blob {
    let title = "Profil Pemain - SSB Sas Kanggooroo";
    let lines = [
      ("Nama Lengkap", player.namaLengkap),
      ("Tanggal Lahir", player.tanggalLahir),
      ("Alamat", player.alamat),
      ("Kontak", player.kontak),
      ("NISN", player.nisn),
      ("Posisi", positionToText(player.posisi)),
      ("Nomor Punggung", player.nomorPunggung.toText()),
      ("Gol", player.statistik.gol.toText()),
      ("Assist", player.statistik.assist.toText()),
      ("Pertandingan", player.statistik.pertandingan.toText()),
      ("Golongan Darah", player.riwayatMedis.golonganDarah),
      ("Alergi", player.riwayatMedis.alergi),
      ("Kondisi Khusus", player.riwayatMedis.kondisiKhusus),
      ("Riwayat Cedera", player.riwayatMedis.riwayatCedera),
    ];

    // Detect the photo format from its magic bytes so we can build the
    // correct image XObject dictionary. JPEG starts with FF D8 FF; PNG
    // starts with 89 50 4E 47. If neither matches, we still embed the
    // raw bytes as an unlabeled image stream so the photo data is
    // present in the output even if a viewer cannot render it.
    let photoBytes = player.foto.toArray();
    let photoFormat = detectImageFormat(photoBytes);
    let hasPhoto = photoFormat != #unknown or photoBytes.size() > 0;

    let contentStream = buildContentStream(title, lines, hasPhoto);

    // Assemble the PDF objects. Object numbering (with image):
    //   1 = Catalog, 2 = Pages, 3 = Page, 4 = Font, 5 = Content,
    //   6 = Image XObject.
    let header : Blob = Blob.fromArray([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A, 0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]);
    let catalogObj = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
    let pagesObj = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
    let pageObj = "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> /XObject << /Im1 6 0 R >> >> /Contents 5 0 R >>\nendobj\n";
    let fontObj = "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
    let contentLen = contentStream.size().toText();
    let contentObj = "5 0 obj\n<< /Length " # contentLen # " >>\nstream\n" # contentStream # "\nendstream\nendobj\n";

    // Image XObject (object 6). The stream payload is the raw photo
    // bytes appended after the header text and before the endstream
    // marker. Assembled as a Blob so the binary photo bytes are not
    // corrupted by UTF-8 round-tripping.
    let (imageHeader, imageTrailer) = buildImageObjectHeader(photoFormat, photoBytes.size());
    let imageObjBytes = Blob.fromArray([
      imageHeader.encodeUtf8().toArray(),
      photoBytes,
      imageTrailer.encodeUtf8().toArray(),
    ].flatten());

    // Compute byte offsets for the xref table by measuring each section's
    // UTF-8 byte length.
    var offset = 0 : Nat;
    offset += header.size();
    let off1 = offset;
    let catalogBytes = catalogObj.encodeUtf8();
    offset += catalogBytes.size();
    let off2 = offset;
    let pagesBytes = pagesObj.encodeUtf8();
    offset += pagesBytes.size();
    let off3 = offset;
    let pageBytes = pageObj.encodeUtf8();
    offset += pageBytes.size();
    let off4 = offset;
    let fontBytes = fontObj.encodeUtf8();
    offset += fontBytes.size();
    let off5 = offset;
    let contentObjBytes = contentObj.encodeUtf8();
    offset += contentObjBytes.size();
    let off6 = offset;
    offset += imageObjBytes.size();
    let xrefOffset = offset;

    // Build the xref table: 7 entries (0..6), each in-use entry is
    // "nnnnnnnnnn 00000 n \n" with a 10-digit zero-padded offset.
    let xref = "xref\n0 7\n0000000000 65535 f \n"
      # xrefLine(off1)
      # xrefLine(off2)
      # xrefLine(off3)
      # xrefLine(off4)
      # xrefLine(off5)
      # xrefLine(off6);

    let trailer = "trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n"
      # xrefOffset.toText() # "\n%%EOF";

    let parts : [Blob] = [
      header,
      catalogBytes,
      pagesBytes,
      pageBytes,
      fontBytes,
      contentObjBytes,
      imageObjBytes,
      xref.encodeUtf8(),
      trailer.encodeUtf8(),
    ];
    Blob.fromArray(parts.map(func(b : Blob) : [Nat8] { b.toArray() }).flatten());
  };

  // Detect the image format from the leading magic bytes of the photo.
  //   JPEG: FF D8 FF
  //   PNG:  89 50 4E 47
  //   otherwise: #unknown (bytes are still embedded as a raw stream)
  private func detectImageFormat(bytes : [Nat8]) : { #jpeg; #png; #unknown } {
    let n = bytes.size();
    if (n >= 3 and bytes[0] == 0xFF and bytes[1] == 0xD8 and bytes[2] == 0xFF) {
      #jpeg;
    } else if (n >= 4 and bytes[0] == 0x89 and bytes[1] == 0x50 and bytes[2] == 0x4E and bytes[3] == 0x47) {
      #png;
    } else {
      #unknown;
    };
  };

  // Build the image XObject object header and trailer text for object 6.
  // The header declares /Type /XObject /Subtype /Image with the photo's
  // byte length, color space, and dimensions. For JPEG we use
  // /Filter /DCTDecode so the viewer decodes the JPEG. For PNG and
  // unknown formats we embed the raw bytes with no filter so the photo
  // data is present in the output. Dimensions are set to 150x150 and
  // the content-stream cm operator scales the image to that box.
  private func buildImageObjectHeader(format : { #jpeg; #png; #unknown }, byteLen : Nat) : (Text, Text) {
    let lenText = byteLen.toText();
    let filterLine = switch (format) {
      case (#jpeg) { "/Filter /DCTDecode " };
      case (#png) { "" };
      case (#unknown) { "" };
    };
    let header = "6 0 obj\n<< /Type /XObject /Subtype /Image /Width 150 /Height 150 /ColorSpace /DeviceRGB /BitsPerComponent 8 "
      # filterLine # "/Length " # lenText # " >>\nstream\n";
    let trailer = "\nendstream\nendobj\n";
    (header, trailer);
  };

  // Build the PDF content stream: a title line followed by labeled field
  // lines, each on its own line descending the page. When a photo is
  // present, a q/cm/Do/Q block draws the embedded image XObject (Im1)
  // below the text block at a 150x150 pt size.
  private func buildContentStream(title : Text, lines : [(Text, Text)], hasPhoto : Bool) : Text {
    var s = "BT\n/F1 16 Tf\n72 780 Td\n(" # escapePdf(title) # ") Tj\nET\n";
    var y = 740 : Int;
    s := s # "BT\n/F1 11 Tf\n72 " # y.toText() # " Td\n";
    for ((fieldLabel, value) in lines.values()) {
      s := s # "(" # escapePdf(fieldLabel) # ": " # escapePdf(value) # ") Tj\n0 -16 Td\n";
    };
    s := s # "ET\n";
    if (hasPhoto) {
      // Place the photo below the text block. q ... Q saves/restores
      // graphics state; cm sets a 150x150 unit coordinate frame at
      // (72, 200); Do paints the image XObject named Im1.
      s := s # "q\n150 0 0 150 72 200 cm\n/Im1 Do\nQ\n";
    };
    s;
  };

  // Escape ( ) and \ inside a PDF text string. Backslash must be escaped
  // first so that a literal backslash is not later doubled incorrectly.
  private func escapePdf(t : Text) : Text {
    let escapedBackslash = t.replace(#char '\\', "\\\\");
    let escapedOpen = escapedBackslash.replace(#char '(', "\\(");
    escapedOpen.replace(#char ')', "\\)");
  };

  // Map a Position variant to its Indonesian display label.
  private func positionToText(p : Types.Position) : Text {
    switch (p) {
      case (#GK) { "Kiper (GK)" };
      case (#DF) { "Bek (DF)" };
      case (#MF) { "Gelandang (MF)" };
      case (#FW) { "Penyerang (FW)" };
    };
  };

  // Format a single xref line: 10-digit zero-padded offset, generation 0,
  // in-use flag 'n'. PDF requires exactly 20 bytes per entry including the
  // trailing newline.
  private func xrefLine(offset : Nat) : Text {
    pad10(offset) # " 00000 n \n";
  };

  // Left-pad a Nat to 10 digits with leading zeros.
  private func pad10(n : Nat) : Text {
    let s = n.toText();
    let len = s.size();
    if (len >= 10) { s } else {
      // Build the zero prefix of length (10 - len) then append s.
      padZeros(10 - len) # s;
    };
  };

  // Produce a string of `count` zero characters.
  private func padZeros(count : Nat) : Text {
    var out = "";
    var i = 0;
    while (i < count) {
      out := out # "0";
      i += 1;
    };
    out;
  };
};
