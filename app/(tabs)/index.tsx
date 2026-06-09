import { WrapperBanner } from '@hotfyllc/sdk'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WorkoutCard } from '@/components/workout-card'
import { screen, track, tryShowInterstitial } from '@/lib/analytics'
import { useFavorites } from '@/lib/favorites'
import { WORKOUTS, type Workout } from '@/lib/workouts'

const SCREEN_KEY_HOME = 'home'

export default function Home() {
  const router = useRouter()
  const { isFavorite, toggle } = useFavorites()

  useEffect(() => {
    screen('home')
  }, [])

  const onCardPress = async (workout: Workout) => {
    track('workout_opened', {
      workout_id: workout.id,
      source: 'home',
      level: workout.level,
    })
    // Interstitial on transition into detail. Won't block navigation if there's
    // no fill — `tryShowInterstitial` always resolves.
    await tryShowInterstitial('home_to_workout_detail')
    router.push(`/workout/${workout.id}`)
  }

  const onToggleFavorite = async (workout: Workout) => {
    const { added } = await toggle(workout.id)
    track(added ? 'workout_favorited' : 'workout_unfavorited', {
      workout_id: workout.id,
      source: 'home',
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={WORKOUTS}
        keyExtractor={(w) => w.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Today</Text>
              <Text style={styles.title}>Pick your workout</Text>
              <Text style={styles.subtitle}>
                {WORKOUTS.length} sessions • mostly 7 minutes
              </Text>
            </View>

            {/*
              Banner ad below the header. Ad unit is resolved by the wrapper
              config per (screenKey, format) — change it in the Hotfy Console
              without rebuilding.
            */}
            <View style={styles.bannerWrap}>
              <WrapperBanner screenKey={SCREEN_KEY_HOME} size="banner" />
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => onCardPress(item)}
            onToggleFavorite={() => onToggleFavorite(item)}
          />
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
  },
  bannerWrap: {
    alignItems: 'center',
    marginBottom: 16,
    // Empty space while the banner loads (or stays empty if no fill).
    minHeight: 50,
  },
})
