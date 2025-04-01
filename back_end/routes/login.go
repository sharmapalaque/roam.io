package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"roam.io/models"
)

var store = sessions.NewCookieStore([]byte("secret-key"))

// getSession returns a session from the store, using test helpers if in test mode
func getSession(r *http.Request, name string) (*sessions.Session, error) {
	if testStoreSet {
		return GetSessionForTesting(r, name)
	}
	return store.Get(r, name)
}

func LoginHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request payload"})
			return
		}

		if req.Email == "" || req.Password == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Email and password are required"})
			return
		}

		var user models.User
		result := db.Where("email = ?", req.Email).First(&user)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
				return
			} else {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Database error"})
				fmt.Println(result.Error)
				return
			}
		}

		if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid password"})
			return
		}

		session, _ := getSession(r, "session")
		session.Values["user_id"] = user.ID
		session.Save(r, w)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Login successful",
			"user_id": user.ID,
		})
	}
}

// LogoutHandler clears the user session
func LogoutHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := getSession(r, "session")

		// Check if user is actually logged in (optional, but good practice)
		if _, ok := session.Values["user_id"]; !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized) // Or BadRequest, depending on desired behavior
			json.NewEncoder(w).Encode(map[string]string{"message": "Not logged in"})
			return
		}

		// Clear the session value
		delete(session.Values, "user_id")
		// Set MaxAge to -1 to delete the cookie
		session.Options.MaxAge = -1
		err := session.Save(r, w)
		if err != nil {
			// Log the error appropriately
			fmt.Println("Error saving session:", err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Failed to logout"})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Logout successful"})
	}
}
