import { Ionicons } from '@expo/vector-icons'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TimerDisplay } from '@/components/timer-display'
import { screen, track } from '@/lib/analytics'
import { getWorkout } from '@/lib/workouts'

export default function WorkoutPlay() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const workout = id ? getWorkout(id) : undefined

  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(workout?.exercises[0]?.durationSec ?? 0)
  const [paused, setPaused] = useState(false)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    if (workout) screen('workout_play', { workout_id: workout.id })
  }, [workout])

  const togglePause = () => {
    setPaused((p) => {
      const next = !p
      if (workout) {
        track(next ? 'workout_paused' : 'workout_resumed', {
          workout_id: workout.id,
          exercise_index: index,
        })
      }
      return next
    })
  }

  useEffect(() => {
    if (!workout || paused) return
    const tick = setInterval(() => {
      setRemaining((r) => {
        if (r > 1) return r - 1

        // Advance to next exercise — or finish.
        setIndex((i) => {
          const next = i + 1
          if (next >= workout.exercises.length) {
            const duration = Math.round((Date.now() - startedAt.current) / 1000)
            router.replace({
              pathname: '/workout/complete',
              params: { id: workout.id, duration: String(duration) },
            })
            return i
          }
          return next
        })
        return 0
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [workout, paused, router])

  // Reset countdown when we move to a new exercise.
  useEffect(() => {
    if (!workout) return
    const ex = workout.exercises[index]
    if (ex) setRemaining(ex.durationSec)
  }, [index, workout])

  if (!workout) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Workout not found</Text>
      </SafeAreaView>
    )
  }

  const current = workout.exercises[index]
  const next = workout.exercises[index + 1]

  const confirmQuit = () => {
    Alert.alert('Quit workout?', 'Your progress will be lost.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: () => {
          track('workout_abandoned', {
            workout_id: workout.id,
            exercise_index: index,
            elapsed_sec: Math.round((Date.now() - startedAt.current) / 1000),
          })
          router.back()
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={styles.topRow}>
        <Pressable onPress={confirmQuit} hitSlop={10}>
          <Ionicons name="close" size={28} color="#111827" />
        </Pressable>
        <Text style={styles.progressLabel}>
          {index + 1} / {workout.exercises.length}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.exerciseName}>{current?.name}</Text>
        <TimerDisplay remainingSec={remaining} totalSec={current?.durationSec ?? 0} />
        {next && <Text style={styles.nextLabel}>Up next: {next.name}</Text>}
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
          style={styles.iconButton}
          disabled={index === 0}
        >
          <Ionicons name="play-skip-back" size={22} color={index === 0 ? '#d1d5db' : '#111827'} />
        </Pressable>

        <Pressable onPress={togglePause} style={styles.playButton}>
          <Ionicons name={paused ? 'play' : 'pause'} size={28} color="#ffffff" />
        </Pressable>

        <Pressable
          onPress={() => {
            // Skip to next: emulate the timer expiring.
            setRemaining(0)
            setIndex((i) => {
              const n = i + 1
              if (n >= workout.exercises.length) {
                const duration = Math.round((Date.now() - startedAt.current) / 1000)
                router.replace({
                  pathname: '/workout/complete',
                  params: { id: workout.id, duration: String(duration) },
                })
                return i
              }
              return n
            })
          }}
          style={styles.iconButton}
        >
          <Ionicons name="play-skip-forward" size={22} color="#111827" />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  nextLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 32,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
