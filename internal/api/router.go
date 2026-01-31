package api

import (
	"net/http"

	"github.com/example/telegram-fitness/internal/handlers"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	internalmiddleware "github.com/example/telegram-fitness/internal/middleware"
)

func Router(db *pgxpool.Pool) http.Handler {
	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)

	exerciseHandler := handlers.ExerciseHandler{DB: db}
	profileHandler := handlers.ProfileHandler{DB: db}

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	r.Route("/api", func(api chi.Router) {
		api.Use(internalmiddleware.AuthMiddleware)
		api.Get("/exercises", exerciseHandler.ListExercises)
		api.Get("/profile", profileHandler.GetProfile)
	})

	return r
}
