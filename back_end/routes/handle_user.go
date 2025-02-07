package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"roam.io/models"
)

// CreateUserHandler handles the user creation logic
func CreateUserHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var user models.User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		hashedPw, _ := HashPassword(user.Password)
		if err != nil {
			fmt.Println("error hashing password", err)
			return
		}

		userID, err := CreateUser(user.Name, user.Email, user.Username, hashedPw, user.Age, db)
		if err != nil {
			http.Error(w, "Failed to insert user", http.StatusInternalServerError)
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

func CreateUser(name, email, username, password string, age int, db *gorm.DB) (id int, err error) {
	user := models.User{Name: name, Email: email, Username: username, Password: password, Age: age}
	result := db.Create(&user)
	if result.Error != nil {
		return 0, result.Error
	} else {
		fmt.Println("User created successfully:", user)
		return int(user.ID), nil
	}
}
