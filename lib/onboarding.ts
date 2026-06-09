// Tracks whether the user has finished onboarding and which goal they picked.
// Stored locally — onboarding is a first-launch concept, no backend needed.

import AsyncStorage from '@react-native-async-storage/async-storage'

const DONE_KEY = 'hotfy-sample:onboarding:done:v1'
const GOAL_KEY = 'hotfy-sample:onboarding:goal:v1'

export type Goal = 'lose_weight' | 'build_muscle' | 'stay_active'

export const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: 'lose_weight', label: 'Lose weight', description: 'Fat burn + cardio focus.' },
  { value: 'build_muscle', label: 'Build muscle', description: 'Strength + hypertrophy.' },
  { value: 'stay_active', label: 'Stay active', description: 'Daily movement habit.' },
]

export const onboardingState = {
  async isDone(): Promise<boolean> {
    return (await AsyncStorage.getItem(DONE_KEY)) === '1'
  },
  async markDone(): Promise<void> {
    await AsyncStorage.setItem(DONE_KEY, '1')
  },
  async setGoal(goal: Goal): Promise<void> {
    await AsyncStorage.setItem(GOAL_KEY, goal)
  },
  async getGoal(): Promise<Goal | null> {
    const raw = await AsyncStorage.getItem(GOAL_KEY)
    return raw && (raw === 'lose_weight' || raw === 'build_muscle' || raw === 'stay_active')
      ? raw
      : null
  },
  /** Test/dev helper. Not wired into the UI. */
  async _reset(): Promise<void> {
    await AsyncStorage.multiRemove([DONE_KEY, GOAL_KEY])
  },
}
