import type { Look, Product } from '../types'

// screeny są importowane → przy buildzie trafiają (jako base64) do jednego index.html
const PHOTOS = import.meta.glob<string>('../img/*.jpg', { eager: true, import: 'default' })

export const img = (id: string) => {
  const url = PHOTOS[`../img/${id}.jpg`]
  if (!url) throw new Error(`Brak zdjęcia: ${id}`)
  return url
}

export function p(id: string, look: Look, label: string[], tl: string, price: number, why?: string): Product {
  return { id, look, label, tl, price, why }
}

export const FILLER_WHY = 'Tego nie było na liście. Ładne, ale portfel płacze 😅'
