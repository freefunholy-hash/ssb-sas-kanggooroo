import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";

/**
 * SSB Sas Kanggooroo — admin bar.
 *
 * A dark-navy sticky bar shown above the header for logged-in admins. It
 * sits on top of the blue page background and surfaces the admin identity,
 * a link to the admin dashboard, and a sign-out control. Signing out also
 * clears all cached queries so admin-gated data does not leak across
 * identities.
 */
export default function AdminBar() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const principal = identity?.getPrincipal().toString() ?? "—";
  // Compact principal display: first 6 … last 4 chars.
  const shortPrincipal =
    principal.length > 14
      ? `${principal.slice(0, 6)}…${principal.slice(-4)}`
      : principal;

  const handleSignOut = () => {
    clear();
    queryClient.clear();
  };

  return (
    <div
      data-ocid="admin.bar"
      className="sticky top-0 z-50 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-subtle"
    >
      <div className="container flex h-12 items-center justify-between text-sm">
        {/* Identity */}
        <div className="flex items-center gap-2.5">
          <ShieldCheck
            className="h-4 w-4 text-sidebar-primary"
            aria-hidden="true"
          />
          <span className="font-semibold">Mode Admin / Pelatih</span>
          <span className="hidden font-mono text-xs text-sidebar-foreground/70 sm:inline">
            {shortPrincipal}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <a
            href="/admin"
            data-ocid="admin.dashboard_link"
            className="inline-flex items-center gap-1.5 font-semibold transition-smooth hover:text-sidebar-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            data-ocid="admin.signout_button"
            className="inline-flex items-center gap-1.5 font-semibold transition-smooth hover:text-sidebar-primary"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
