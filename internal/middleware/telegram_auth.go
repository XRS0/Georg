package middleware

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/example/telegram-fitness/internal/models"
)

type contextKey string

const telegramUserKey contextKey = "telegram-user"

func TelegramUserFromContext(ctx context.Context) (models.TelegramUser, bool) {
	user, ok := ctx.Value(telegramUserKey).(models.TelegramUser)
	return user, ok
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		initData := r.Header.Get("X-Telegram-Init-Data")
		if initData == "" {
			initData = r.URL.Query().Get("initData")
		}

		if initData == "" {
			if user, ok := fallbackWebUser(); ok {
				ctx := context.WithValue(r.Context(), telegramUserKey, user)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

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

func fallbackWebUser() (models.TelegramUser, bool) {
	if strings.ToLower(os.Getenv("ALLOW_WEB_AUTH")) != "true" {
		return models.TelegramUser{}, false
	}

	userID := int64(-1)
	if rawID := os.Getenv("WEB_FALLBACK_TELEGRAM_ID"); rawID != "" {
		if parsedID, err := strconv.ParseInt(rawID, 10, 64); err == nil {
			userID = parsedID
		}
	}

	firstName := os.Getenv("WEB_FALLBACK_FIRST_NAME")
	if firstName == "" {
		firstName = "Web"
	}
	lastName := os.Getenv("WEB_FALLBACK_LAST_NAME")
	username := os.Getenv("WEB_FALLBACK_USERNAME")
	if username == "" {
		username = "web_user"
	}

	return models.TelegramUser{
		ID:        userID,
		FirstName: firstName,
		LastName:  lastName,
		Username:  username,
	}, true
}

func ValidateTelegramInitData(initData string, botToken string, maxAge time.Duration) (models.TelegramUser, error) {
	values, err := url.ParseQuery(initData)
	if err != nil {
		return models.TelegramUser{}, fmt.Errorf("parse init data: %w", err)
	}

	hash := values.Get("hash")
	if hash == "" {
		return models.TelegramUser{}, errors.New("missing hash")
	}
	values.Del("hash")

	dataCheckString := buildDataCheckString(values)
	secretKey := sha256.Sum256([]byte(botToken))
	h := hmac.New(sha256.New, secretKey[:])
	_, _ = h.Write([]byte(dataCheckString))
	computedHash := hex.EncodeToString(h.Sum(nil))

	if !hmac.Equal([]byte(computedHash), []byte(hash)) {
		return models.TelegramUser{}, errors.New("hash mismatch")
	}

	authDateRaw := values.Get("auth_date")
	if authDateRaw != "" {
		authDateUnix, err := strconv.ParseInt(authDateRaw, 10, 64)
		if err != nil {
			return models.TelegramUser{}, fmt.Errorf("invalid auth_date: %w", err)
		}
		if time.Since(time.Unix(authDateUnix, 0)) > maxAge {
			return models.TelegramUser{}, errors.New("init data expired")
		}
	}

	userJSON := values.Get("user")
	if userJSON == "" {
		return models.TelegramUser{}, errors.New("missing user data")
	}

	user, err := parseTelegramUser(userJSON)
	if err != nil {
		return models.TelegramUser{}, err
	}

	return user, nil
}

func buildDataCheckString(values url.Values) string {
	keys := make([]string, 0, len(values))
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	pairs := make([]string, 0, len(keys))
	for _, key := range keys {
		pairs = append(pairs, fmt.Sprintf("%s=%s", key, values.Get(key)))
	}

	return strings.Join(pairs, "\n")
}

func parseTelegramUser(raw string) (models.TelegramUser, error) {
	var user struct {
		ID        int64  `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Username  string `json:"username"`
	}

	if err := json.Unmarshal([]byte(raw), &user); err != nil {
		return models.TelegramUser{}, fmt.Errorf("decode user: %w", err)
	}

	return models.TelegramUser{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Username:  user.Username,
	}, nil
}
