package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"roam.io/models"
)

var currUserID string

type UserRequest struct {
	Name     string `json:"name"`     // Changed from "Name" to "name"
	Username string `json:"username"` // Changed from "Username" to "username"
	Email    string `json:"email"`    // Changed from "Email" to "email"
	Password string `json:"password"` // Changed from "Password" to "password"
	Dob      string `json:"dob"`      // Already using lowercase "dob"
}

// CreateUserHandler handles the user creation logic
func CreateUserHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the incoming JSON into our custom request struct
		var userReq UserRequest
		decoder := json.NewDecoder(r.Body)
		if err := decoder.Decode(&userReq); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid JSON format: " + err.Error()})
			return
		}

		// Print the parsed request for debugging
		fmt.Printf("Parsed request: %+v\n", userReq)

		// Parse the date string into time.Time
		// Try different formats, starting with the simple YYYY-MM-DD
		dob, err := time.Parse("2006-01-02", userReq.Dob)
		if err != nil {
			// Try RFC3339 format as fallback
			dob, err = time.Parse(time.RFC3339, userReq.Dob)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{
					"message": "Invalid date format. Please use YYYY-MM-DD format: " + err.Error(),
				})
				return
			}
		}

		// Hash the password
		hashedPw, err := HashPassword(userReq.Password)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Error processing password"})
			return
		}

		// Create the user with our parsed values
		userID, err := CreateUser(userReq.Name, userReq.Email, userReq.Username, hashedPw, dob, db)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Failed to insert user: " + err.Error()})
			return
		}

		// Return response with the new user ID
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int{"id": userID})
	}
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func CreateUser(name, email, username, password string, dob time.Time, db *gorm.DB) (id int, err error) {
	user := models.User{Name: name, Email: email, Username: username, Password: password, Dob: dob}
	result := db.Create(&user)
	if result.Error != nil {
		return 0, result.Error
	} else {
		fmt.Println("User created successfully:", user)
		return int(user.ID), nil
	}
}
