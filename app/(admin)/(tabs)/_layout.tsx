import { Tabs } from 'expo-router'
import { Pressable } from 'react-native'
import { Home, LogOut } from 'lucide-react-native'
import { useAuth } from '@/providers/auth-provider'
import { tokens } from '@/theme/tokens'

export default function AdminTabsLayout() {
  const { signOut } = useAuth()
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: tokens.colors.accentAdmin,
        tabBarInactiveTintColor: tokens.colors.fgMuted,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        tabBarLabelStyle: { fontFamily: 'Inter_400Regular' },
        headerRight: () => (
          <Pressable
            onPress={signOut}
            className="px-4 py-2"
            accessibilityLabel="Sign out"
          >
            <LogOut size={20} color={tokens.colors.fgPrimary} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
