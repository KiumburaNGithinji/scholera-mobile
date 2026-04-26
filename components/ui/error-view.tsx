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
