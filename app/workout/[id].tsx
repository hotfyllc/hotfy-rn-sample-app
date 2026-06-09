import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/primary-button'
import { screen, track, tryShowRewarded } from '@/lib/analytics'
import { formatDuration, getWorkout } from '@/lib/workouts'

export default function WorkoutDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const workout = id ? getWorkout(id) : undefined
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (workout) screen('workout_detail', { workout_id: workout.id, level: workout.level })
  }, [workout])

  if (!workout) {
    return (
      <SafeAreaView style={styles.empty} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.emptyTitle}>Workout not found</Text>
        <PrimaryButton label="Go back" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    )
  }

  const onStart = async () => {
    setStarting(true)
    track('workout_start_requested', {
      workout_id: workout.id,
      level: workout.level,
      total_sec: workout.totalSec,
      premium: workout.premium,
    })

    // Rewarded before starting. `tryShowRewarded` resolves to a boolean —
    // true means the user finished the ad (earned the reward), false means
    // no fill / dismissed early / SDK not initialized.
    const granted = await tryShowRewarded(
      workout.premium ? 'premium_unlock' : 'workout_start',
    )

    track('workout_started', {
      workout_id: workout.id,
      level: workout.level,
      reward_granted: granted,
    })

    // We let the user through regardless. If you actually want to gate premium
    // workouts behind a completed rewarded ad, do:
    //   if (workout.premium && !granted) { setStarting(false); return }
    router.push({ pathname: '/workout/play', params: { id: workout.id } })
    setStarting(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>{workout.title}</Text>
          <Text style={styles.subtitle}>{workout.subtitle}</Text>

          <View style={styles.statsRow}>
            <Stat icon="time-outline" label={formatDuration(workout.totalSec)} />
            <Stat icon="flash-outline" label={`${workout.exercises.length} exercises`} />
            <Stat icon="pulse-outline" label={workout.level} />
          </View>
        </View>

        <View style={styles.list}>
          <Text style={styles.listTitle}>Exercises</Text>
          {workout.exercises.map((ex, i) => (
            <View key={`${ex.name}-${i}`} style={styles.exerciseRow}>
              <View style={styles.exerciseIndex}>
                <Text style={styles.exerciseIndexText}>{i + 1}</Text>
              </View>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <Text style={styles.exerciseDuration}>{ex.durationSec}s</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={workout.premium ? 'Watch ad to unlock' : 'Start workout'}
          onPress={onStart}
          loading={starting}
        />
      </View>
    </SafeAreaView>
  )
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

function Stat({ icon, label }: { icon: IoniconName; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color="#10b981" />
      <Text style={styles.statText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerRow: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  list: {
    gap: 4,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  exerciseIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10b981',
  },
  exerciseName: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  exerciseDuration: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
})
