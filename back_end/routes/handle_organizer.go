package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"
	"roam.io/models" // Ensure models package is imported
)

func CreateOrganizer(db *gorm.DB) http.HandlerFunc { // Renamed function
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var payload models.Organizer
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		organizer := models.Organizer{
			Name:  payload.Name,
			Email: payload.Email,
			Phone: payload.Phone, // Use Phone field
		}
		result := db.Create(&organizer) // Create owner
		if result.Error != nil {
			// Handle potential errors, e.g., duplicate email if unique constraint exists
			fmt.Println(result.Error)
			http.Error(w, "Failed to create organizer", http.StatusInternalServerError) // More specific error
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(organizer) // Encode the created owner
	}
}
