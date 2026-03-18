"use client";

import { useState, useEffect, useCallback } from "react";

const isClient = typeof window !== "undefined";

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
    }
    setIsHydrated(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (!isClient) return;
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        console.warn(`Error setting localStorage key "${key}":`, e);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, isHydrated] as const;
}
