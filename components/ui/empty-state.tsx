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
