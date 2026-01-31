import { useEffect, useMemo, useState } from 'react'
import ProfileCard from '../components/ProfileCard'
import VideoCard from '../components/VideoCard'
import { api } from '../lib/api'
import { initTelegram, getTelegramUserName } from '../lib/telegram'
import type { ExerciseGroup, Profile } from '../lib/types'

const App = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [groups, setGroups] = useState<ExerciseGroup[]>([])
  const [error, setError] = useState('')

  const fallbackName = useMemo(() => getTelegramUserName(), [])

  useEffect(() => {
    initTelegram()

    const load = async () => {
      try {
        const [profileResponse, exerciseResponse] = await Promise.all([
          api.getProfile(),
          api.getExercises()
        ])
        setProfile(profileResponse)
        setGroups(exerciseResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      }
    }

    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 pb-24">
      <header className="px-4 pt-8">
        <h1 className="text-3xl font-semibold text-white">Fitness Flow</h1>
        <p className="mt-1 text-sm text-slate-400">Quick sessions built for Telegram.</p>
      </header>

      <main className="px-4">
        <section className="mt-6">
          <ProfileCard profile={profile} fallbackName={fallbackName} />
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Exercises</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">Grouped</span>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}
          <div className="mt-4 space-y-8">
            {groups.map(group => (
              <div key={group.group}>
                <h3 className="text-lg font-semibold text-white">{group.group}</h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {group.exercises.map(exercise => (
                    <VideoCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
