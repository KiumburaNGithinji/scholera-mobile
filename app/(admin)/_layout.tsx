import { Stack } from 'expo-router'
import { RoleThemeProvider } from '@/providers/role-theme-provider'

export default function AdminLayout() {
  return (
    <RoleThemeProvider role="admin">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleThemeProvider>
  )
}
