package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gorm.io/gorm"
	"roam.io/models"
)

func FetchAccommodations(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		queryParams := r.URL.Query()
		location := queryParams.Get("location")
		accommodations, err := GetAccommodationsByLocation(location, db)
		if err != nil {
			http.Error(w, "Failed to fetch accommodations", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		// Return response with the new user ID
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(accommodations)
	}
}

func AddAccommodation(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		queryParams := r.URL.Query()
		booking_id := queryParams.Get("booking_id")
		accommodation, err := GetAccommodationsByID(booking_id, db)
		if err != nil {
			http.Error(w, "Failed to fetch accommodation", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		db.Model(&models.User{}).Where("id = ?", 1).Updates(models.User{Bookings: *accommodation})

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(accommodation)
	}
}

func GetAccommodationsByID(booking_id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation
	result := db.Where("id = ?", booking_id).First(&accommodation)
	if result.Error != nil {
		return nil, result.Error
	} else {
		return &accommodation, nil
	}
}

func GetAccommodationsByLocation(location string, db *gorm.DB) ([]models.Accommodation, error) {
	var accommodations []models.Accommodation
	var result *gorm.DB
	if location == "" {
		result = db.Find(&accommodations)
	} else {
		result = db.Where("location = ?", location).Find(&accommodations)
	}
	if result.Error != nil {
		return nil, result.Error
	} else {
		return accommodations, nil
	}
}
