import { StyleSheet, Text, View } from 'react-native'

type Props = {
  /** Seconds remaining in the current exercise. */
  remainingSec: number
  /** Total seconds for the current exercise — used to compute the progress ring fill. */
  totalSec: number
}

/**
 * Big number countdown with a horizontal progress bar.
 * Intentionally low-fidelity — circular SVG ring would pull svg deps.
 */
export function TimerDisplay({ remainingSec, totalSec }: Props) {
  const pct = totalSec === 0 ? 0 : Math.max(0, Math.min(1, 1 - remainingSec / totalSec))
  return (
    <View style={styles.wrap}>
      <Text style={styles.number}>{remainingSec.toString().padStart(2, '0')}</Text>
      <Text style={styles.unit}>seconds</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
  },
  number: {
    fontSize: 96,
    fontWeight: '800',
    color: '#111827',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  unit: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  track: {
    width: 240,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
})
