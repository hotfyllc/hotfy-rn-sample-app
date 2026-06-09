import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PrimaryButton } from '@/components/primary-button'
import { screen, tryShowInterstitial } from '@/lib/analytics'

export default function Welcome() {
  const router = useRouter()

  useEffect(() => {
    screen('onboarding_welcome')
  }, [])

  const onGetStarted = async () => {
    // Show interstitial first, then navigate. The helper resolves immediately
    // when there's no fill / ads off — so navigation is never blocked.
    await tryShowInterstitial('onboarding_welcome')
    router.push('/onboarding/goal')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Ionicons name="flash" size={56} color="#10b981" />
        </View>
        <Text style={styles.title}>Welcome to{'\n'}Hotfy Sample</Text>
        <Text style={styles.subtitle}>
          A tiny workout app showing how to integrate the Hotfy SDK in a real product.
        </Text>
      </View>

      <PrimaryButton label="Get started" onPress={onGetStarted} />
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
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
})
