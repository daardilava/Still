import { Stack } from 'expo-router';

// Native navigation shell. Today there is one route (the whole prototype as a DOM component);
// screens move out into their own native routes here as they are rebuilt in React Native.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
