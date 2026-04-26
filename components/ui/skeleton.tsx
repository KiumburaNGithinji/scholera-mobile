import { useEffect, useState } from 'react'
import { AccessibilityInfo, View, type DimensionValue, type ViewProps } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated'

export interface SkeletonProps extends ViewProps {
  width?: DimensionValue
  height?: DimensionValue
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
  // Reanimated v4 strict style typings reject `string` widths; cast through unknown
  // for the dimension object since RN runtime accepts DimensionValue (number | "auto" | `${number}%`).
  const dimensionStyle = { width, height } as unknown as { width?: number; height?: number }

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
