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
