/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./providers/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Surface tokens (60/30 neutral foundation)
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
        // Foreground tokens
        "fg-primary": "rgb(var(--color-fg-primary) / <alpha-value>)",
        "fg-muted": "rgb(var(--color-fg-muted) / <alpha-value>)",
        // Border
        "border-subtle": "rgb(var(--color-border-subtle) / <alpha-value>)",
        // Role accent — runtime-swapped by RoleThemeProvider via vars()
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        // Semantic colors
        destructive: "rgb(var(--color-destructive) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
      },
      fontFamily: {
        // Inter loaded in app/_layout.tsx via @expo-google-fonts/inter
        sans: ["Inter_400Regular"],
        "sans-semibold": ["Inter_600SemiBold"],
      },
      borderRadius: {
        // radius-sm = rounded-md (6px), radius-md = rounded-xl (12px),
        // radius-lg = rounded-2xl (16px), radius-pill = rounded-full
        // (Tailwind defaults already cover these — no overrides needed)
      },
    },
  },
  plugins: [],
};
