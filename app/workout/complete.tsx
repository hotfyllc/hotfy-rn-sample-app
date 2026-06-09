import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/primary-button'
import { screen, track } from '@/lib/analytics'
import { formatDuration, getWorkout } from '@/lib/workouts'

export default function WorkoutComplete() {
  const router = useRouter()
  const { id, duration } = useLocalSearchParams<{ id: string; duration?: string }>()
  const workout = id ? getWorkout(id) : undefined
  const durationSec = duration ? Number(duration) : workout?.totalSec ?? 0

  useEffect(() => {
    if (!workout) return
    screen('workout_complete', { workout_id: workout.id })
    track('workout_completed', {
      workout_id: workout.id,
      level: workout.level,
      duration_sec: durationSec,
      exercises_count: workout.exercises.length,
    })
  }, [workout, durationSec])

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={64} color="#10b981" />
        </View>
        <Text style={styles.title}>Workout complete!</Text>
        <Text style={styles.subtitle}>
          Nice work — {workout?.title ?? 'session'} done in {formatDuration(durationSec)}.
        </Text>

        <View style={styles.statsCard}>
          <Stat label="Duration" value={formatDuration(durationSec)} />
          <View style={styles.divider} />
          <Stat label="Exercises" value={String(workout?.exercises.length ?? 0)} />
          <View style={styles.divider} />
          <Stat label="Level" value={workout?.level ?? '—'} />
        </View>
      </View>

      <PrimaryButton label="Back to workouts" onPress={() => router.replace('/(tabs)')} />
    </SafeAreaView>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    width: '100%',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#e5e7eb',
  },
})
