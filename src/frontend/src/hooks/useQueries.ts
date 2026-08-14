import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  Document,
  Player,
  PlayerInput,
  PlayerStatsSummary,
  PlayerUpdate,
  Position,
} from "../backend";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — Player Registry React Query hooks
 *
 * Mirrors the backend player-registry API (see
 * src/backend/mixins/player-registry-api.mo). Public reads/writes go through
 * the shared actor; admin-gated mutations (updatePlayer, deletePlayer) are
 * only enabled for authenticated admins. File uploads use ExternalBlob from
 * @caffeineai/object-storage (re-exported via ../backend).
 * ------------------------------------------------------------------------- */

// Re-export the file-upload type so page tasks can import it from one place.
export type {
  Player,
  PlayerInput,
  PlayerUpdate,
  Position,
  PlayerStatsSummary,
  Document,
};

/** All registered players (public). */
export function useGetPlayers() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single player by id (public). */
export function useGetPlayer(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Player | null>({
    queryKey: ["player", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPlayer(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

/** Register a new player (public, open registration — no login). */
export function useAddPlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlayerInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addPlayer(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["playerStats"] });
    },
  });
}

/** Edit an existing player (admin/coach only). */
export function useUpdatePlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: bigint; update: PlayerUpdate }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updatePlayer(params.id, params.update);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({
        queryKey: ["player", variables.id.toString()],
      });
    },
  });
}

/** Delete a player by id (admin/coach only). */
export function useDeletePlayer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePlayer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["playerStats"] });
    },
  });
}

/** Total player count + per-position distribution (public). */
export function useGetPlayerStats() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<PlayerStatsSummary>({
    queryKey: ["playerStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPlayerStats();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Case-insensitive name search (public). */
export function useSearchPlayers(query: string) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Player[]>({
    queryKey: ["players", "search", query],
    queryFn: async () => {
      if (!actor || !query) return [];
      return actor.searchPlayers(query);
    },
    enabled: !!actor && !isFetching && query.trim().length > 0,
  });
}

/** Filter players by field position (public). */
export function useFilterPlayers(position: Position | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<Player[]>({
    queryKey: ["players", "filter", position],
    queryFn: async () => {
      if (!actor || position === null) return [];
      return actor.filterPlayers(position);
    },
    enabled: !!actor && !isFetching && position !== null,
  });
}

/** Generate a text-only PDF profile for a player (public, backend-built). */
export function useGeneratePlayerPDF() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async (id: bigint): Promise<Blob> => {
      if (!actor) throw new Error("Actor not available");
      const bytes = await actor.generatePlayerPDF(id);
      return new Blob([bytes], { type: "application/pdf" });
    },
  });
}

/** Whether the current caller is an admin (Internet Identity session). */
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor(createActor);
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ["isCallerAdmin", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
