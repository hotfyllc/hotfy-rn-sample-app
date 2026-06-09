// Debug console actions for `@hotfyllc/debug-console-rn`. Kept out of
// `_layout.tsx` so the layout stays small and the action list is easy to find
// when adding new ones.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Hotfy } from '@hotfyllc/sdk'
import type { DebugAction } from '@hotfyllc/debug-console-rn'
import { onboardingState } from '@/lib/onboarding'

export const debugActions: DebugAction[] = [
  {
    label: 'Wrapper config',
    revealLogs: true,
    onPress: () => {
      console.info('[debug] wrapper config:', JSON.stringify(Hotfy.getConfig(), null, 2))
      console.info('[debug] isActive:', Hotfy.isActive())
      console.info('[debug] isReady:', Hotfy.isReady())
    },
  },
  {
    label: 'CDP identity',
    revealLogs: true,
    onPress: () => {
      console.info('[debug] anonymousId:', Hotfy.getAnonymousId())
      console.info('[debug] userId:', Hotfy.getUserId() ?? '(not identified)')
    },
  },
  {
    label: 'Refresh wrapper',
    onPress: async () => {
      // Forces a POST /v1/wrapper/config — useful to see the request in the
      // Network tab, since boot usually hits the cache and skips HTTP.
      console.info('[debug] forcing wrapper refresh…')
      await Hotfy.refresh()
      console.info('[debug] wrapper refreshed')
    },
  },
  {
    label: 'Flush CDP',
    onPress: async () => {
      // CDP batches events (every ~30s OR 20 events). Flush forces the queued
      // tracks/screens out immediately so you can see them in Network.
      console.info('[debug] flushing CDP queue…')
      await Hotfy.flush()
      console.info('[debug] CDP flushed')
    },
  },
  {
    label: 'Reset onboarding',
    onPress: async () => {
      await onboardingState._reset()
      console.warn('[debug] onboarding reset — relaunch the app to see it again')
    },
  },
  {
    label: 'Clear all storage',
    onPress: async () => {
      await AsyncStorage.clear()
      console.warn('[debug] AsyncStorage cleared (favorites, onboarding, SDK cache)')
    },
  },
  {
    label: 'Attribution',
    revealLogs: true,
    onPress: () => {
      console.info('[debug] attribution:', JSON.stringify(Hotfy.getAttribution(), null, 2))
      console.info('[debug] daysSinceInstall:', Hotfy.getDaysSinceInstall())
    },
  },
]
