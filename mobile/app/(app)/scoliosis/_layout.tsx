import { Stack } from 'expo-router';

export default function ScoliosisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#F8FAFC' },
        headerTintColor: '#1F2937',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Scoliosis Care' }}
      />
      <Stack.Screen
        name="pt-routine"
        options={{ title: 'PT Exercises' }}
      />
      <Stack.Screen
        name="brace-tracker"
        options={{ title: 'Brace Tracker' }}
      />
      <Stack.Screen
        name="symptoms"
        options={{ title: 'Symptom Log' }}
      />
      <Stack.Screen
        name="resources"
        options={{ title: 'Resources' }}
      />
    </Stack>
  );
}
