import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WorkoutCard } from '@/components/workout-card'
import { screen, track } from '@/lib/analytics'
import { useFavorites } from '@/lib/favorites'
import { WORKOUTS, type Workout } from '@/lib/workouts'

export default function Favorites() {
  const router = useRouter()
  const { ids, isFavorite, toggle } = useFavorites()
  const items = useMemo(() => WORKOUTS.filter((w) => ids.includes(w.id)), [ids])

  useEffect(() => {
    screen('favorites', { count: items.length })
  // Re-fire if the favorites count changes meaningfully (rare in this tab).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onToggleFavorite = async (workout: Workout) => {
    const { added } = await toggle(workout.id)
    track(added ? 'workout_favorited' : 'workout_unfavorited', {
      workout_id: workout.id,
      source: 'favorites',
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart on any workout to save it here for quick access.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(w) => w.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>Your favorites</Text>
              <Text style={styles.subtitle}>
                {items.length} saved workout{items.length === 1 ? '' : 's'}
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              isFavorite={isFavorite(item.id)}
              onPress={() => router.push(`/workout/${item.id}`)}
              onToggleFavorite={() => onToggleFavorite(item)}
            />
          )}
        />
      )}
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
})
