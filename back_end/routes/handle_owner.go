package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"
	"roam.io/models" // Ensure models package is imported
)

// CreateOwner handles the creation of a new Owner (previously Host)
func CreateOwner(db *gorm.DB) http.HandlerFunc { // Renamed function
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var payload models.Owner // Changed type from Host to Owner
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		// Ensure payload includes necessary fields (Name, Email, Phone)
		// Add validation if needed

		owner := models.Owner{ // Changed type from Host to Owner
			Name:  payload.Name,
			Email: payload.Email,
			Phone: payload.Phone, // Use Phone field
		}
		result := db.Create(&owner) // Create owner
		if result.Error != nil {
			// Handle potential errors, e.g., duplicate email if unique constraint exists
			fmt.Println(result.Error)
			http.Error(w, "Failed to create owner", http.StatusInternalServerError) // More specific error
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(owner) // Encode the created owner
	}
}
