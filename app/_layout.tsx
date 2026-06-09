import AsyncStorage from '@react-native-async-storage/async-storage'
import { DebugConsole } from '@hotfyllc/debug-console-rn'
import { Hotfy, loadAndShowBootAd, startAdPreload } from '@hotfyllc/sdk'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { markSdkReady } from '@/lib/analytics'
import { debugActions } from '@/lib/debug-actions'

const APP_API_KEY = process.env.EXPO_PUBLIC_HOTFY_APP_API_KEY
const CDP_API_KEY = process.env.EXPO_PUBLIC_HOTFY_CDP_API_KEY

/**
 * `EXPO_PUBLIC_IS_DEVELOPMENT=true` flips the SDK into verbose-log mode
 * (wrapper config resolution, CDP HTTP calls, device-token sync state).
 * Anything else (unset, "false", "0") keeps it quiet.
 */
const SDK_DEBUG = process.env.EXPO_PUBLIC_IS_DEVELOPMENT === 'true'

/**
 * Bootstraps the Hotfy SDK once, on app start.
 *
 * Init is resilient: if either key is missing or the call throws, the app
 * still loads and every analytics/ad call becomes a no-op (see lib/analytics).
 * This lets you run the sample without filling in `.env` first.
 */
function useHotfySdk() {
  useEffect(() => {
    if (!APP_API_KEY || !CDP_API_KEY) {
      if (__DEV__) {
        console.warn(
          '[Hotfy] EXPO_PUBLIC_HOTFY_APP_API_KEY / EXPO_PUBLIC_HOTFY_CDP_API_KEY ' +
          'not set — SDK calls will be no-ops. Copy .env.example to .env to enable.',
        )
      }
      return
    }

    let cancelled = false
      ; (async () => {
        try {
          await Hotfy.init({
            cdp: { apiKey: CDP_API_KEY, debug: SDK_DEBUG },
            wrapper: {
              apiKey: APP_API_KEY,
              storage: AsyncStorage,
              debug: SDK_DEBUG,
            },
            // To enable push notifications, add `deviceToken: { debug: SDK_DEBUG }`
            // here AND wire `Hotfy.setNativeToken(token, platform)` after the
            // user grants permission. Skipped in this sample to keep the repo
            // free of native push config (Firebase / APNS).
          })
          if (cancelled) return
          markSdkReady()

          // Forward paid ad impressions to CDP for revenue tracking (ILAR).
          Hotfy.on('impression', (e) => {
            Hotfy.trackAdImpression({
              revenueMicros: e.revenueMicros ?? 0,
              currency: e.currency,
              precision: e.precision,
              adUnitId: e.adUnitId,
              adSource: e.network,
              adFormat: e.format,
            })
          })

          // Pre-warm the interstitial pool. Safe to call after init.
          startAdPreload()

          // Cold-start App Open ad — shows the boot ad on app launch when an
          // app_open ad unit is configured in the wrapper config. Resolves
          // without throwing if there's no fill, ads are disabled in the
          // current segment, or no unit is configured.
          //
          // The SDK's foreground handler (started by `Hotfy.init` when the
          // wrapper config has `app_open_on_foreground: true`) calls this
          // same function automatically when the app returns from background
          // after >30s — no extra code needed here for that case.
          loadAndShowBootAd()
        } catch (err) {
          if (__DEV__) console.warn('[Hotfy] init failed — running without SDK', err)
        }
      })()

    return () => {
      cancelled = true
    }
  }, [])
}

export default function RootLayout() {
  useHotfySdk()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
      {/*
        Floating debug console — DEV-only. Renders a draggable button that
        opens an in-app panel with: captured console logs, intercepted fetch/
        XHR network requests, and our custom actions (clear storage, refresh
        wrapper, dump CDP identity, etc. — see lib/debug-actions.ts).
        Zero impact in release builds (gated by __DEV__).
      */}
      {__DEV__ && <DebugConsole actions={debugActions} />}
    </GestureHandlerRootView>
  )
}
