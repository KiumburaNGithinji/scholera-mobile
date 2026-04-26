import { Redirect } from 'expo-router'
import { useAuth } from '@/providers/auth-provider'

export default function IndexRedirect() {
  const { session, role, ready } = useAuth()

  if (!ready) return null
  if (!session || !role) return <Redirect href="/(auth)/sign-in" />

  if (role === 'admin') return <Redirect href="/(admin)/(tabs)" />
  if (role === 'professor') return <Redirect href="/(professor)/(tabs)" />
  return <Redirect href="/(student)/(tabs)" />
}
