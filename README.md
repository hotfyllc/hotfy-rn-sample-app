# hotfy-rn-sample-app

A minimal React Native app showing how to integrate [`@hotfyllc/sdk`](https://www.npmjs.com/package/@hotfyllc/sdk) in a real product. It's a tiny 7-minute workout app — onboarding, workouts list, favorites, and a workout flow — built with **Expo + Expo Router + TypeScript**.

This repo is the reference we point clients to when they integrate the Hotfy SDK. The app is intentionally small (~7 screens, no backend) so the integration points are easy to see.

---

## What's integrated

| Place | Hotfy call |
|---|---|
| `app/_layout.tsx` boot | `Hotfy.init(...)` + `startAdPreload()` + `Hotfy.on('impression', ...)` → `Hotfy.trackAdImpression(...)` |
| Every screen | `Hotfy.screen('...')` |
| `welcome.tsx` → Get started | `showInterstitial('onboarding_welcome')` |
| `goal.tsx` → Continue | `Hotfy.track('onboarding_goal_selected')` + `showInterstitial('onboarding_goal')` |
| `notifications.tsx` → Allow/Skip | `Hotfy.track('onboarding_completed', { push_allowed })` |
| `(tabs)/index.tsx` (Home) | `<WrapperBanner screenKey="home" size="banner" />` below the header |
| Home → card press | `Hotfy.track('workout_opened')` + `showInterstitial('home_to_workout_detail')` |
| Home → ❤️ press | `Hotfy.track('workout_favorited' \| 'workout_unfavorited')` (no ad) |
| Favorites → ❤️ press | Same as above with `source: 'favorites'` |
| `workout/[id].tsx` → Start | `Hotfy.track('workout_start_requested')` + `showRewarded(...)` + `Hotfy.track('workout_started', { reward_granted })` |
| `workout/play.tsx` → pause | `Hotfy.track('workout_paused' \| 'workout_resumed')` |
| `workout/play.tsx` → quit | `Hotfy.track('workout_abandoned')` |
| `workout/complete.tsx` mount | `Hotfy.track('workout_completed', { duration_sec, exercises_count })` |

All calls go through `lib/analytics.ts` — a thin no-op wrapper that:

- Centralizes event names (one place to grep/rename)
- Fails silently if the SDK didn't init (missing `.env`, network error, etc.), so the app keeps working without keys

### In-app debug console

`@hotfyllc/debug-console-rn` is wired in DEV builds — a floating draggable button (bottom-right) opens a panel with:

- **Logs** — captures every `console.*` call (incl. SDK internals)
- **Network** — intercepts all `fetch`/XHR (incl. wrapper-config calls, CDP event flushes)
- **Actions** (`lib/debug-actions.ts`) — Reset onboarding, Clear storage, Wrapper config dump, Refresh wrapper, CDP identity, Attribution

Gated by `__DEV__`, so zero impact on release builds.

---

## Screen keys (configure these in Hotfy Console)

The SDK resolves ad units per `(screenKey, format)`. The app uses these keys:

| Slot | screenKey | Format |
|---|---|---|
| Onboarding step 1 transition | `onboarding_welcome` | interstitial |
| Onboarding step 2 transition | `onboarding_goal` | interstitial |
| Home banner | `home` | banner |
| Home → workout detail | `home_to_workout_detail` | interstitial |
| Start regular workout | `workout_start` | rewarded |
| Unlock premium workout | `premium_unlock` | rewarded |

Configure these in the Hotfy Console wrapper config for the app you're testing. Slots without a configured ad unit will be skipped (helpers resolve with no error).

> **Naming convention:** screen view names passed to `Hotfy.screen('...')` use the **same `snake_case` pattern** as the screenKeys above (`home`, `onboarding_welcome`, `workout_detail`, …). Keeping them aligned means analytics filters, funnel reports and the wrapper console all speak the same identifiers — no mental translation. Custom events are snake_case too (`workout_favorited`, `workout_completed`, …).

---

## Running it

### One-time setup

```bash
npm install
cp .env.example .env
# edit .env — fill in EXPO_PUBLIC_HOTFY_APP_API_KEY and EXPO_PUBLIC_HOTFY_CDP_API_KEY
```

> Running without `.env` still works — all SDK calls become no-ops and you'll see a warning in the dev console.

### Dev build (required — Expo Go won't work anymore)

`@hotfyllc/sdk` depends on `react-native-google-mobile-ads` and `react-native-play-install-referrer`, which have native code that's not in Expo Go. You need a **dev build**:

```bash
# Android emulator (must be running)
npm run android

# iOS simulator (requires Xcode)
npm run ios
```

First build is ~3-5min. After it's installed, `npm start` works normally with hot reload.

### Typecheck

```bash
npm run typecheck
```

---

## Push notifications

Intentionally **not wired** in this public reference — push requires per-app Firebase / APNS credentials that don't belong in a shared sample. The `onboarding/notifications.tsx` screen is a UI-only placeholder and includes a comment block with the exact steps to enable push in your fork:

1. `npx expo install expo-notifications expo-device`
2. Add the `expo-notifications` plugin to `app.json`
3. Add `deviceToken: {}` to `Hotfy.init(...)` in `app/_layout.tsx`
4. Inside the "Allow notifications" handler:
   ```ts
   const { status } = await Notifications.requestPermissionsAsync()
   if (status === 'granted') {
     const { data: token } = await Notifications.getDevicePushTokenAsync()
     Hotfy.setNativeToken(token, Platform.OS === 'ios' ? 'ios' : 'android')
   }
   ```
5. Wire native: Firebase (`google-services.json` for Android), APNS provisioning for iOS — see [Expo docs](https://docs.expo.dev/push-notifications/push-notifications-setup/).

That's all the app has to do. The SDK syncs the token to **Hotfy Console + CDP in parallel**, with change-detection (skip if token unchanged and last sync < 30 days), retry on failure, and a 30-day safety re-sync.

---

## AdMob config

`app.json` ships with Google's **official public test app IDs**, documented at [developers.google.com/admob/android/test-ads](https://developers.google.com/admob/android/test-ads) and [developers.google.com/admob/ios/test-ads](https://developers.google.com/admob/ios/test-ads):

```json
"react-native-google-mobile-ads": {
  "androidAppId": "ca-app-pub-3940256099942544~3347511713",
  "iosAppId":     "ca-app-pub-3940256099942544~1458002511"
}
```

These are safe to commit — they belong to a Google-owned test publisher account, generate no revenue, and serve test ads. **Replace them with your real AdMob app IDs before shipping to production** (using real IDs in dev/emulator can get your AdMob account flagged). The actual ad units rendered come from the **Hotfy wrapper config**, not from `app.json` — these IDs are just for AdMob SDK init.

---

## Project layout

```
hotfy-rn-sample-app/
├── app/                     Expo Router screens
│   ├── _layout.tsx          → Hotfy.init() boot
│   ├── index.tsx            → gate: onboarding vs (tabs)
│   ├── onboarding/          → 3-step onboarding (interstitials on transitions)
│   ├── (tabs)/              → bottom tabs (Workouts + Favorites)
│   │   ├── index.tsx        → home with banner ad below header
│   │   └── favorites.tsx
│   └── workout/             → detail → play → complete flow
│       └── [id].tsx         → rewarded on Start
├── components/              Small RN components
├── lib/
│   ├── analytics.ts         → safe wrapper around Hotfy.track/screen/show*
│   ├── workouts.ts          → hardcoded mock data
│   ├── favorites.ts         → AsyncStorage hook
│   └── onboarding.ts        → AsyncStorage flag
├── assets/                  App icon + splash (defaults)
└── .env.example             Hotfy SDK keys
```

---

## What's intentionally missing

This is a reference, not a product. To keep it tiny we skipped:

- **Auth.** Favorites stored locally — no user account.
- **Backend.** All workouts in `lib/workouts.ts`.
- **Real notifications.** Onboarding step is UI-only. Wire `expo-notifications` + `Hotfy.setNativeToken(...)` when you need push.
- **Theming.** Single light theme.
- **Tests.** None.

---

## License

UNLICENSED — internal Hotfy reference. Reach out before forking publicly.
