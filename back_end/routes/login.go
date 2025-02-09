package routes

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"roam.io/models"
)

func LoginHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
			Name     string `json: "name"`
			Username string `json: "username"`
			Age      int    `json: "age"`
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if req.Email == "" || req.Password == "" {
			http.Error(w, "Email and password are required", http.StatusBadRequest)
			return
		}

		var user models.User
		result := db.Where("email = ?", req.Email).First(&user)
		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				if req.Name == "" || req.Username == "" || req.Age == 0 {
					http.Error(w, "User not found", http.StatusNotFound)
					return
				}

				hashedPw, err := hashPassword(req.Password)
				if err != nil {
					http.Error(w, "Failed to hash password", http.StatusInternalServerError)
					return
				}

				user = models.User{
					Name:     req.Name,
					Email:    req.Email,
					Username: req.Username,
					Password: hashedPw,
					Age:      req.Age,
				}

				if err := db.Create(&user).Error; err != nil {
					http.Error(w, "Failed to create user", http.StatusInternalServerError)
					return
				}

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusCreated)
				json.NewEncoder(w).Encode(map[string]interface{}{
					"message": "User created successfully",
					"user_id": user.ID,
				})
				return
			} else {
				http.Error(w, "Database error", http.StatusInternalServerError)
				return
			}
		}

		if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			http.Error(w, "Invalid password", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Login successful",
			"user_id": user.ID,
		})
	}
}

func hashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}
