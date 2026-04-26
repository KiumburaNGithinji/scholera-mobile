import { Stack } from 'expo-router'
import { RoleThemeProvider } from '@/providers/role-theme-provider'

export default function StudentLayout() {
  return (
    <RoleThemeProvider role="student">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleThemeProvider>
  )
}
