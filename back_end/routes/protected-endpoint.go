// For testing purposes only

package routes

import (
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
	"roam.io/models"
)

func ProtectedEndpointHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := getSession(r, "session")
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
