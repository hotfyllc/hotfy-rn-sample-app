// Favorites are persisted locally with AsyncStorage. A real product would sync
// these to a backend tied to the user — kept local here to avoid auth scaffolding.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

const KEY = 'hotfy-sample:favorites:v1'

const read = async (): Promise<string[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

const write = (ids: string[]) => AsyncStorage.setItem(KEY, JSON.stringify(ids))

/**
 * Subscribes a component to the favorites list and exposes a toggle helper.
 * Re-renders all consumers on every change (lightweight in-memory pub/sub).
 */
const subscribers = new Set<(ids: string[]) => void>()
let cache: string[] | null = null

const notify = (ids: string[]) => {
  cache = ids
  subscribers.forEach((cb) => cb(ids))
}

export const useFavorites = () => {
  const [ids, setIds] = useState<string[]>(cache ?? [])

  useEffect(() => {
    subscribers.add(setIds)
    if (cache === null) read().then(notify)
    return () => {
      subscribers.delete(setIds)
    }
  }, [])

  const toggle = useCallback(async (id: string): Promise<{ added: boolean }> => {
    const current = cache ?? (await read())
    const exists = current.includes(id)
    const next = exists ? current.filter((x) => x !== id) : [...current, id]
    notify(next)
    await write(next)
    return { added: !exists }
  }, [])

  return { ids, toggle, isFavorite: (id: string) => ids.includes(id) }
}
