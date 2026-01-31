export type Exercise = {
  id: number
  name: string
  description?: string
  muscle_group: string
  difficulty: string
  video_url: string
}

export type ExerciseGroup = {
  group: string
  exercises: Exercise[]
}

export type Profile = {
  name: string
  total_workouts: number
  streak_count: number
  telegram_user_id: number
}
