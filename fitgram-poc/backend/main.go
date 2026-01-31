
package main

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"sort"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/jackc/pgx/v4/pgxpool"
)

type AppContext struct {
	DB       *pgxpool.Pool
	BotToken string
}

func main() {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	dbURL := os.Getenv("DATABASE_URL")

	dbPool, err := pgxpool.Connect(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer dbPool.Close()

	appCtx := &AppContext{
		DB:       dbPool,
		BotToken: botToken,
	}

	app := fiber.New()
	app.Use(cors.New())

	api := app.Group("/api")

	// Protected routes
	api.Use(AuthMiddleware(appCtx))

	api.Get("/exercises", GetExercises(appCtx))
	api.Get("/profile", GetProfile(appCtx))

	log.Fatal(app.Listen(":3000"))
}

// AuthMiddleware validates Telegram Web App initData
func AuthMiddleware(ctx *AppContext) fiber.Handler {
	return func(c *fiber.Ctx) error {
		initData := c.Get("X-TG-Init-Data")
		if initData == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Missing initData"})
		}

		if !validateTelegramInitData(initData, ctx.BotToken) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid auth signature"})
		}

		return c.Next()
	}
}

func validateTelegramInitData(initData, botToken string) bool {
	values, err := url.ParseQuery(initData)
	if err != nil {
		return false
	}

	hash := values.Get("hash")
	values.Del("hash")

	var keys []string
	for k := range values {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var dataCheckArr []string
	for _, k := range keys {
		dataCheckArr = append(dataCheckArr, fmt.Sprintf("%s=%s", k, values.Get(k)))
	}
	dataCheckString := strings.Join(dataCheckArr, "\n")

	secretKey := hmacSHA256([]byte(botToken), []byte("WebAppData"))
	signature := hmacSHA256([]byte(dataCheckString), secretKey)

	return hex.EncodeToString(signature) == hash
}

func hmacSHA256(data, key []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}

func GetExercises(ctx *AppContext) fiber.Handler {
	return func(c *fiber.Ctx) error {
		rows, err := ctx.DB.Query(context.Background(), "SELECT id, name, muscle_group, difficulty, video_url, thumbnail_url, description FROM exercises")
		if err != nil {
			return c.Status(500).SendString(err.Error())
		}
		defer rows.Close()

		var exercises []fiber.Map
		for rows.Next() {
			var id int
			var name, muscle, diff, vUrl, tUrl, desc string
			rows.Scan(&id, &name, &muscle, &diff, &vUrl, &tUrl, &desc)
			exercises = append(exercises, fiber.Map{
				"id": id, "name": name, "muscle_group": muscle, "difficulty": diff,
				"video_url": vUrl, "thumbnail_url": tUrl, "description": desc,
			})
		}
		return c.JSON(exercises)
	}
}

func GetProfile(ctx *AppContext) fiber.Handler {
	return func(c *fiber.Ctx) error {
		initData := c.Get("X-TG-Init-Data")
		values, err := url.ParseQuery(initData)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid init data"})
		}

		userJSON := values.Get("user")
		if userJSON == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No user in init data"})
		}

		var tgUser struct {
			ID        int64  `json:"id"`
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Username  string `json:"username"`
		}

		if err := json.Unmarshal([]byte(userJSON), &tgUser); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse user JSON"})
		}

		var firstName string
		var streakCount int
		var workoutsCompleted int

		// Query database for user stats and total workout completions
		err = ctx.DB.QueryRow(context.Background(), `
			SELECT 
				COALESCE(first_name, $2), 
				COALESCE(streak_count, 0),
				(SELECT COUNT(*) FROM workout_logs WHERE user_id = users.id) as workouts_completed
			FROM users 
			WHERE telegram_id = $1
		`, tgUser.ID, tgUser.FirstName).Scan(&firstName, &streakCount, &workoutsCompleted)

		// Handle case where user is not in the database yet
		if err != nil {
			// Instead of error, return 0-stats for a new user
			return c.JSON(fiber.Map{
				"telegram_id":        tgUser.ID,
				"first_name":         tgUser.FirstName,
				"streak_count":       0,
				"workouts_completed": 0,
			})
		}

		return c.JSON(fiber.Map{
			"telegram_id":        tgUser.ID,
			"first_name":         firstName,
			"streak_count":       streakCount,
			"workouts_completed": workoutsCompleted,
		})
	}
}
