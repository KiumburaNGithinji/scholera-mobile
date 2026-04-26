import { Stack } from 'expo-router'
import { RoleThemeProvider } from '@/providers/role-theme-provider'

export default function ProfessorLayout() {
  return (
    <RoleThemeProvider role="professor">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleThemeProvider>
  )
}
