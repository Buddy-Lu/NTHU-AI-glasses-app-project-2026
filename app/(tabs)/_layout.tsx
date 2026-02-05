import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: COLORS.bgCardBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
        },
        headerStyle: {
          backgroundColor: COLORS.bg,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: 'Gallery',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
