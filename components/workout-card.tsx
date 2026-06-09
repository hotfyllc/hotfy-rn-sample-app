import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatDuration, type Workout } from '@/lib/workouts'

type Props = {
  workout: Workout
  isFavorite: boolean
  onPress: () => void
  onToggleFavorite: () => void
}

const LEVEL_COLOR: Record<Workout['level'], string> = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
}

export function WorkoutCard({ workout, isFavorite, onPress, onToggleFavorite }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{workout.title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {workout.subtitle}
          </Text>
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#ef4444' : '#9ca3af'}
          />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.metaText}>{formatDuration(workout.totalSec)}</Text>
        </View>
        <View style={[styles.metaPill, { backgroundColor: LEVEL_COLOR[workout.level] + '15' }]}>
          <View style={[styles.dot, { backgroundColor: LEVEL_COLOR[workout.level] }]} />
          <Text style={[styles.metaText, { color: LEVEL_COLOR[workout.level] }]}>{workout.level}</Text>
        </View>
        {workout.premium && (
          <View style={[styles.metaPill, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="star" size={12} color="#b45309" />
            <Text style={[styles.metaText, { color: '#b45309' }]}>premium</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 18,
  },
  favoriteButton: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})
