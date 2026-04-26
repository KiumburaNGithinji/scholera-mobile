/**
 * Design tokens — typed JS-side mirror of global.css :root variables.
 *
 * The CSS vars in global.css are the SOURCE OF TRUTH for colors at render time
 * (Tailwind classes resolve to rgb(var(--color-X)) at runtime). This file exists
 * for the rare cases where JS needs a literal value:
 *   - Passing color to a lucide-react-native <Icon color={tokens.colors.fgMuted} />
 *   - Setting iOS shadowColor in a StyleSheet (shadow-card primitive)
 *   - Reading a value in a non-Tailwind context (Reanimated, animation interpolation)
 *
 * The hex strings here MUST stay in sync with global.css triplets.
 * If you change a value, change BOTH files.
 */

export const tokens = {
  colors: {
    // Surface (60/30 neutral foundation)
    canvas: "#FAF9F5",
    surface: "#F5F2EB",
    surfaceElevated: "#FFFFFF",
    // Foreground
    fgPrimary: "#2A2622",
    fgMuted: "#7A736A",
    // Border
    borderSubtle: "#E8E2D5",
    // Role accents (RoleThemeProvider injects one of these via CSS var)
    accentAdmin: "#64748B",     // steel
    accentProfessor: "#CC785C", // clay
    accentStudent: "#86A17C",   // sage (default)
    // Semantic
    destructive: "#B45447",
    success: "#5E8A60",
    warning: "#C49355",
  },
  spacing: {
    // Multiples of 4 — match Tailwind default scale (1 unit = 4px)
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 32,
    "3xl": 48,
    "4xl": 64,
    // Touch target minimum — iOS HIG / Material non-negotiable
    touchTarget: 44,
  },
  typography: {
    // 4 sizes × 2 weights = 8 type combinations max (UI-SPEC Typography section)
    sizes: {
      caption: 12,
      body: 16,
      heading: 20,
      display: 30,
    },
    lineHeights: {
      caption: 16,
      body: 24,
      heading: 28,
      display: 36,
    },
    weights: {
      regular: "400",
      semibold: "600",
    },
    fontFamily: {
      regular: "Inter_400Regular",
      semibold: "Inter_600SemiBold",
    },
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    pill: 9999,
  },
  shadow: {
    // iOS shadow values — Android uses elevation prop
    card: {
      shadowColor: "#2A2622",
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    modal: {
      shadowColor: "#2A2622",
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  },
} as const;

export type Tokens = typeof tokens;
