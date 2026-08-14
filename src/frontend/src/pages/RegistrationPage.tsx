import { PlayerRegistrationForm } from "@/components/PlayerRegistrationForm";

/* ---------------------------------------------------------------------------
 * SSB Sas Kanggooroo — RegistrationPage (route "/daftar")
 *
 * Full-screen blue gradient wrapper (bg-hero-field) with the registration
 * form inside a white card floating on the blue background.
 * ------------------------------------------------------------------------- */

export function RegistrationPage() {
  return (
    <div className="min-h-screen bg-hero-field">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl">
            SSB Sas Kanggooroo
          </h1>
          <p className="mt-2 text-lg text-white/90">Pendaftaran Pemain Baru</p>
        </header>

        {/* White card surface for the form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated md:p-8">
          <PlayerRegistrationForm />
        </div>
      </div>
    </div>
  );
}
