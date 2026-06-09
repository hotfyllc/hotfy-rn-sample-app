import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { onboardingState } from '@/lib/onboarding'

/**
 * Gate: route to onboarding on first launch, otherwise jump straight to tabs.
 * Keeps a tiny loading state while AsyncStorage resolves — avoids a flash of
 * the wrong screen.
 */
export default function Index() {
  const [target, setTarget] = useState<'onboarding' | 'tabs' | null>(null)

  useEffect(() => {
    onboardingState.isDone().then((done) => setTarget(done ? 'tabs' : 'onboarding'))
  }, [])

  if (target === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#10b981" />
      </View>
    )
  }

  return <Redirect href={target === 'tabs' ? '/(tabs)' : '/onboarding/welcome'} />
}
