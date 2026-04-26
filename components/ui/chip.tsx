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
