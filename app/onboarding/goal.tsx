import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/primary-button'
import { screen, track, tryShowInterstitial } from '@/lib/analytics'
import { GOALS, onboardingState, type Goal } from '@/lib/onboarding'

export default function GoalStep() {
  const router = useRouter()
  const [selected, setSelected] = useState<Goal | null>(null)

  useEffect(() => {
    screen('onboarding_goal')
  }, [])

  const onContinue = async () => {
    if (!selected) return
    await onboardingState.setGoal(selected)
    track('onboarding_goal_selected', { goal: selected })

    // Interstitial right before navigating to the last onboarding step.
    await tryShowInterstitial('onboarding_goal')
    router.push('/onboarding/notifications')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>We'll tailor recommendations on the home screen.</Text>
      </View>

      <View style={styles.options}>
        {GOALS.map((g) => {
          const active = selected === g.value
          return (
            <Pressable
              key={g.value}
              onPress={() => setSelected(g.value)}
              style={[styles.option, active && styles.optionActive]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, active && { color: '#065f46' }]}>{g.label}</Text>
                <Text style={styles.optionDescription}>{g.description}</Text>
              </View>
              {active && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
            </Pressable>
          )
        })}
      </View>

      <PrimaryButton label="Continue" onPress={onContinue} disabled={!selected} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 32,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 22,
  },
  options: {
    gap: 12,
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  optionActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
})
