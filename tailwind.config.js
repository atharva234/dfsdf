/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05080f",
          900: "#0a0f1c",
          850: "#0d1424",
          800: "#111a2e",
          700: "#1a2540",
          600: "#263454",
          500: "#3a4a6e",
        },
        gold: {
          DEFAULT: "rgb(217 164 65 / <alpha-value>)",
          bright: "rgb(240 185 84 / <alpha-value>)",
          soft: "rgb(232 197 116 / <alpha-value>)",
          deep: "rgb(138 106 47 / <alpha-value>)",
          dim: "rgb(138 106 47 / <alpha-value>)",
          faint: "rgb(217 164 65 / <alpha-value>)",
        },
        paper: {
          DEFAULT: "rgb(236 229 211 / <alpha-value>)",
          dark: "rgb(217 208 184 / <alpha-value>)",
          edge: "rgb(184 172 142 / <alpha-value>)",
          dim: "rgb(167 176 195 / <alpha-value>)",
        },
        blood: {
          DEFAULT: "rgb(176 54 54 / <alpha-value>)",
          deep: "rgb(58 18 20 / <alpha-value>)",
          bright: "rgb(224 85 69 / <alpha-value>)",
        },
        verdigris: "rgb(74 156 125 / <alpha-value>)",
        alert: {
          DEFAULT: "#c0392b",
          bright: "#e05545",
        },
        verified: "#57a773",
        muted: "#8b96ad",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["Spectral", "Georgia", "serif"],
        display: ["Spectral", "Georgia", "serif"],
        type: ["'Special Elite'", "Courier New", "monospace"],
        stamp: ["'Special Elite'", "Courier New", "monospace"],
      },
      boxShadow: {
        "gold-glow":
          "0 0 0 1px rgba(217,164,65,0.55), 0 0 24px rgba(217,164,65,0.28), inset 0 0 18px rgba(217,164,65,0.10)",
        "gold-glow-soft":
          "0 0 0 1px rgba(217,164,65,0.30), 0 0 14px rgba(217,164,65,0.14)",
        panel: "0 18px 50px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)",
        pin: "0 2px 6px rgba(0,0,0,0.45), 0 6px 14px rgba(0,0,0,0.25)",
        "inner-ledger":
          "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)",
      },
      keyframes: {
        "caret-blink": { "0%, 45%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        blink: { "0%, 45%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 0 1px rgba(224,85,69,0.7), 0 0 16px rgba(224,85,69,0.35)",
          },
          "50%": {
            boxShadow: "0 0 0 1px rgba(224,85,69,0.35), 0 0 6px rgba(224,85,69,0.15)",
          },
        },
        "pulse-red": {
          "0%, 100%": { color: "#e05545", textShadow: "0 0 12px rgba(224,85,69,0.6)" },
          "50%": { color: "#7a231b", textShadow: "0 0 2px rgba(224,85,69,0.2)" },
        },
        "stamp-in": {
          "0%": { transform: "scale(2.2) rotate(-14deg)", opacity: "0" },
          "60%": { transform: "scale(0.95) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-8deg)", opacity: "1" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.6" },
          "94%": { opacity: "1" },
          "97%": { opacity: "0.75" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1s steps(1) infinite",
        blink: "blink 1s steps(1) infinite",
        pulseGlow: "pulseGlow 1.6s ease-in-out infinite",
        "pulse-red": "pulse-red 1s ease-in-out infinite",
        "stamp-in": "stamp-in 0.45s cubic-bezier(0.2,1.4,0.4,1) both",
        flicker: "flicker 4s linear infinite",
      },
    },
  },
  plugins: [],
};
