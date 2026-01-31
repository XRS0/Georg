package handlers

import (
	"context"
	"net/http"
	"strings"

	"github.com/example/telegram-fitness/internal/middleware"
	"github.com/example/telegram-fitness/internal/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProfileHandler struct {
	DB *pgxpool.Pool
}

func (h ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.TelegramUserFromContext(r.Context())
	if !ok {
		http.Error(w, "missing user", http.StatusUnauthorized)
		return
	}

	profile, err := h.loadProfile(r.Context(), user)
	if err != nil {
		http.Error(w, "failed to load profile", http.StatusInternalServerError)
		return
	}

	respondJSON(w, profile)
}

func (h ProfileHandler) loadProfile(ctx context.Context, user models.TelegramUser) (models.Profile, error) {
	name := strings.TrimSpace(strings.Join([]string{user.FirstName, user.LastName}, " "))
	if name == "" {
		name = user.Username
	}

	var profile models.Profile
	profile.Name = name
	profile.TelegramUserID = user.ID

	_, err := h.DB.Exec(ctx, `
		INSERT INTO users (telegram_id, first_name, last_name, username)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (telegram_id) DO UPDATE SET
			first_name = EXCLUDED.first_name,
			last_name = EXCLUDED.last_name,
			username = EXCLUDED.username,
			updated_at = NOW()
	`, user.ID, user.FirstName, user.LastName, user.Username)
	if err != nil {
		return profile, err
	}

	err = h.DB.QueryRow(ctx, `
		SELECT total_workouts, streak_count
		FROM users
		WHERE telegram_id = $1
	`, user.ID).Scan(&profile.TotalWorkouts, &profile.StreakCount)
	if err != nil {
		return profile, err
	}

	return profile, nil
}
