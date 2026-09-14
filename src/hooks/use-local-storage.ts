"use client"

import * as React from "react"

/**
 * useLocalStorage — persists state to localStorage with SSR safety.
 * Reads the initial value on mount, writes on change.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = React.useState<T>(initialValue)
  const [hydrated, setHydrated] = React.useState(false)

  // Read from localStorage on mount
  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item !== null) {
        setStored(JSON.parse(item) as T)
      }
    } catch {
      /* ignore parse / access errors */
    }
    setHydrated(true)
  }, [key])

  // Write to localStorage on change (only after hydration to avoid overwriting)
  const setValue = React.useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next =
          typeof value === "function"
            ? (value as (p: T) => T)(prev)
            : value
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          /* ignore quota / access errors */
        }
        return next
      })
    },
    [key]
  )

  // Return stored value; during SSR/hydration, return initialValue to avoid mismatch
  return [hydrated ? stored : initialValue, setValue]
}
