package routes

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"golang.org/x/crypto/bcrypt"
	"roam.io/models"
)

// CreateUserHandler handles the user creation logic
func CreateUserHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var user models.User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Insert query
		insertSQL := `INSERT INTO users (name, email, username, age, password) VALUES ($1, $2, $3, $4, $5) RETURNING id;`

		hashedPw, _ := HashPassword(user.Password)
		if err != nil {
			fmt.Println("error hashing password", err)
			return
		}

		var userID int
		err = db.QueryRow(insertSQL, user.Name, user.Email, user.Username, user.Age, hashedPw).Scan(&userID)
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
