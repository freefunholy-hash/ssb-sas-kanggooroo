import { ArrowRight, Sparkles, Trophy, Users } from "lucide-react";

/**
 * SSB Sas Kanggooroo — blue field hero.
 *
 * The hero uses the blue gradient field (bg-hero-field maps to
 * --gradient-hero, a radial blue gradient). The official academy logo
 * (a kangaroo mascot) anchors the right column inside a white circular
 * badge, with the existing bounce animation preserved on the logo image.
 * Two CTAs drive visitors to the public registration form and the roster.
 *
 * NOTE: This component is not rendered by any page in this task; page
 * tasks own page composition.
 */
function KangarooMascot() {
  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full bg-card/30 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-4 border-card/80 bg-card p-3 shadow-elevated">
        <img
          src="/assets/logo-ssb-sas-kanggooroo.jpeg"
          alt="Maskot kangguru SSB Sas Kanggooroo"
          className="h-full w-full animate-mascot-bounce rounded-full object-contain"
        />
      </div>
    </div>
  );
}

const HIGHLIGHTS = [
  { icon: Users, label: "Pendaftaran Terbuka", value: "Untuk Umum" },
  { icon: Trophy, label: "Akademi Sepak Bola", value: "Berkualitas" },
  { icon: Sparkles, label: "Tanpa Login", value: "Daftar Sekarang" },
];

export default function Hero() {
  return (
    <section
      data-ocid="page.hero"
      className="relative overflow-hidden bg-hero-field"
      aria-labelledby="hero-title"
    >
      {/* Top fade into the blue page */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent"
        aria-hidden="true"
      />

      <div className="container relative py-20 md:py-28">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Copy */}
          <div className="animate-fade-in-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-subtle">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Akademi Sepak Bola SSB Sas Kanggooroo
            </span>
            <h1
              id="hero-title"
              className="font-display text-4xl font-bold leading-tight tracking-tight text-card drop-shadow-sm md:text-6xl"
            >
              Wujudkan Mimpi Pemain Muda di Lapangan Hijau
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-card/90">
              SSB Sas Kanggooroo membina pemain sepak bola muda dengan pelatihan
              terstruktur, semangat sportif, dan maskot kangguru yang tangguh.
              Pendaftaran pemain terbuka untuk umum — daftarkan putra-putri Anda
              tanpa perlu login.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/daftar"
                data-ocid="hero.primary_button"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:opacity-90"
              >
                Daftarkan Pemain
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/#roster"
                data-ocid="hero.secondary_button"
                className="inline-flex items-center gap-2 rounded-full border border-card/40 bg-card/10 px-7 py-3.5 text-sm font-semibold text-card backdrop-blur transition-smooth hover:bg-card/20"
              >
                Lihat Roster Pemain
              </a>
            </div>

            {/* Highlights — white box chips */}
            <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-subtle"
                >
                  <item.icon
                    className="h-5 w-5 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </dt>
                    <dd className="truncate font-display text-sm font-bold text-foreground">
                      {item.value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Mascot — large and prominent */}
          <div className="animate-fade-in">
            <KangarooMascot />
          </div>
        </div>
      </div>

      {/* Bottom fade back to background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
