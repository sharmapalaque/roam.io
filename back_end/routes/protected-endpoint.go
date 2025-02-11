// For testing purposes only

package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/sessions"
	"gorm.io/gorm"
	"roam.io/models"
)

var cookieStore = sessions.NewCookieStore([]byte("secret-key"))

func ProtectedEndpointHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := cookieStore.Get(r, "session")
		userID, ok := session.Values["user_id"].(uint)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var user models.User
		result := db.First(&user, userID)
		if result.Error != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Access granted",
			"user":    user,
		})
	}
}
