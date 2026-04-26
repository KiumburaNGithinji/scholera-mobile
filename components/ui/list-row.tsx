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
