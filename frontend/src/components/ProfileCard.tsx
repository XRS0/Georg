import type { Profile } from '../lib/types'

type ProfileCardProps = {
  profile: Profile | null
  fallbackName: string
}

const ProfileCard = ({ profile, fallbackName }: ProfileCardProps) => {
  if (!profile) {
    return (
      <div className="rounded-2xl bg-slate-900/60 p-6 shadow-lg">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-700" />
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="h-16 animate-pulse rounded-xl bg-slate-800" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-800" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-slate-900/60 p-6 shadow-lg">
      <p className="text-sm uppercase tracking-wide text-slate-400">Welcome</p>
      <h2 className="mt-1 text-2xl font-semibold text-white">
        {profile.name || fallbackName || 'Athlete'}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-slate-800/70 p-4 text-center">
          <p className="text-2xl font-bold text-white">{profile.total_workouts}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">Workouts</p>
        </div>
        <div className="rounded-xl bg-slate-800/70 p-4 text-center">
          <p className="text-2xl font-bold text-white">{profile.streak_count}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">Streak</p>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
