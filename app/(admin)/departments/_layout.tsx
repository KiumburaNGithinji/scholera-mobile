import { Stack } from 'expo-router'
import { tokens } from '@/theme/tokens'

/**
 * Stack layout for /(admin)/departments/* routes.
 *
 * The parent app/(admin)/_layout.tsx renders a Stack with headerShown: false,
 * so the (tabs) group has no header (it manages its own via Tabs.Screen options).
 * For the departments detail screen we WANT a header — it shows the department
 * name + a back button. So we set headerShown: true here.
 *
 * The screen-specific title is set inside [id].tsx via <Stack.Screen options>.
 */
export default function DepartmentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerStyle: { backgroundColor: tokens.colors.canvas },
        headerTintColor: tokens.colors.fgPrimary,
        // iOS: don't show the previous screen's title next to the back arrow.
        // The back arrow alone is cleaner.
        headerBackButtonDisplayMode: 'minimal',
      }}
    />
  )
}
