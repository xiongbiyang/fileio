import { ref } from 'vue'

export function useLocalStorageList<T>(key: string) {
  const items = ref<T[]>([])

  function load() {
    if (!import.meta.client) return
    try {
      const stored = localStorage.getItem(key)
      if (stored) items.value = JSON.parse(stored)
    }
    catch {
      // ignore malformed local storage payload
    }
  }

  function save() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(key, JSON.stringify(items.value))
    }
    catch {
      // ignore quota/private-mode write errors
    }
  }

  function clearStorage() {
    if (!import.meta.client) return
    localStorage.removeItem(key)
  }

  return { items, load, save, clearStorage }
}
