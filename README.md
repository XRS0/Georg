# Telegram Fitness Mini App (PoC)

A proof-of-concept Telegram Mini App (TMA) for a fitness platform with:
- Go (chi + pgx) backend
- React + TypeScript + TailwindCSS frontend
- PostgreSQL schema and Docker Compose setup

## Architecture

```
cmd/server            # main entrypoint
internal/api          # routing setup
internal/handlers     # HTTP handlers (dependency injected DB)
internal/middleware   # Telegram auth middleware
internal/models       # shared API models
sql/schema.sql        # database schema
frontend/             # React + Tailwind client
```

## Database Schema

Use `sql/schema.sql` to initialize PostgreSQL. It includes:
- `users`
- `exercises`
- `workouts`
- `workout_logs`

## Telegram Authentication Middleware

`internal/middleware/telegram_auth.go` includes a middleware and validator that:
- Reads `initData` from `X-Telegram-Init-Data` or `?initData=`
- Builds the data-check-string and validates HMAC-SHA256 using the bot token
- Validates `auth_date`
- Stores the Telegram user in request context

**Snippet:**

```go
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		initData := r.Header.Get("X-Telegram-Init-Data")
		if initData == "" {
			initData = r.URL.Query().Get("initData")
		}

		if initData == "" {
			http.Error(w, "missing init data", http.StatusUnauthorized)
			return
		}

		botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
		if botToken == "" {
			http.Error(w, "server misconfigured", http.StatusInternalServerError)
			return
		}

		user, err := ValidateTelegramInitData(initData, botToken, time.Minute*15)
		if err != nil {
			http.Error(w, "invalid init data", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), telegramUserKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
```

## API Endpoints

- `GET /api/exercises`
  - Returns exercises grouped by `muscle_group`.
- `GET /api/profile`
  - Returns profile name, total workouts, and streak count for the Telegram user.

## Local Development

1. Set `TELEGRAM_BOT_TOKEN` in your environment.
2. Start the stack:

```bash
docker compose up --build
```

The frontend is served on `http://localhost:5173` and the backend on `http://localhost:8080`.

## Notes

- The frontend uses the Telegram WebApp SDK from `https://telegram.org/js/telegram-web-app.js`.
- `VITE_API_BASE` can be adjusted to point to the backend when embedding in Telegram.
