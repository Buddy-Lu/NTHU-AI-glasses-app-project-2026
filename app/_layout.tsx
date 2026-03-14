import { Stack } from 'expo-router';
import { PhotoProvider } from '@/context/PhotoContext';
import { COLORS } from '@/lib/theme';

export default function RootLayout() {
  return (
    <PhotoProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="result"
          options={{
            title: 'AI Analysis',
            headerStyle: { backgroundColor: COLORS.bg },
            headerTintColor: COLORS.textPrimary,
            headerTitleStyle: {
              fontWeight: '700',
            },
          }}
        />
      </Stack>
    </PhotoProvider>
  );
}
