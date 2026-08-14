import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import { useIsCallerAdmin } from "../hooks/useQueries";

/**
 * SSB Sas Kanggooroo — branded footer.
 *
 * Deep navy zone (bg-secondary) anchoring the bottom of the blue page.
 * Shows the official academy logo mini-mark, the academy name, tagline,
 * and an admin/coach sign-in entry point. For signed-in admins the
 * sign-in button becomes a sign-out control plus a dashboard link.
 */
/**
 * SSB Sas Kanggooroo — branded footer mini mark.
 *
 * The official academy logo rendered inside a small rounded badge on the
 * deep navy footer zone. Sized to fit the h-11 w-11 badge with a small
 * inset so the round artwork stays intact.
 */
export function KangarooMiniMark() {
  return (
    <span
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary-foreground/10 p-1 ring-1 ring-secondary-foreground/20"
      aria-hidden="true"
    >
      <img
        src="/assets/logo-ssb-sas-kanggooroo.jpeg"
        alt="Logo SSB Sas Kanggooroo"
        className="h-full w-full rounded-xl object-contain"
      />
    </span>
  );
}

export default function Footer() {
  const { identity, clear } = useInternetIdentity();
  const { data: isAdmin = false, isLoading } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const showAdminEntry = isAuthenticated && !isLoading && isAdmin;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              <KangarooMiniMark />
              <span className="font-display text-xl font-bold tracking-tight">
                SSB Sas Kanggooroo
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-secondary-foreground/80">
              Akademi sepak bola untuk pemain muda. Membina bakat, membangun
              karakter, di atas lapangan hijau.
            </p>
          </div>

          {/* Admin / coach access */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            {showAdminEntry ? (
              <>
                <a
                  href="/admin"
                  data-ocid="footer.admin_link"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Dashboard Admin
                </a>
                <button
                  type="button"
                  onClick={clear}
                  data-ocid="footer.signout_button"
                  className="inline-flex items-center gap-2 text-sm font-medium text-secondary-foreground/80 transition-smooth hover:text-secondary-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </>
            ) : isAuthenticated ? (
              <span className="text-sm text-secondary-foreground/70">
                Masuk sebagai pengguna (bukan admin)
              </span>
            ) : (
              <a
                href="/admin"
                data-ocid="footer.signin_button"
                className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/30 px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-smooth hover:bg-secondary-foreground/10"
              >
                <LogIn className="h-4 w-4" />
                Masuk Admin / Pelatih
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-secondary-foreground/15 pt-6 text-center text-xs text-secondary-foreground/70 sm:flex-row sm:text-left">
          <p>© {currentYear} SSB Sas Kanggooroo. Semua hak cipta dilindungi.</p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined"
                ? window.location.hostname
                : "ssb-sas-kanggooroo",
            )}`}
            target="_blank"
            rel="noreferrer noopener"
            data-ocid="footer.attribution_link"
            className="transition-smooth hover:text-secondary-foreground"
          >
            Dibuat dengan cinta menggunakan caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
