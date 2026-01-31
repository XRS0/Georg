import { useState } from 'react'
import type { Exercise } from '../lib/types'

type VideoCardProps = {
  exercise: Exercise
}

const VideoCard = ({ exercise }: VideoCardProps) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="rounded-2xl bg-slate-900/70 p-4 shadow-lg">
      <div className="relative mb-3 overflow-hidden rounded-xl bg-slate-800">
        {!loaded && (
          <div className="flex h-48 items-center justify-center animate-pulse bg-slate-800 text-sm text-slate-400">
            Loading video...
          </div>
        )}
        <video
          className={`h-48 w-full object-cover ${loaded ? 'block' : 'hidden'}`}
          src={exercise.video_url}
          controls
          playsInline
          onLoadedData={() => setLoaded(true)}
        />
      </div>
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
        <span>{exercise.muscle_group}</span>
        <span>{exercise.difficulty}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{exercise.name}</h3>
      {exercise.description && (
        <p className="mt-1 text-sm text-slate-300">{exercise.description}</p>
      )}
    </div>
  )
}

export default VideoCard
