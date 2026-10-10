/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Design token colours (from DESIGN.md) ───────────────────────────
      colors: {
        primary: {
          DEFAULT: "#000000",
          container: "#3a0908",
          "fixed": "#ffdad6",
          "fixed-dim": "#ffb3ac",
        },
        "on-primary": "#ffffff",
        "on-primary-container": "#bc6f68",
        "inverse-primary": "#ffb3ac",

        secondary: {
          DEFAULT: "#864f4d",
          container: "#ffb7b4",
          "fixed": "#ffdad8",
          "fixed-dim": "#fcb5b1",
        },
        "on-secondary": "#ffffff",
        "on-secondary-container": "#7b4543",

        tertiary: {
          DEFAULT: "#000000",
          container: "#041a40",
          "fixed": "#d9e2ff",
          "fixed-dim": "#b4c6f5",
        },
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#7283af",

        surface: {
          DEFAULT: "#fff8f6",
          dim: "#e4d7d5",
          bright: "#fff8f6",
          "container-lowest": "#ffffff",
          "container-low": "#fef1ee",
          container: "#f8ebe8",
          "container-high": "#f3e5e3",
          "container-highest": "#ede0dd",
          variant: "#ede0dd",
          tint: "#8f4a45",
        },
        "on-surface": "#201a19",
        "on-surface-variant": "#534341",
        "inverse-surface": "#362f2d",
        "inverse-on-surface": "#fbeeeb",

        outline: {
          DEFAULT: "#867371",
          variant: "#d8c1bf",
        },

        background: "#fff8f6",
        "on-background": "#201a19",

        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
      },

      // ── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        display: ["Literata", "Georgia", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "500" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "500" }],
      },

      // ── Border radius ────────────────────────────────────────────────────
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },

      // ── Spacing ──────────────────────────────────────────────────────────
      spacing: {
        "gutter": "24px",
        "margin-mobile": "20px",
        "margin-desktop": "64px",
        "stack-sm": "12px",
        "stack-md": "24px",
        "stack-lg": "48px",
      },

      // ── Warm ambient shadow ──────────────────────────────────────────────
      boxShadow: {
        card: "0 1px 4px 0 rgba(52, 5, 5, 0.04), 0 4px 16px 0 rgba(52, 5, 5, 0.04)",
        elevated: "0 2px 8px 0 rgba(52, 5, 5, 0.06), 0 8px 32px 0 rgba(52, 5, 5, 0.06)",
      },
    },
  },
  plugins: [],
};
