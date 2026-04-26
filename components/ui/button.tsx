import { forwardRef, type Ref } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
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
      ref={ref as Ref<View>}
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
