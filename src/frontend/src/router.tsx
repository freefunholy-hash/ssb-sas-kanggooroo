import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PublicRegistryPage from "./pages/PublicRegistryPage";
import { RegistrationPage } from "./pages/RegistrationPage";

/**
 * SSB Sas Kanggooroo — Player Registry Router
 *
 * Routes:
 *   /        — public player registry (landing + roster)
 *   /daftar  — public player registration form
 *   /admin   — admin/coach dashboard (protected by Internet Identity)
 *
 * Page components are rendered through the shared Layout shell so the
 * header, footer, and admin bar stay consistent across routes. Page
 * modules themselves are built by separate page tasks; this router only
 * wires the route tree and the admin guard.
 */

// ---------------------------------------------------------------------------
// Root route — provides the Layout shell and an auth context for children.
// ---------------------------------------------------------------------------
interface RouterContext {
  queryClient: QueryClient;
}

const RootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------
const IndexRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: PublicRegistryPage,
  validateSearch: (search: { q?: string; pos?: string }) => ({
    q: search.q ?? "",
    pos: search.pos ?? "all",
  }),
});

const DaftarRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/daftar",
  component: RegistrationPage,
});

// ---------------------------------------------------------------------------
// Protected admin route — renders the admin dashboard, which itself shows a
// sign-in prompt when the visitor is not authenticated via Internet
// Identity. The actual admin dashboard page is built by a page task.
// ---------------------------------------------------------------------------
const AdminRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

// ---------------------------------------------------------------------------
// Route tree + router instance
// ---------------------------------------------------------------------------
const routeTree = RootRoute.addChildren([IndexRoute, DaftarRoute, AdminRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: { queryClient: undefined as unknown as QueryClient },
});

// Register the router type so `useRouter` / `<Link>` stay type-safe.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
