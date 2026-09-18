/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // KrishiSetu semantic tokens — driven from CSS vars to match Lovable exactly
        trader: {
          DEFAULT: "hsl(var(--trader))",
          foreground: "hsl(var(--trader-foreground))",
        },
        market: {
          DEFAULT: "hsl(var(--market))",
          foreground: "hsl(var(--market-foreground))",
        },
        "surface-strong": {
          DEFAULT: "hsl(var(--surface-strong))",
          foreground: "hsl(var(--surface-strong-foreground))",
        },
      },
      fontFamily: {
        // Matches Lovable: --font-display: "Newsreader", --font-sans: "Manrope"
        display: ["Newsreader", "serif"],
        sans: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        // --radius: 0.375rem (Lovable), derived values match Lovable @theme inline
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Lovable persona section animation
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      // h-18 utility used in header (Lovable: grid h-18)
      height: {
        "18": "4.5rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
