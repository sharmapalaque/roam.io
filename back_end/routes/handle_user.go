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

// CreateUserHandler handles the user creation logic
func CreateUserHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var user models.User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request payload"})
			return
		}

		hashedPw, err := HashPassword(user.Password)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Error processing password"})
			fmt.Println("error hashing password", err)
			return
		}

		userID, err := CreateUser(user.Name, user.Email, user.Username, hashedPw, user.Dob, db)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Failed to insert user"})
			fmt.Println(err)
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
