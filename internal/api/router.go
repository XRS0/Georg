package api

import (
	"net/http"

	"github.com/example/telegram-fitness/internal/handlers"
	"github.com/example/telegram-fitness/internal/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func Router(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	exerciseHandler := handlers.ExerciseHandler{DB: db}
	profileHandler := handlers.ProfileHandler{DB: db}

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Route("/api", func(api chi.Router) {
		api.Use(middleware.AuthMiddleware)
		api.Get("/exercises", exerciseHandler.ListExercises)
		api.Get("/profile", profileHandler.GetProfile)
	})

	return r
}
