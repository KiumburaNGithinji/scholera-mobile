import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui'
import { useAuth } from '@/providers/auth-provider'

const SignInSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type SignInForm = z.infer<typeof SignInSchema>

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: SignInForm) {
    setSubmitError(null)
    setPending(true)
    const { error } = await signIn(values.email.trim(), values.password)
    setPending(false)
    if (error) setSubmitError(error)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-canvas"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-12">
          <Text className="text-3xl font-sans-semibold text-fg-primary mb-2">
            Welcome back
          </Text>
          <Text className="text-base font-sans text-fg-muted mb-8">
            Sign in to Scholera
          </Text>

          <View className="mb-4">
            <Text className="text-base font-sans text-fg-primary mb-2">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="min-h-[44px] px-4 py-3 rounded-xl bg-surface border border-border-subtle text-base font-sans text-fg-primary"
                  placeholder="you@example.com"
                  placeholderTextColor="#9C948A"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  editable={!pending}
                />
              )}
            />
            {errors.email ? (
              <Text className="text-sm font-sans text-destructive mt-1">
                {errors.email.message}
              </Text>
            ) : null}
          </View>

          <View className="mb-6">
            <Text className="text-base font-sans text-fg-primary mb-2">Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="min-h-[44px] px-4 py-3 rounded-xl bg-surface border border-border-subtle text-base font-sans text-fg-primary"
                  placeholder="••••••••"
                  placeholderTextColor="#9C948A"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  secureTextEntry
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  editable={!pending}
                />
              )}
            />
            {errors.password ? (
              <Text className="text-sm font-sans text-destructive mt-1">
                {errors.password.message}
              </Text>
            ) : null}
          </View>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={pending}
            isPending={pending}
            onPress={handleSubmit(onSubmit)}
          >
            Sign in
          </Button>

          {submitError ? (
            <Text className="text-sm font-sans text-destructive mt-4 text-center">
              {submitError}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
