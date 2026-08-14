import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Menu, ShieldCheck, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useIsCallerAdmin } from "../hooks/useQueries";

/**
 * SSB Sas Kanggooroo — Kangaroo mascot mark.
 *
 * The official academy logo (a kangaroo mascot) rendered inside a white
 * rounded badge with a soft shadow. Used as the brand logo in the header.
 * Sized larger (h-12 w-12 badge) so it reads as the primary brand mark on
 * the blue header. The logo is contained with a small inset so the round
 * artwork is never cropped.
 */
export function KangarooMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-card p-1 shadow-menu ring-1 ring-border ${className}`}
      aria-hidden="true"
    >
      <img
        src="/assets/logo-ssb-sas-kanggooroo.jpeg"
        alt="SSB Sas Kanggooroo"
        className="h-full w-full rounded-xl object-contain"
      />
    </span>
  );
}

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/daftar", label: "Daftar" },
];

/**
 * Resolve whether a nav link matches the current path. We use a simple
 * startsWith check so "/daftar" also highlights on deeper routes.
 */
function isCurrentPath(href: string): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export default function Header() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin = false, isLoading } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const [mobileOpen, setMobileOpen] = useState(false);
  const showAdminLink = isAuthenticated && !isLoading && isAdmin;

  const navItems = [
    ...NAV_LINKS,
    ...(showAdminLink
      ? [{ href: "/admin", label: "Admin", isAdmin: true }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container flex h-20 items-center justify-between gap-4">
        {/* Brand — prominent kangaroo logo + wordmark */}
        <a
          href="/"
          className="flex items-center gap-3"
          data-ocid="header.brand_link"
        >
          <KangarooMark />
          <span className="font-display text-xl font-bold tracking-tight text-card md:text-2xl">
            SSB Sas Kanggooroo
          </span>
        </a>

        {/* Desktop nav — white box-style menu chips */}
        <nav
          className="hidden items-center gap-2 md:flex"
          aria-label="Navigasi utama"
        >
          {navItems.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-ocid={`header.nav_link.${link.label.toLowerCase()}`}
              data-active={isCurrentPath(link.href)}
              className={`nav-box inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold ${
                "isAdmin" in link && link.isAdmin ? "is-active" : ""
              }`}
            >
              {"isAdmin" in link && link.isAdmin && (
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              )}
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <a
            href="/daftar"
            data-ocid="header.primary_button"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-menu transition-smooth hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" />
            Tambah Pemain
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="nav-box inline-flex h-11 w-11 items-center justify-center md:hidden"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          data-ocid="header.menu_toggle"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu — white box-style chips stacked */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-background/95 backdrop-blur-md md:hidden">
          <nav
            className="container flex flex-col gap-2.5 py-5"
            aria-label="Navigasi mobile"
          >
            {navItems.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                data-ocid={`header.nav_link.${link.label.toLowerCase()}`}
                data-active={isCurrentPath(link.href)}
                className={`nav-box inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold ${
                  "isAdmin" in link && link.isAdmin ? "is-active" : ""
                }`}
              >
                {"isAdmin" in link && link.isAdmin && (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                )}
                {link.label}
              </a>
            ))}
            <a
              href="/daftar"
              onClick={() => setMobileOpen(false)}
              data-ocid="header.primary_button"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-menu transition-smooth hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Tambah Pemain
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
