import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { router } from "./router";

/**
 * SSB Sas Kanggooroo — Player Registry
 *
 * App is a thin shell: it wires the TanStack Router to the React Query
 * context and refreshes cached queries whenever the Internet Identity
 * session changes (login, logout, or restored session on reload).
 *
 * All routing, layout, and page composition lives in the router tree
 * (see ./router.tsx) and the shared Layout component. Page modules are
 * built by separate page tasks.
 */
function App() {
  const { isInitializing, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  // Keep the router's queryClient context in sync with the provider.
  useEffect(() => {
    router.update({ context: { queryClient } });
  }, [queryClient]);

  // Invalidate all cached queries when the auth session changes so
  // admin-gated data does not leak across identities.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!isInitializing) {
      queryClient.invalidateQueries();
    }
  }, [isAuthenticated, isInitializing, queryClient]);

  return <RouterProvider router={router} />;
}

export default App;
