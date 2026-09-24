export interface Save {
  learned: string[]
  stars: Record<string, number>
}

const KEY = 'misja-drogeria-v1'

export function loadSave(): Save {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      return { learned: s.learned ?? [], stars: s.stars ?? {} }
    }
  } catch { /* prywatne okno itp. */ }
  return { learned: [], stars: {} }
}

export function writeSave(s: Save) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* trudno */ }
}

export function clearSave() {
  try { localStorage.removeItem(KEY) } catch { /* trudno */ }
}
