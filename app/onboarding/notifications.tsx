import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/primary-button'
import { screen, track } from '@/lib/analytics'
import { onboardingState } from '@/lib/onboarding'

/**
 * UI-only placeholder. Push isn't wired in this sample to keep the public repo
 * free of Firebase / APNS configuration. To enable push in your fork:
 *
 *   1. `npx expo install expo-notifications expo-device`
 *   2. Add the `expo-notifications` plugin to `app.json`
 *   3. Add `deviceToken: {}` to the `Hotfy.init(...)` block in `app/_layout.tsx`
 *   4. Replace `finish(true)` below with the real flow:
 *
 *      const { status } = await Notifications.requestPermissionsAsync()
 *      if (status === 'granted') {
 *        const { data: token } = await Notifications.getDevicePushTokenAsync()
 *        Hotfy.setNativeToken(token, Platform.OS === 'ios' ? 'ios' : 'android')
 *      }
 *
 *   5. Wire Firebase (Android) / APNS (iOS) on the native side — see
 *      https://docs.expo.dev/push-notifications/push-notifications-setup/
 */
export default function NotificationsStep() {
  const router = useRouter()

  useEffect(() => {
    screen('onboarding_notifications')
  }, [])

  const finish = async (allowed: boolean) => {
    await onboardingState.markDone()
    track('onboarding_completed', { push_allowed: allowed })
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="notifications" size={56} color="#10b981" />
        </View>
        <Text style={styles.title}>Stay on track</Text>
        <Text style={styles.subtitle}>
          Allow notifications so we can remind you of your daily workout. You can change this
          anytime in Settings.
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Allow notifications" onPress={() => finish(true)} />
        <PrimaryButton label="Maybe later" variant="ghost" onPress={() => finish(false)} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    gap: 8,
  },
})
