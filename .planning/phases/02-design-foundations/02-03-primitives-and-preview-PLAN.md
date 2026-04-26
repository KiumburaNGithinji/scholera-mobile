---
phase: 02-design-foundations
plan: 03
type: execute
wave: 2
depends_on: ["02-01", "02-02"]
files_modified:
  - components/ui/button.tsx
  - components/ui/card.tsx
  - components/ui/chip.tsx
  - components/ui/list-row.tsx
  - components/ui/empty-state.tsx
  - components/ui/skeleton.tsx
  - components/ui/error-view.tsx
  - components/ui/index.ts
  - app/dev/preview.tsx
autonomous: true
requirements: [UI-01, UI-02]
must_haves:
  truths:
    - "All 7 primitives exist at components/ui/{button,card,chip,list-row,empty-state,skeleton,error-view}.tsx"
    - "Each primitive renders without runtime errors when imported by the preview screen"
    - "Button supports disabled and isPending props (renders ActivityIndicator inline when isPending=true)"
    - "EmptyState accepts icon (LucideIcon) + title (required) + description (optional) + action (optional CTA)"
    - "Skeleton has shimmer animation via Reanimated useSharedValue (or static fallback for reduced motion)"
    - "ErrorView accepts onRetry callback and renders 'Try again' Button when provided"
    - "Preview screen renders all 7 primitives wrapped in three RoleThemeProvider variants (admin steel, professor clay, student sage) — visually verifying the role swap from Phase 2 SC2"
    - "Chip uses font-normal (400) — NOT font-medium (500) — to honor the 2-weight typography contract (UI-SPEC checker FLAG)"
  artifacts:
    - path: "components/ui/button.tsx"
      provides: "Button primitive with primary/secondary/ghost/destructive variants, sm/md/lg sizes, disabled + isPending props, lucide icon slots"
      exports: ["Button", "ButtonProps", "ButtonVariant", "ButtonSize"]
    - path: "components/ui/card.tsx"
      provides: "Card primitive with default/elevated variants, sm/md/lg padding, optional onPress"
      exports: ["Card", "CardProps"]
    - path: "components/ui/chip.tsx"
      provides: "Chip primitive with neutral/accent/topic/status variants, optional icon, optional selected state"
      exports: ["Chip", "ChipProps", "ChipVariant", "ChipStatus"]
    - path: "components/ui/list-row.tsx"
      provides: "ListRow primitive with title/subtitle, leftIcon OR leftAvatarUrl, trailing slot, chevron, destructive variant"
      exports: ["ListRow", "ListRowProps"]
    - path: "components/ui/empty-state.tsx"
      provides: "EmptyState primitive with icon + title + optional description + optional action CTA"
      exports: ["EmptyState", "EmptyStateProps"]
    - path: "components/ui/skeleton.tsx"
      provides: "Skeleton primitive + presets (SkeletonText, SkeletonHeading, SkeletonCard, SkeletonListRow) with shimmer + reduced-motion fallback"
      exports: ["Skeleton", "SkeletonText", "SkeletonHeading", "SkeletonCard", "SkeletonListRow"]
    - path: "components/ui/error-view.tsx"
      provides: "ErrorView primitive with friendly icon, title/description, optional onRetry button, optional dev-only technical detail"
      exports: ["ErrorView", "ErrorViewProps"]
    - path: "components/ui/index.ts"
      provides: "Barrel export so consumers can import { Button, Card, ... } from '@/components/ui'"
    - path: "app/dev/preview.tsx"
      provides: "Visual smoke test screen — renders all 7 primitives in all 3 role themes; satisfies Phase 2 SC2 + SC3"
  key_links:
    - from: "components/ui/button.tsx"
      to: "tailwind.config.js (accent class binding)"
      via: "className='bg-accent text-white' resolves to whichever role accent is active in the surrounding RoleThemeProvider subtree"
      pattern: "bg-accent"
    - from: "app/dev/preview.tsx"
      to: "providers/role-theme-provider.tsx"
      via: "wraps three column subtrees, each with a different role prop"
      pattern: "RoleThemeProvider role="
    - from: "components/ui/skeleton.tsx"
      to: "react-native-reanimated"
      via: "useSharedValue + useAnimatedStyle for opacity loop"
      pattern: "useSharedValue"
    - from: "components/ui/index.ts"
      to: "all 7 primitive files"
      via: "re-export"
      pattern: "export \\* from"
---

<objective>
Build the 7 UI primitives that every downstream screen consumes, plus a preview screen that renders them all under all three role themes (the visual proof that Phase 2 success criteria 2 + 3 are satisfied).

Purpose: Phases 4-8 (Admin / Professor / Student / Shared / Polish) build screens by composing these primitives — they should never reach for raw `<View>` / `<Text>` / `<Pressable>` again. The 4-state contract (Pending → Skeleton, Error → ErrorView, Empty → EmptyState, Success → list/content) is enforced at the primitive layer so downstream code is purely composition.

Output:
- 7 primitive files under `components/ui/`
- 1 barrel export at `components/ui/index.ts`
- 1 preview screen at `app/dev/preview.tsx` (reachable at `scholera://dev/preview` in dev builds — used as the visual smoke test for SC2 (role swap) and SC3 (all 7 primitives render))

After this plan: Phase 3 can build the sign-in screen using `<Button>`, `<Card>`, etc. with zero design rework; Phase 8's audit pass confirms every screen is using these primitives (not bypassing them).

**Single FLAG resolution from UI-SPEC checker:** Chip currently spec'd as `font-medium` (Inter 500) — this exceeds the declared 2-weight contract (400 + 600). Resolution applied in this plan: Chip uses `font-normal` (Inter 400) so the type contract holds. UI-SPEC line 273 will be considered superseded by this plan's implementation.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02-design-foundations/02-UI-SPEC.md
@.planning/phases/02-design-foundations/02-01-tokens-and-tailwind-PLAN.md
@.planning/phases/02-design-foundations/02-02-providers-and-query-PLAN.md
@theme/tokens.ts
@tailwind.config.js
@providers/role-theme-provider.tsx

<interfaces>
<!-- These are the contracts each primitive consumes — pre-extracted so executor doesn't dig -->

From theme/tokens.ts (Plan 01 — for cases needing JS-side color values):
```typescript
export const tokens = {
  colors: {
    canvas: "#FAF9F5", surface: "#F5F2EB", surfaceElevated: "#FFFFFF",
    fgPrimary: "#2A2622", fgMuted: "#7A736A", borderSubtle: "#E8E2D5",
    accentAdmin: "#64748B", accentProfessor: "#CC785C", accentStudent: "#86A17C",
    destructive: "#B45447", success: "#5E8A60", warning: "#C49355",
  },
  // ... spacing, typography, radius, shadow
}
```

From tailwind.config.js (Plan 01 — Tailwind classes available everywhere):
```
bg-canvas, bg-surface, bg-surface-elevated
text-fg-primary, text-fg-muted
border-border-subtle
bg-accent, text-accent, border-accent (with /10 /30 alpha modifiers — RoleThemeProvider swaps these per role)
bg-destructive, text-destructive (also /10)
bg-success, text-success (also /10)
bg-warning, text-warning (also /10)
font-sans (Inter 400), font-sans-semibold (Inter 600)
```

From providers/role-theme-provider.tsx (Plan 02):
```typescript
export function RoleThemeProvider({ role, children }: { role: Role; children: ReactNode }): JSX.Element
```

From types/app.types.ts (Phase 1):
```typescript
export type Role = 'admin' | 'professor' | 'student'
```

From lucide-react-native (already installed @^1.11.0):
- Used as type: `import type { LucideIcon } from 'lucide-react-native'`
- Icons used in preview: `Inbox`, `BookOpen`, `Users`, `ChevronRight`, `AlertCircle`, `Plus`, `Check`
- Pass color via `color` prop (string hex), size via `size` prop (number)

From react-native-reanimated (~4.1.1 — bundled with SDK 54):
- `useSharedValue`, `useAnimatedStyle`, `withRepeat`, `withTiming`, `Easing`
- `Animated.View` (animated wrapper) — wrap with `Animated.View` for animated styles
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Build the 4 structural primitives — Button, Card, Chip, ListRow + barrel export</name>
  <files>components/ui/button.tsx, components/ui/card.tsx, components/ui/chip.tsx, components/ui/list-row.tsx, components/ui/index.ts</files>
  <read_first>
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (Component Inventory sections 1-4 lines 168-313 — full prop signatures, visual states, composition tokens for Button/Card/Chip/ListRow)
    - tailwind.config.js (confirm class names available — bg-accent, text-fg-primary, border-border-subtle, etc.)
    - providers/role-theme-provider.tsx (these primitives consume bg-accent etc. that the provider swaps)
  </read_first>
  <action>
    Build all 4 structural primitives. Each is a single .tsx file with strict prop types and forwardRef where ref-forwarding makes sense. All Tailwind classes below are pre-resolved against tailwind.config.js (Plan 01).

    **FILE 1 — `components/ui/button.tsx`:**

    ```tsx
    import { forwardRef } from 'react'
    import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native'
    import type { LucideIcon } from 'lucide-react-native'

    export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
    export type ButtonSize = 'sm' | 'md' | 'lg'

    export interface ButtonProps {
      children?: React.ReactNode
      onPress?: () => void
      variant?: ButtonVariant
      size?: ButtonSize
      disabled?: boolean
      isPending?: boolean
      leftIcon?: LucideIcon
      rightIcon?: LucideIcon
      fullWidth?: boolean
      accessibilityLabel?: string
    }

    const baseClasses =
      'flex-row items-center justify-center gap-2 rounded-xl'

    const variantClasses: Record<ButtonVariant, string> = {
      primary:     'bg-accent',
      secondary:   'bg-surface border border-border-subtle',
      ghost:       'bg-transparent',
      destructive: 'bg-destructive',
    }

    const variantTextClasses: Record<ButtonVariant, string> = {
      primary:     'text-white',
      secondary:   'text-fg-primary',
      ghost:       'text-accent',
      destructive: 'text-white',
    }

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'min-h-[36px] px-3 py-2',
      md: 'min-h-[44px] px-4 py-3',
      lg: 'min-h-[52px] px-5 py-4',
    }

    const sizeTextClasses: Record<ButtonSize, string> = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-base',
    }

    export const Button = forwardRef<View, ButtonProps>(function Button(
      {
        children,
        onPress,
        variant = 'primary',
        size = 'md',
        disabled = false,
        isPending = false,
        leftIcon: LeftIcon,
        rightIcon: RightIcon,
        fullWidth = false,
        accessibilityLabel,
      },
      ref,
    ) {
      const isInteractive = !disabled && !isPending
      // Spinner color matches text color for the variant
      const spinnerColor = variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : '#2A2622'
      const iconColor = spinnerColor

      const containerClasses = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40' : '',
      ]
        .filter(Boolean)
        .join(' ')

      const textClasses = [
        'font-sans-semibold',
        sizeTextClasses[size],
        variantTextClasses[variant],
      ].join(' ')

      return (
        <Pressable
          ref={ref as PressableProps['ref']}
          onPress={isInteractive ? onPress : undefined}
          disabled={!isInteractive}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled, busy: isPending }}
          style={({ pressed }) => (pressed && isInteractive ? { opacity: 0.8 } : null)}
          className={containerClasses}
        >
          {isPending ? (
            <ActivityIndicator color={spinnerColor} />
          ) : (
            <>
              {LeftIcon ? <LeftIcon color={iconColor} size={18} /> : null}
              {typeof children === 'string' ? (
                <Text className={textClasses}>{children}</Text>
              ) : (
                children
              )}
              {RightIcon ? <RightIcon color={iconColor} size={18} /> : null}
            </>
          )}
        </Pressable>
      )
    })
    ```

    **FILE 2 — `components/ui/card.tsx`:**

    ```tsx
    import { forwardRef } from 'react'
    import { Pressable, View } from 'react-native'

    export interface CardProps {
      children: React.ReactNode
      onPress?: () => void
      variant?: 'default' | 'elevated'
      padding?: 'sm' | 'md' | 'lg'
      className?: string
    }

    const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5',
    }

    const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
      default:  'bg-surface rounded-xl border border-border-subtle',
      elevated: 'bg-surface rounded-2xl shadow-md',
    }

    export const Card = forwardRef<View, CardProps>(function Card(
      { children, onPress, variant = 'default', padding = 'md', className = '' },
      ref,
    ) {
      const classes = [variantClasses[variant], paddingClasses[padding], className]
        .filter(Boolean)
        .join(' ')

      if (onPress) {
        return (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => (pressed ? { opacity: 0.9 } : null)}
            className={classes}
          >
            {children}
          </Pressable>
        )
      }
      return (
        <View ref={ref} className={classes}>
          {children}
        </View>
      )
    })
    ```

    **FILE 3 — `components/ui/chip.tsx`** — IMPORTANT: uses `font-sans` (Inter 400) NOT `font-medium`. This is the FLAG resolution from UI-SPEC checker — Chip MUST honor the 2-weight contract.

    ```tsx
    import { Pressable, Text, View } from 'react-native'
    import type { LucideIcon } from 'lucide-react-native'

    export type ChipVariant = 'neutral' | 'accent' | 'topic' | 'status'
    export type ChipStatus = 'not-started' | 'in-progress' | 'complete'

    export interface ChipProps {
      label: string
      variant?: ChipVariant
      status?: ChipStatus
      icon?: LucideIcon
      onPress?: () => void
      selected?: boolean
    }

    const baseClasses = 'flex-row items-center gap-1 px-2 py-1 rounded-full border'

    function getVariantClasses(
      variant: ChipVariant,
      status: ChipStatus | undefined,
      selected: boolean,
    ): { container: string; text: string; iconColor: string } {
      if (selected) {
        return {
          container: 'bg-accent border-accent',
          text: 'text-white',
          iconColor: '#FFFFFF',
        }
      }
      if (variant === 'status' && status) {
        if (status === 'not-started') {
          return {
            container: 'bg-surface border-border-subtle',
            text: 'text-fg-muted',
            iconColor: '#7A736A',
          }
        }
        if (status === 'in-progress') {
          return {
            container: 'bg-warning/10 border-warning/30',
            text: 'text-warning',
            iconColor: '#C49355',
          }
        }
        // complete
        return {
          container: 'bg-success/10 border-success/30',
          text: 'text-success',
          iconColor: '#5E8A60',
        }
      }
      if (variant === 'accent') {
        return {
          container: 'bg-accent/10 border-accent/30',
          text: 'text-accent',
          iconColor: '#7A736A', // accent color is dynamic; use muted as a safe icon fallback
        }
      }
      // neutral OR topic — same visual treatment per UI-SPEC
      return {
        container: 'bg-surface border-border-subtle',
        text: variant === 'topic' ? 'text-fg-muted' : 'text-fg-primary',
        iconColor: variant === 'topic' ? '#7A736A' : '#2A2622',
      }
    }

    export function Chip({ label, variant = 'neutral', status, icon: Icon, onPress, selected = false }: ChipProps) {
      const v = getVariantClasses(variant, status, selected)
      // Inter 400 (font-sans) — UI-SPEC FLAG resolution: chip MUST stay within 2-weight contract.
      const textClasses = `text-xs font-sans ${v.text}`
      const containerClasses = `${baseClasses} ${v.container}`

      const content = (
        <>
          {Icon ? <Icon color={v.iconColor} size={12} /> : null}
          <Text className={textClasses}>{label}</Text>
        </>
      )

      if (onPress) {
        return (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => (pressed ? { opacity: 0.8 } : null)}
            className={containerClasses}
            accessibilityRole="button"
          >
            {content}
          </Pressable>
        )
      }
      return <View className={containerClasses}>{content}</View>
    }
    ```

    **FILE 4 — `components/ui/list-row.tsx`:**

    ```tsx
    import { Image, Pressable, Text, View } from 'react-native'
    import { ChevronRight, type LucideIcon } from 'lucide-react-native'

    export interface ListRowProps {
      title: string
      subtitle?: string
      leftIcon?: LucideIcon
      leftAvatarUrl?: string
      trailing?: React.ReactNode
      showChevron?: boolean
      onPress?: () => void
      destructive?: boolean
    }

    export function ListRow({
      title,
      subtitle,
      leftIcon: LeftIcon,
      leftAvatarUrl,
      trailing,
      showChevron,
      onPress,
      destructive = false,
    }: ListRowProps) {
      const titleClasses = `text-base font-sans ${destructive ? 'text-destructive' : 'text-fg-primary'}`
      const subtitleClasses = 'text-xs font-sans text-fg-muted mt-0.5'
      const containerClasses = 'bg-surface px-4 py-3 min-h-[56px] flex-row items-center border-b border-border-subtle'
      const showChev = showChevron ?? Boolean(onPress)

      const leftSlot = (() => {
        if (leftAvatarUrl) {
          return (
            <Image
              source={{ uri: leftAvatarUrl }}
              className="w-8 h-8 rounded-full bg-border-subtle"
              accessibilityLabel="Avatar"
            />
          )
        }
        if (LeftIcon) {
          return (
            <View className="w-6 h-6 items-center justify-center">
              <LeftIcon color={destructive ? '#B45447' : '#2A2622'} size={24} />
            </View>
          )
        }
        return null
      })()

      const content = (
        <>
          {leftSlot ? <View className="mr-3">{leftSlot}</View> : null}
          <View className="flex-1">
            <Text className={titleClasses} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text className={subtitleClasses} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {trailing ? <View className="ml-2">{trailing}</View> : null}
          {showChev ? (
            <View className="ml-2 w-4 h-4 items-center justify-center">
              <ChevronRight color="#7A736A" size={16} />
            </View>
          ) : null}
        </>
      )

      if (onPress) {
        return (
          <Pressable
            onPress={onPress}
            style={({ pressed }) => (pressed ? { backgroundColor: '#FFFFFF' } : null)}
            className={containerClasses}
            accessibilityRole="button"
          >
            {content}
          </Pressable>
        )
      }
      return <View className={containerClasses}>{content}</View>
    }
    ```

    **FILE 5 — `components/ui/index.ts`** — barrel export. Skeleton/EmptyState/ErrorView added in Task 2 will be re-exported here too; this task creates the file with the 4 primitives done so far, and Task 2 appends the remaining 3.

    ```typescript
    export * from './button'
    export * from './card'
    export * from './chip'
    export * from './list-row'
    // EmptyState, Skeleton, ErrorView appended in Task 2
    ```
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && ls components/ui/button.tsx components/ui/card.tsx components/ui/chip.tsx components/ui/list-row.tsx components/ui/index.ts && grep -q "export const Button" components/ui/button.tsx && grep -q "ButtonVariant" components/ui/button.tsx && grep -q "isPending" components/ui/button.tsx && grep -q "ActivityIndicator" components/ui/button.tsx && grep -q "min-h-\[44px\]" components/ui/button.tsx && grep -q "export const Card" components/ui/card.tsx && grep -q "elevated" components/ui/card.tsx && grep -q "export function Chip" components/ui/chip.tsx && grep -q "ChipStatus" components/ui/chip.tsx && grep -q "font-sans" components/ui/chip.tsx && ! grep -q "font-medium" components/ui/chip.tsx && grep -q "export function ListRow" components/ui/list-row.tsx && grep -q "ChevronRight" components/ui/list-row.tsx && grep -q "min-h-\[56px\]" components/ui/list-row.tsx && grep -q "export \* from './button'" components/ui/index.ts && grep -q "export \* from './chip'" components/ui/index.ts && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - All 5 files exist
    - Button: exports `Button`, `ButtonProps`, `ButtonVariant`, `ButtonSize`; supports all 4 variants (primary/secondary/ghost/destructive); supports all 3 sizes (sm/md/lg); honors disabled (opacity-40, no onPress) and isPending (ActivityIndicator inline, no onPress); has accessibilityRole="button" and accessibilityState
    - Card: exports `Card`, `CardProps`; renders Pressable when onPress set, View otherwise; supports default + elevated variants; supports sm/md/lg padding
    - Chip: exports `Chip`, `ChipProps`, `ChipVariant`, `ChipStatus`; uses `font-sans` (NOT `font-medium`) — FLAG fix; supports neutral/accent/topic/status variants; status sub-states (not-started/in-progress/complete) render correct colors; selected overrides to accent bg
    - ListRow: exports `ListRow`, `ListRowProps`; min-h-[56px]; supports leftIcon OR leftAvatarUrl; chevron auto-shows when onPress is set; destructive variant turns title red
    - components/ui/index.ts re-exports the 4 primitives via `export *`
    - `npx tsc --noEmit` exits 0
    - GREP CHECK: `! grep -q "font-medium" components/ui/chip.tsx` (FLAG fix verified)
  </acceptance_criteria>
  <done>4 structural primitives + barrel export exist, all use only Tailwind classes from Plan 01's tailwind.config.js, Chip honors the 2-weight typography contract (font-sans not font-medium), tsc passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build the 3 state primitives — EmptyState, Skeleton (with shimmer), ErrorView + extend barrel export</name>
  <files>components/ui/empty-state.tsx, components/ui/skeleton.tsx, components/ui/error-view.tsx, components/ui/index.ts</files>
  <read_first>
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (Component Inventory sections 5-7 lines 315-431 — EmptyState/Skeleton/ErrorView prop signatures + visual layouts)
    - components/ui/button.tsx (just authored — EmptyState and ErrorView render Button instances)
    - components/ui/index.ts (just authored — extend with the 3 new primitives)
  </read_first>
  <action>
    Build the 3 state primitives. EmptyState and ErrorView reuse Button (from Task 1). Skeleton uses Reanimated for shimmer with a reduced-motion fallback.

    **FILE 1 — `components/ui/empty-state.tsx`:**

    ```tsx
    import { Text, View } from 'react-native'
    import type { LucideIcon } from 'lucide-react-native'
    import { Button } from './button'

    export interface EmptyStateProps {
      icon: LucideIcon
      title: string
      description?: string
      action?: {
        label: string
        onPress: () => void
      }
    }

    export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="w-16 h-16 rounded-full bg-surface items-center justify-center mb-4">
            <Icon color="#7A736A" size={24} />
          </View>
          <Text className="text-xl font-sans-semibold text-fg-primary text-center">{title}</Text>
          {description ? (
            <Text className="text-base font-sans text-fg-muted text-center mt-2 max-w-[280px]">
              {description}
            </Text>
          ) : null}
          {action ? (
            <View className="mt-6">
              <Button variant="primary" size="md" onPress={action.onPress}>
                {action.label}
              </Button>
            </View>
          ) : null}
        </View>
      )
    }
    ```

    **FILE 2 — `components/ui/skeleton.tsx`** — uses Reanimated shared value opacity loop (UI-SPEC Open Question 2 chose this over LinearGradient for time budget). Falls back to static when reduced motion is on.

    ```tsx
    import { useEffect, useState } from 'react'
    import { AccessibilityInfo, View, type ViewProps } from 'react-native'
    import Animated, {
      useSharedValue,
      useAnimatedStyle,
      withRepeat,
      withTiming,
      Easing,
    } from 'react-native-reanimated'

    export interface SkeletonProps extends ViewProps {
      width?: number | string
      height?: number | string
      className?: string
    }

    function useReducedMotion(): boolean {
      const [reduced, setReduced] = useState(false)
      useEffect(() => {
        let mounted = true
        AccessibilityInfo.isReduceMotionEnabled()
          .then((v) => {
            if (mounted) setReduced(v)
          })
          .catch(() => {
            // Non-fatal; default to false (animate).
          })
        const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
        return () => {
          mounted = false
          sub.remove()
        }
      }, [])
      return reduced
    }

    export function Skeleton({ width, height, className = '', style, ...rest }: SkeletonProps) {
      const reducedMotion = useReducedMotion()
      const opacity = useSharedValue(0.5)

      useEffect(() => {
        if (reducedMotion) {
          opacity.value = 0.6
          return
        }
        opacity.value = withRepeat(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        )
      }, [reducedMotion, opacity])

      const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

      const baseClasses = 'bg-border-subtle rounded-md'
      const dimensionStyle = {
        width: typeof width === 'number' ? width : (width ?? undefined),
        height: typeof height === 'number' ? height : (height ?? undefined),
      }

      return (
        <Animated.View
          {...rest}
          className={`${baseClasses} ${className}`}
          style={[dimensionStyle, animatedStyle, style]}
        />
      )
    }

    /* ---------- Skeleton presets ---------- */

    export function SkeletonText({ lines = 1 }: { lines?: number }) {
      return (
        <View>
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              height={16}
              width={i === lines - 1 && lines > 1 ? '70%' : '100%'}
              className={i === 0 ? '' : 'mt-2'}
            />
          ))}
        </View>
      )
    }

    export function SkeletonHeading() {
      return <Skeleton height={24} width="60%" />
    }

    export function SkeletonCard() {
      return (
        <View className="bg-surface rounded-xl border border-border-subtle p-4">
          <SkeletonHeading />
          <View className="mt-3">
            <SkeletonText lines={2} />
          </View>
        </View>
      )
    }

    export function SkeletonListRow() {
      return (
        <View className="bg-surface px-4 py-3 min-h-[56px] flex-row items-center border-b border-border-subtle">
          <Skeleton width={24} height={24} className="rounded-full" />
          <View className="flex-1 ml-3">
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="40%" className="mt-2" />
          </View>
        </View>
      )
    }
    ```

    **FILE 3 — `components/ui/error-view.tsx`:**

    ```tsx
    import { Text, View } from 'react-native'
    import { AlertCircle } from 'lucide-react-native'
    import { Button } from './button'

    export interface ErrorViewProps {
      title?: string
      description?: string
      onRetry?: () => void
      technical?: string
    }

    export function ErrorView({
      title = 'Something went wrong',
      description = 'Please check your connection and try again.',
      onRetry,
      technical,
    }: ErrorViewProps) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-12">
          <View className="w-16 h-16 rounded-full bg-destructive/10 items-center justify-center mb-4">
            <AlertCircle color="#B45447" size={24} />
          </View>
          <Text className="text-xl font-sans-semibold text-fg-primary text-center">{title}</Text>
          <Text className="text-base font-sans text-fg-muted text-center mt-2 max-w-[320px]">
            {description}
          </Text>
          {onRetry ? (
            <View className="mt-6">
              <Button variant="secondary" size="md" onPress={onRetry}>
                Try again
              </Button>
            </View>
          ) : null}
          {__DEV__ && technical ? (
            <Text className="text-xs font-sans text-fg-muted mt-4 px-4 text-center">{technical}</Text>
          ) : null}
        </View>
      )
    }
    ```

    **FILE 4 — Append to `components/ui/index.ts`** so it now re-exports all 7 primitives:

    Final contents of `components/ui/index.ts` (overwrite the Task 1 version):

    ```typescript
    export * from './button'
    export * from './card'
    export * from './chip'
    export * from './list-row'
    export * from './empty-state'
    export * from './skeleton'
    export * from './error-view'
    ```

    **NOTE on Reanimated v4:** Phase 1 plan 03 SUMMARY confirmed `react-native-reanimated@~4.1.1` is installed (SDK 54 native install resolved to v4.1.1, not v3 as STACK.md predicted). The shared-value API used here (`useSharedValue`, `useAnimatedStyle`, `withRepeat`, `withTiming`, `Easing`) is stable across v3 and v4 — this code works on both. If the executor encounters a runtime error from Reanimated, the most likely cause is a missing Babel plugin — but the project's babel.config.js (Phase 1 plan 03) uses `babel-preset-expo` which includes the worklets plugin automatically on SDK 54. No additional config needed.
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && ls components/ui/empty-state.tsx components/ui/skeleton.tsx components/ui/error-view.tsx && grep -q "export function EmptyState" components/ui/empty-state.tsx && grep -q "icon: LucideIcon" components/ui/empty-state.tsx && grep -q "import { Button }" components/ui/empty-state.tsx && grep -q "export function Skeleton" components/ui/skeleton.tsx && grep -q "useSharedValue" components/ui/skeleton.tsx && grep -q "useAnimatedStyle" components/ui/skeleton.tsx && grep -q "withRepeat" components/ui/skeleton.tsx && grep -q "AccessibilityInfo.isReduceMotionEnabled" components/ui/skeleton.tsx && grep -q "export function SkeletonText" components/ui/skeleton.tsx && grep -q "export function SkeletonHeading" components/ui/skeleton.tsx && grep -q "export function SkeletonCard" components/ui/skeleton.tsx && grep -q "export function SkeletonListRow" components/ui/skeleton.tsx && grep -q "export function ErrorView" components/ui/error-view.tsx && grep -q "AlertCircle" components/ui/error-view.tsx && grep -q "Try again" components/ui/error-view.tsx && grep -q "__DEV__" components/ui/error-view.tsx && grep -q "export \* from './empty-state'" components/ui/index.ts && grep -q "export \* from './skeleton'" components/ui/index.ts && grep -q "export \* from './error-view'" components/ui/index.ts && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - components/ui/empty-state.tsx exists; exports `EmptyState`, `EmptyStateProps`; renders 64×64 icon container (rounded-full bg-surface), title (text-xl font-sans-semibold), optional description, optional Button CTA
    - components/ui/skeleton.tsx exists; exports `Skeleton`, `SkeletonText`, `SkeletonHeading`, `SkeletonCard`, `SkeletonListRow`; uses `useSharedValue` + `useAnimatedStyle` + `withRepeat` from Reanimated; has reduced-motion check via `AccessibilityInfo.isReduceMotionEnabled()`
    - components/ui/error-view.tsx exists; exports `ErrorView`, `ErrorViewProps`; defaults to "Something went wrong" / "Please check your connection and try again."; renders AlertCircle in destructive-tinted icon container; renders Button (secondary) when onRetry provided; renders technical detail only when `__DEV__ && technical`
    - components/ui/index.ts now re-exports all 7 primitives via `export *`
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>3 state primitives complete with Reanimated-backed shimmer + reduced-motion fallback for Skeleton; barrel export covers all 7 primitives; tsc passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Build the preview screen — visual smoke test for SC2 (role swap) + SC3 (all 7 render)</name>
  <files>app/dev/preview.tsx</files>
  <read_first>
    - .planning/phases/02-design-foundations/02-UI-SPEC.md (Open Question 3 line 632 — "STRONGLY recommend yes — it's the verification artifact for SC2 and SC3 in one screen")
    - components/ui/index.ts (just finalized — confirms what's exportable)
    - providers/role-theme-provider.tsx (the wrapper that drives the role swap)
    - .planning/ROADMAP.md (Phase 2 success criteria — verify what this screen must demonstrate)
  </read_first>
  <action>
    Create the preview screen at `app/dev/preview.tsx` (reachable as `scholera://dev/preview` in dev builds). It renders all 7 primitives in three side-by-side columns (one column per role), each column wrapped in a `RoleThemeProvider`. The visual proof: the same `<Button variant="primary">` shows steel in the admin column, clay in the professor column, sage in the student column — with NO per-component color logic.

    Write `app/dev/preview.tsx` with EXACTLY these contents:

    ```tsx
    import { ScrollView, Text, View } from 'react-native'
    import { Inbox, BookOpen, Users, Plus, Check } from 'lucide-react-native'
    import { RoleThemeProvider } from '@/providers/role-theme-provider'
    import type { Role } from '@/types/app.types'
    import {
      Button,
      Card,
      Chip,
      ListRow,
      EmptyState,
      SkeletonCard,
      SkeletonListRow,
      ErrorView,
    } from '@/components/ui'

    /**
     * /dev/preview — Phase 2 visual smoke test.
     *
     * Renders all 7 primitives wrapped in three RoleThemeProvider variants stacked
     * vertically. Visually proves Phase 2 SC2 (role swap works) + SC3 (all 7 render).
     *
     * Reach via:
     *   - Dev build: scholera://dev/preview
     *   - Expo Go: tap the URL in the terminal output
     *
     * This screen is intentionally not gated by auth — Phase 2 is pre-auth.
     * Phase 3 may move it under a dev-only group, but for Phase 2 verification it
     * stays reachable from the unauthenticated root stack.
     */

    const ROLES: Role[] = ['admin', 'professor', 'student']

    function PrimitivesShowcase() {
      return (
        <View className="gap-4">
          {/* Buttons: all 4 variants + isPending + disabled */}
          <View className="gap-2">
            <Button variant="primary" onPress={() => {}}>Primary</Button>
            <Button variant="secondary" onPress={() => {}}>Secondary</Button>
            <Button variant="ghost" onPress={() => {}}>Ghost</Button>
            <Button variant="destructive" onPress={() => {}}>Destructive</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" isPending>Pending</Button>
            <Button variant="primary" leftIcon={Plus} onPress={() => {}}>With icon</Button>
          </View>

          {/* Card: default + elevated */}
          <Card>
            <Text className="text-base font-sans-semibold text-fg-primary">Default card</Text>
            <Text className="text-xs font-sans text-fg-muted mt-1">
              Surface bg + subtle border
            </Text>
          </Card>
          <Card variant="elevated">
            <Text className="text-base font-sans-semibold text-fg-primary">Elevated card</Text>
            <Text className="text-xs font-sans text-fg-muted mt-1">Shadow, no border</Text>
          </Card>

          {/* Chips: all variants */}
          <View className="flex-row flex-wrap gap-2">
            <Chip label="Neutral" />
            <Chip label="Accent" variant="accent" />
            <Chip label="Topic" variant="topic" />
            <Chip label="Not started" variant="status" status="not-started" />
            <Chip label="In progress" variant="status" status="in-progress" />
            <Chip label="Complete" variant="status" status="complete" icon={Check} />
            <Chip label="Selected" selected />
          </View>

          {/* ListRow: stacked group */}
          <Card padding="sm">
            <ListRow
              title="With icon"
              subtitle="Subtitle line"
              leftIcon={BookOpen}
              onPress={() => {}}
            />
            <ListRow
              title="With trailing chip"
              subtitle="Multiple slots"
              leftIcon={Users}
              trailing={<Chip label="3" variant="neutral" />}
              onPress={() => {}}
            />
            <ListRow title="Destructive" leftIcon={Inbox} destructive onPress={() => {}} />
          </Card>

          {/* EmptyState — bounded height so it sits inside the column */}
          <View style={{ height: 240 }}>
            <EmptyState
              icon={Inbox}
              title="No items yet"
              description="When you add an item, it will appear here."
              action={{ label: 'Add item', onPress: () => {} }}
            />
          </View>

          {/* Skeleton presets */}
          <SkeletonCard />
          <Card padding="sm">
            <SkeletonListRow />
            <SkeletonListRow />
          </Card>

          {/* ErrorView — bounded height */}
          <View style={{ height: 240 }}>
            <ErrorView
              onRetry={() => {}}
              technical="ENOTFOUND api.example.com"
            />
          </View>
        </View>
      )
    }

    export default function PreviewScreen() {
      return (
        <ScrollView className="flex-1 bg-canvas">
          <View className="px-4 py-6">
            <Text className="text-3xl font-sans-semibold text-fg-primary">Phase 2 Preview</Text>
            <Text className="text-base font-sans text-fg-muted mt-1">
              All 7 primitives × 3 role themes
            </Text>
          </View>

          {ROLES.map((role) => (
            <View key={role} className="px-4 pb-8">
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="text-xl font-sans-semibold text-fg-primary capitalize">
                  {role}
                </Text>
                <Chip label={role} variant="accent" />
              </View>
              <RoleThemeProvider role={role}>
                <PrimitivesShowcase />
              </RoleThemeProvider>
            </View>
          ))}
        </ScrollView>
      )
    }
    ```

    Note the structure: each role section has its OWN `RoleThemeProvider` wrapper. Inside, every `bg-accent` / `text-accent` resolves to that role's color. The `<Chip label={role} variant="accent" />` ABOVE the provider intentionally shows the default (student sage) accent — comparing it against the Chip inside the provider proves the swap is working.

    DO NOT mount this under a parent stack with custom screenOptions — let it inherit the root stack's `headerShown: false` from app/_layout.tsx.

    DO NOT add any data fetching to this screen — it's a static visual showcase, no QueryClient needed (although QueryProvider is already mounted from Plan 02 if anything needed it).

    File location `app/dev/preview.tsx` makes the route `scholera://dev/preview` automatically via Expo Router's file-based routing (Phase 1 STACK.md confirms).
  </action>
  <verify>
    <automated>cd /Users/Kiumbura/Projects/scholera-mobile && ls app/dev/preview.tsx && grep -q "import { RoleThemeProvider }" app/dev/preview.tsx && grep -q "from '@/components/ui'" app/dev/preview.tsx && grep -q "Button" app/dev/preview.tsx && grep -q "Card" app/dev/preview.tsx && grep -q "Chip" app/dev/preview.tsx && grep -q "ListRow" app/dev/preview.tsx && grep -q "EmptyState" app/dev/preview.tsx && grep -q "SkeletonCard" app/dev/preview.tsx && grep -q "SkeletonListRow" app/dev/preview.tsx && grep -q "ErrorView" app/dev/preview.tsx && grep -q "ROLES: Role\[\] = \['admin', 'professor', 'student'\]" app/dev/preview.tsx && grep -q "RoleThemeProvider role={role}" app/dev/preview.tsx && grep -q "isPending" app/dev/preview.tsx && grep -q "disabled" app/dev/preview.tsx && grep -q "variant=\"elevated\"" app/dev/preview.tsx && grep -q "variant=\"status\"" app/dev/preview.tsx && grep -q "status=\"in-progress\"" app/dev/preview.tsx && grep -q "status=\"complete\"" app/dev/preview.tsx && grep -q "destructive" app/dev/preview.tsx && grep -q "onRetry" app/dev/preview.tsx && grep -q "action: { label" app/dev/preview.tsx | head -1 ; grep -q "action={{" app/dev/preview.tsx && npx tsc --noEmit && echo "PASS"</automated>
  </verify>
  <acceptance_criteria>
    - app/dev/preview.tsx exists
    - File imports RoleThemeProvider from `@/providers/role-theme-provider`
    - File imports all 7 primitives (Button, Card, Chip, ListRow, EmptyState, SkeletonCard/SkeletonListRow, ErrorView) from `@/components/ui`
    - ROLES array contains exactly: 'admin', 'professor', 'student'
    - Three RoleThemeProvider sections rendered (one per role, mapped from ROLES)
    - PrimitivesShowcase renders ALL of: Button (primary, secondary, ghost, destructive, disabled, isPending, with-icon), Card (default + elevated), Chip (neutral, accent, topic, status × 3 sub-states, selected), ListRow (with icon, with trailing, destructive), EmptyState (with action), SkeletonCard, SkeletonListRow, ErrorView (with onRetry + technical)
    - Default export is a React component (`PreviewScreen`)
    - `npx tsc --noEmit` exits 0
  </acceptance_criteria>
  <done>app/dev/preview.tsx renders all 7 primitives within three RoleThemeProvider wrappers (admin/professor/student) — running `npx expo start` and navigating to `/dev/preview` will show three vertically-stacked sections where the same primary Button + selected Chip + EmptyState action button visibly differ in color (steel → clay → sage); tsc passes.</done>
</task>

</tasks>

<verification>
After all 3 tasks complete:

```bash
cd /Users/Kiumbura/Projects/scholera-mobile

# 1. All 7 primitive files exist
ls components/ui/{button,card,chip,list-row,empty-state,skeleton,error-view}.tsx

# 2. Barrel exports all 7
grep -c '^export \* from' components/ui/index.ts   # expect: 7

# 3. Preview screen exists
ls app/dev/preview.tsx

# 4. Chip FLAG fix (no font-medium leak)
! grep -q 'font-medium' components/ui/chip.tsx

# 5. TS clean across the whole project
npx tsc --noEmit

# 6. (Manual smoke test, not automated):
#    npx expo start  →  navigate to /dev/preview  →
#    confirm three role sections each show DIFFERENT accent colors
#    (steel/clay/sage) on the primary Button + selected Chip + EmptyState action.
```

**Phase 2 success criteria full coverage:**
- SC1 (token system) — Plan 01
- SC2 (RoleThemeProvider role swap) — Plan 02 builds; this plan demonstrates via preview screen
- SC3 (all 7 primitives render) — this plan
- SC4 (QueryClient defaults) — Plan 02
- SC5 (every list uses EmptyState, every async uses Skeleton) — primitives ship in this plan; downstream phases (4-8) consume them; Phase 8 audit enforces

**Phase 2 requirement coverage:**
- UI-01 (design system + 7 primitives + RoleThemeProvider) — Plans 01 + 02 + 03
- UI-02 (empty/loading/error states exist as primitives) — this plan (Plan 03)
</verification>

<success_criteria>
1. All 7 primitives exist at `components/ui/` and compile under strict TypeScript
2. Each primitive consumes ONLY Tailwind classes from the Plan 01 token system (no inline hex colors except for icon `color` props which need string values)
3. Chip uses `font-sans` (Inter 400) — UI-SPEC checker FLAG resolved (NOT `font-medium` Inter 500)
4. Skeleton has Reanimated shimmer with reduced-motion fallback via `AccessibilityInfo`
5. Button supports `disabled` (opacity-40, no onPress) and `isPending` (ActivityIndicator inline, no onPress) per UI-SPEC visual states
6. EmptyState accepts the optional `action: { label, onPress }` prop; preview screen uses it
7. ErrorView defaults to "Something went wrong" / "Please check your connection and try again." / "Try again" copy verbatim
8. `components/ui/index.ts` barrel exports all 7 primitives
9. `app/dev/preview.tsx` renders all 7 primitives wrapped in three RoleThemeProvider variants (admin steel, professor clay, student sage)
10. `npx tsc --noEmit` exits 0 — no type errors anywhere in the project
</success_criteria>

<output>
After completion, create `.planning/phases/02-design-foundations/02-03-primitives-and-preview-SUMMARY.md` documenting:
- The 7 primitives shipped (file paths, key exports, variant counts)
- Confirmation of the Chip FLAG fix (font-sans not font-medium)
- Confirmation that Skeleton uses Reanimated useSharedValue + reduced-motion fallback
- The preview screen structure (3 role sections × all 7 primitives)
- How to manually verify SC2 (run expo start, navigate to /dev/preview, observe accent colors differ across role sections)
- Any auto-fixed deviations encountered during implementation
- What Phases 3-8 inherit from this layer (the 4-state contract: Pending → Skeleton, Error → ErrorView, Empty → EmptyState, Success → content)
</output>
