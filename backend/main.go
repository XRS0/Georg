
package main

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
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
	DB  *pgxpool.Pool
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

		// In a real app, you'd extract the user ID and set it in locals
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

func GetProfile(appCtx *AppContext) fiber.Handler {
    return func(c *fiber.Ctx) error {
        // Mocking user profile for PoC
        return c.JSON(fiber.Map{
            "telegram_id": 1234567,
            "first_name": "User",
            "streak_count": 5,
            "workouts_completed": 42,
        })
    }
}
