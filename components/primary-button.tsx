import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = {
  label: string
  onPress: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
}

const colorsFor = (variant: Variant, disabled: boolean) => {
  if (disabled) return { bg: '#d1d5db', fg: '#6b7280' }
  switch (variant) {
    case 'primary':
      return { bg: '#10b981', fg: '#ffffff' }
    case 'secondary':
      return { bg: '#f3f4f6', fg: '#111827' }
    case 'ghost':
      return { bg: 'transparent', fg: '#10b981' }
  }
}

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: Props) {
  const { bg, fg } = colorsFor(variant, disabled || loading)
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
