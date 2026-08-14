import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Player {
    id: bigint;
    namaLengkap: string;
    tanggalLahir: string;
    nomorPunggung: bigint;
    riwayatMedis: MedicalRecord;
    alamat: string;
    foto: FileReference;
    nisn: string;
    dokumen: Array<Document>;
    statistik: PlayerStats;
    timestamp: Timestamp;
    kontak: string;
    posisi: Position;
}
export interface MedicalRecord {
    golonganDarah: string;
    riwayatCedera: string;
    alergi: string;
    kondisiKhusus: string;
}
export type Timestamp = bigint;
export interface PlayerStatsSummary {
    distribusi: PositionDistribution;
    totalPemain: bigint;
}
export interface PlayerUpdate {
    namaLengkap?: string;
    tanggalLahir?: string;
    nomorPunggung?: bigint;
    riwayatMedis?: MedicalRecord;
    alamat?: string;
    foto?: FileReference;
    nisn?: string;
    dokumen?: Array<Document>;
    statistik?: PlayerStats;
    kontak?: string;
    posisi?: Position;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Document {
    tipe: DocumentType;
    fileName: string;
    fileReference: FileReference;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface PositionDistribution {
    df: bigint;
    fw: bigint;
    gk: bigint;
    mf: bigint;
}
export interface PlayerInput {
    namaLengkap: string;
    tanggalLahir: string;
    nomorPunggung: bigint;
    riwayatMedis: MedicalRecord;
    alamat: string;
    foto: FileReference;
    nisn: string;
    dokumen: Array<Document>;
    statistik: PlayerStats;
    kontak: string;
    posisi: Position;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type FileReference = Uint8Array;
export interface PlayerStats {
    gol: bigint;
    pertandingan: bigint;
    assist: bigint;
}
export enum DocumentType {
    KK = "KK",
    Akta = "Akta",
    Ijazah = "Ijazah"
}
export enum Position {
    DF = "DF",
    FW = "FW",
    GK = "GK",
    MF = "MF"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPlayer(input: PlayerInput): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePlayer(id: bigint): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    filterPlayers(position: Position): Promise<Array<Player>>;
    generatePlayerPDF(id: bigint): Promise<Uint8Array>;
    getCallerUserRole(): Promise<UserRole>;
    getPlayer(id: bigint): Promise<Player | null>;
    getPlayerStats(): Promise<PlayerStatsSummary>;
    getPlayers(): Promise<Array<Player>>;
    isCallerAdmin(): Promise<boolean>;
    schema(): Promise<string>;
    searchPlayers(searchQuery: string): Promise<Array<Player>>;
    updatePlayer(id: bigint, update: PlayerUpdate): Promise<Player | null>;
}
