import type { ExerciseGroup, Profile } from './types'
import { getInitData } from './telegram'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

async function fetchJSON<T>(path: string): Promise<T> {
  const initData = getInitData()
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData
    }
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  getExercises(): Promise<ExerciseGroup[]> {
    return fetchJSON('/api/exercises')
  },
  getProfile(): Promise<Profile> {
    return fetchJSON('/api/profile')
  }
}
