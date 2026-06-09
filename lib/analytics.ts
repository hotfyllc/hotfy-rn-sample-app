// Thin wrapper around the Hotfy SDK.
//
// Two goals:
//   1. Centralize event names + screen names — easier to grep/rename.
//   2. Fail silently when the SDK didn't initialize (missing .env keys, init
//      crashed, etc.) so the app keeps working offline / in dev. Without this
//      every screen would need its own try/catch.

import { Hotfy, showInterstitial, showRewarded } from '@hotfyllc/sdk'

let sdkReady = false

/** Called by app/_layout.tsx after a successful `Hotfy.init(...)`. */
export const markSdkReady = () => {
  sdkReady = true
}

/** Whether `Hotfy.init` resolved — UI can use this to hide ad-related affordances. */
export const isSdkReady = () => sdkReady

const safe = <Args extends unknown[], Ret>(
  fn: (...args: Args) => Ret,
  fallback: Ret,
): ((...args: Args) => Ret) => {
  return (...args) => {
    if (!sdkReady) return fallback
    try {
      return fn(...args)
    } catch (err) {
      if (__DEV__) console.warn('[analytics] call failed', err)
      return fallback
    }
  }
}

/**
 * Async variant — for SDK calls that return promises (ads). Resolves to the
 * fallback value when the SDK isn't ready, never throws.
 */
const safeAsync = <Args extends unknown[], Ret>(
  fn: (...args: Args) => Promise<Ret>,
  fallback: Ret,
): ((...args: Args) => Promise<Ret>) => {
  return async (...args) => {
    if (!sdkReady) return fallback
    try {
      return await fn(...args)
    } catch (err) {
      if (__DEV__) console.warn('[analytics] async call failed', err)
      return fallback
    }
  }
}

// ─── Tracking ───────────────────────────────────────────────────────────────

export const track = safe(
  (event: string, props?: Record<string, unknown>) => Hotfy.track(event, props),
  undefined,
)

export const screen = safe(
  (name: string, props?: Record<string, unknown>) => Hotfy.screen(name, props),
  undefined,
)

// ─── Ads ────────────────────────────────────────────────────────────────────
//
// The wrapper helpers (`showInterstitial`, `showRewarded`) never throw even
// when there's no fill or the segment has ads disabled — they just resolve.
// We still wrap them to skip the call entirely if the SDK never inited.

export const tryShowInterstitial = safeAsync(
  (screenKey: string) => showInterstitial(screenKey),
  undefined,
)

/**
 * Returns `true` when the user completed the rewarded ad. When the SDK isn't
 * ready (no keys) or there's no fill, returns `false`. Callers decide whether
 * to gate the action behind `granted` — this sample lets the user through
 * regardless (better UX in dev).
 */
export const tryShowRewarded = safeAsync(
  (screenKey: string) => showRewarded({ screenKey }),
  false,
)
