import { Position } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — SearchFilterBar
 *
 * Live search input + position filter buttons. State is owned by the parent
 * (PublicRegistryPage) and persisted via TanStack Router search params, so
 * this is a controlled component. The position filter uses a segmented
 * control of buttons: Semua, GK, DF, MF, FW.
 *
 * The bar itself is rendered inside a white card surface by the parent, so
 * the controls here use standard card/foreground tokens that read well on
 * white.
 * ------------------------------------------------------------------------- */

export type PositionFilter = Position | "all";

export interface PositionOption {
  value: PositionFilter;
  label: string;
  short: string;
}

export const POSITION_OPTIONS: PositionOption[] = [
  { value: "all", label: "Semua", short: "Semua" },
  { value: Position.GK, label: "Kiper", short: "GK" },
  { value: Position.DF, label: "Bek", short: "DF" },
  { value: Position.MF, label: "Gelandang", short: "MF" },
  { value: Position.FW, label: "Penyerang", short: "FW" },
];

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  positionFilter: PositionFilter;
  onPositionChange: (value: PositionFilter) => void;
  resultCount: number;
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  positionFilter,
  onPositionChange,
  resultCount,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Search row */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama pemain…"
          aria-label="Cari pemain berdasarkan nama"
          data-ocid="registry.search_input"
          className="h-11 pl-10 pr-10 text-base"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
            aria-label="Hapus pencarian"
            data-ocid="registry.search_clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Position filter + result count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <fieldset
          className="flex flex-wrap gap-2"
          aria-label="Filter berdasarkan posisi"
        >
          {POSITION_OPTIONS.map((opt) => {
            const active = positionFilter === opt.value;
            return (
              <Button
                key={opt.value}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => onPositionChange(opt.value)}
                data-ocid={`registry.filter.${opt.short.toLowerCase()}`}
                aria-pressed={active}
                className={cn(
                  "rounded-full px-4 font-semibold",
                  active && "shadow-subtle",
                )}
              >
                {opt.short}
                {opt.value !== "all" && (
                  <span className="ml-1 hidden text-xs font-normal opacity-80 sm:inline">
                    {opt.label}
                  </span>
                )}
              </Button>
            );
          })}
        </fieldset>

        <p
          className="text-sm text-muted-foreground"
          data-ocid="registry.result_count"
        >
          <span className="font-stat font-semibold text-foreground">
            {resultCount}
          </span>{" "}
          pemain ditemukan
        </p>
      </div>
    </div>
  );
}
