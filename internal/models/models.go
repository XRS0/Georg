package models

type TelegramUser struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name,omitempty"`
	Username  string `json:"username,omitempty"`
}

type Exercise struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	MuscleGroup string `json:"muscle_group"`
	Difficulty  string `json:"difficulty"`
	VideoURL    string `json:"video_url"`
}

type ExerciseGroup struct {
	Group     string     `json:"group"`
	Exercises []Exercise `json:"exercises"`
}

type Profile struct {
	Name           string `json:"name"`
	TotalWorkouts  int    `json:"total_workouts"`
	StreakCount    int    `json:"streak_count"`
	TelegramUserID int64  `json:"telegram_user_id"`
}
