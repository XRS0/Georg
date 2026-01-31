package handlers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/example/telegram-fitness/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ExerciseHandler struct {
	DB *pgxpool.Pool
}

func (h ExerciseHandler) ListExercises(w http.ResponseWriter, r *http.Request) {
	groups, err := h.fetchExercises(r.Context())
	if err != nil {
		http.Error(w, "failed to load exercises", http.StatusInternalServerError)
		return
	}

	respondJSON(w, groups)
}

func (h ExerciseHandler) fetchExercises(ctx context.Context) ([]models.ExerciseGroup, error) {
	rows, err := h.DB.Query(ctx, `
		SELECT id, name, description, muscle_group, difficulty, video_url
		FROM exercises
		ORDER BY muscle_group, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	groupMap := make(map[string][]models.Exercise)
	order := make([]string, 0)

	for rows.Next() {
		var exercise models.Exercise
		if err := rows.Scan(
			&exercise.ID,
			&exercise.Name,
			&exercise.Description,
			&exercise.MuscleGroup,
			&exercise.Difficulty,
			&exercise.VideoURL,
		); err != nil {
			return nil, err
		}

		if _, exists := groupMap[exercise.MuscleGroup]; !exists {
			order = append(order, exercise.MuscleGroup)
		}
		groupMap[exercise.MuscleGroup] = append(groupMap[exercise.MuscleGroup], exercise)
	}

	groups := make([]models.ExerciseGroup, 0, len(groupMap))
	for _, group := range order {
		groups = append(groups, models.ExerciseGroup{
			Group:     group,
			Exercises: groupMap[group],
		})
	}

	return groups, rows.Err()
}

func respondJSON(w http.ResponseWriter, data any) {
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	_ = encoder.Encode(data)
}
