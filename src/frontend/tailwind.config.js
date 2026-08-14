import containerQueries from "@tailwindcss/container-queries";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["index.html", "src/**/*.{js,ts,jsx,tsx,html,css}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: [
          "DMSans",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["SpaceGrotesk", "system-ui", "sans-serif"],
        mono: ["GeistMono", "JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        /* Brand palette — warm earth tones (legacy) */
        cream: "#FAF6F0",
        sand: "#F1E8DC",
        espresso: "#2E2420",
        cocoa: "#5C4B40",
        clay: "#B0693C",
        "clay-dark": "#94542E",

        /* Semantic tokens — mapped from CSS custom properties
           so utilities like bg-background, text-foreground,
           border-border, bg-primary, bg-card, bg-accent resolve
           under Tailwind v3. Keep in sync with :root in index.css. */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      boxShadow: {
        subtle:
          "0 1px 2px 0 oklch(0.45 0.18 250 / 0.06), 0 1px 3px 0 oklch(0.45 0.18 250 / 0.04)",
        elevated:
          "0 4px 12px -2px oklch(0.45 0.18 250 / 0.10), 0 2px 6px -2px oklch(0.45 0.18 250 / 0.06)",
        pitch:
          "0 8px 24px -4px oklch(0.45 0.13 150 / 0.18), 0 4px 10px -3px oklch(0.45 0.13 150 / 0.10)",
        menu: "0 2px 8px -2px oklch(0.3 0.1 255 / 0.18)",
      },
      keyframes: {
        "mascot-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "mascot-bounce": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "30%": { transform: "translateY(-14px) rotate(-3deg)" },
          "60%": { transform: "translateY(-4px) rotate(2deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "whistle-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
      },
      animation: {
        "mascot-float": "mascot-float 4s ease-in-out infinite",
        "mascot-bounce": "mascot-bounce 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
        "whistle-pulse": "whistle-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [typography, containerQueries, animate],
};
