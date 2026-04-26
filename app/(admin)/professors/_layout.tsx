import { Stack } from 'expo-router'
import { tokens } from '@/theme/tokens'

/**
 * Stack layout for /(admin)/professors/* routes.
 *
 * Mirrors app/(admin)/departments/_layout.tsx — same header treatment so the
 * cream canvas + Inter SemiBold title + hidden back-button-text styling is
 * consistent across the admin drill-down.
 *
 * Header title is set dynamically inside [id].tsx via <Stack.Screen options>.
 */
export default function ProfessorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerStyle: { backgroundColor: tokens.colors.canvas },
        headerTintColor: tokens.colors.fgPrimary,
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  )
}
