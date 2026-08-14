import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ArrowLeft, ShieldCheck } from "lucide-react";

/**
 * SSB Sas Kanggooroo — admin/coach Internet Identity sign-in page.
 *
 * Rebranded from the salon sign-in surface. Provides a plain Internet
 * Identity login (the supported path for admin/coach access). The II
 * provider URL is injected from the deployment environment by the template
 * — never hardcode one here.
 */
function InternetIdentityIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M23.9996 5.73913C23.9996 2.57459 21.3805 0 18.1664 0C16.8264 0 15.3672 0.69587 13.8214 2.06778C13.0906 2.71638 12.4569 3.41014 11.981 3.96802C10.3102 2.08297 8.06944 0 5.83323 0C3.13036 0 0.77332 1.8956 0.159997 4.40731C0.0554157 4.83522 0 5.28127 0 5.73913C0 8.90367 2.57746 11.4783 5.79157 11.4783C7.13154 11.4783 8.63235 10.7824 10.1782 9.41049C10.909 8.76188 11.5427 8.06812 12.0185 7.51024C13.6893 9.39529 15.9306 11.4783 18.1668 11.4783C20.8696 11.4783 23.2267 9.58266 23.84 7.07137C23.9446 6.64347 24 6.19742 24 5.73955L23.9996 5.73913ZM5.79157 11.1407C4.32701 11.1407 2.9537 10.5773 1.92372 9.55439C0.897901 8.53569 0.333328 7.18067 0.333328 5.73913C0.333328 5.32136 0.383327 4.90358 0.481242 4.49804C0.497908 4.44951 0.699988 3.88995 1.27498 3.346C2.02288 2.63831 3.03661 2.27919 4.28826 2.27877C2.94203 2.87125 2.00038 4.20223 2.00038 5.73913C2.00038 7.82843 3.71994 9.5278 5.83323 9.5278C6.34406 9.5278 7.23737 9.27208 8.61152 8.05209C9.349 7.39757 9.99066 6.66837 10.4357 6.13328L11.5702 7.51615C11.0236 8.14028 10.4823 8.69141 9.95816 9.15644C8.49569 10.4545 7.05488 11.1407 5.79157 11.1407ZM18.1664 11.1407C16.7126 11.1407 15.5247 10.4545 14.0414 9.15644C13.5173 8.69141 12.976 8.14028 12.4294 7.51615L13.5514 6.13328C13.9964 6.66837 14.6381 7.39757 15.3756 8.05209C16.7497 9.27208 17.643 9.5278 18.1664 9.5278C20.2796 9.5278 21.9992 7.82843 21.9992 5.73913C21.9992 4.20223 21.0576 2.87125 19.7113 2.27877C20.963 2.27919 21.9767 2.63831 22.7246 3.346C23.2996 3.88995 23.5017 4.44951 23.5184 4.49804C23.6167 4.90358 23.6663 5.32136 23.6663 5.73913C23.6663 7.18067 23.1018 8.53569 22.0759 9.55439C21.046 10.5773 19.6726 11.1407 18.1664 11.1407Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SignInPage({ onBack }: { onBack: () => void }) {
  const { login, isInitializing, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();
  const disabled = isInitializing || isLoggingIn;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center">
          <button
            type="button"
            onClick={onBack}
            data-ocid="signin.back_button"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-10">
          <div className="mb-8 text-center">
            <span
              className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent"
              aria-hidden="true"
            >
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Masuk Admin / Pelatih
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Masuk dengan Internet Identity untuk mengelola pemain terdaftar
              SSB Sas Kanggooroo. Hanya admin dan pelatih yang dapat mengedit
              atau menghapus data pemain.
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => login()}
              disabled={disabled}
              data-ocid="signin.ii_button"
              className="flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-full bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-subtle transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:text-base"
            >
              <InternetIdentityIcon className="h-3.5 w-7 shrink-0" />
              {isLoggingIn
                ? "Membuka masuk…"
                : "Masuk dengan Internet Identity"}
            </button>
          </div>

          {isLoginError && (
            <p
              data-ocid="signin.error_state"
              className="mt-5 text-center text-sm text-destructive"
            >
              {loginError?.message ?? "Masuk gagal. Silakan coba lagi."}
            </p>
          )}

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            Pendaftaran pemain terbuka untuk umum tanpa login. Halaman ini
            khusus untuk admin dan pelatih yang terverifikasi.
          </p>
        </div>
      </main>
    </div>
  );
}
