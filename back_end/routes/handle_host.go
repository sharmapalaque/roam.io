package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"
	"roam.io/models"
)

func CreateHost(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var payload models.Host
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		host := models.Host{Name: payload.Name, Email: payload.Email, Phone: payload.Phone}
		result := db.Create(&host)
		if result.Error != nil {
			fmt.Println(result.Error)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(host)
	}
}
