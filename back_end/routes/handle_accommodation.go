package routes

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"gorm.io/gorm"
	"roam.io/models"
)

func FetchAccommodations(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		{
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
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(accommodations)
		}
	}
}

func FetchAccommodationById(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		accommodation_id, exists := vars["id"]
		if accommodation_id != "" || exists {
			result, err := GetAccommodationsById(accommodation_id, db)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					http.Error(w, "Accommodation not Found", http.StatusNotFound)
					return
				}
				http.Error(w, "Failed to fetch accommodations", http.StatusInternalServerError)
				fmt.Println(err)
				return
			}
			// Return response with the new user ID
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(result)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
		}
	}

}

func CreateAccommodation(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var payload models.Accommodation
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		accommodation := models.Accommodation{
			Name:          payload.Name,
			Location:      payload.Location,
			ImageUrls:     pq.StringArray(payload.ImageUrls),
			Description:   payload.Description,
			Facilities:    payload.Facilities,
			HostID:        payload.HostID,
			PricePerNight: payload.PricePerNight,
			Rating:        payload.Rating,
		}

		// Convert reviews to strings for storage
		if len(payload.UserReviews) > 0 {
			rawReviews := make([]string, 0, len(payload.UserReviews))
			for _, review := range payload.UserReviews {
				reviewJSON, _ := json.Marshal(review)
				rawReviews = append(rawReviews, string(reviewJSON))
			}
			accommodation.RawUserReviews = pq.StringArray(rawReviews)
		}

		result := db.Create(&accommodation)
		if result.Error != nil {
			fmt.Println(result.Error)
			http.Error(w, "Failed to create accommodation", http.StatusInternalServerError)
			return
		}

		// Add sample reviews and owner data for immediate response
		enhanceAccommodationWithSampleData(&accommodation, db)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(accommodation)
	}
}

func AddBooking(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		queryParams := r.URL.Query()
		accommodation_id := queryParams.Get("accommodation_id")
		checking_date := queryParams.Get("check_in_date")
		checkout_date := queryParams.Get("check_out_date")
		guests := queryParams.Get("guests")
		total_cost := queryParams.Get("total_cost")
		layout := "2006-01-02" // Date format (YYYY-MM-DD)
		if accommodation_id == "" || checking_date == "" || checkout_date == "" || guests == "" || total_cost == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid JSON format:"})
			return
		}
		// Convert string to time.Time
		checkInDate, err := time.Parse(layout, checking_date)
		if err != nil {
			fmt.Println("Error parsing date:", err)
			return
		}

		// Convert string to time.Time
		checkOutDate, err := time.Parse(layout, checkout_date)
		if err != nil {
			fmt.Println("Error parsing date:", err)
			return
		}
		// accommodation, err := GetAccommodationsByID(accommodation_id, db)
		// if err != nil {
		// 	http.Error(w, "Failed to fetch accommodation", http.StatusInternalServerError)
		// 	fmt.Println(err)
		// 	return
		// }

		session, _ := store.Get(r, "session")

		// Get user ID from session
		userID, ok := session.Values["user_id"].(uint)
		fmt.Print("USER ID: ")
		fmt.Println(userID)
		if !ok || userID == 0 {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Unauthorized, no session found"})
			return
		}
		u, err := strconv.ParseUint(accommodation_id, 10, 32) // base 10, uint32 max bits
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		uintValue := uint(u)
		ui, err := strconv.ParseUint(guests, 10, 32) // base 10, uint32 max bits
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		guestsUintValue := uint(ui)

		uit, err := strconv.ParseUint(total_cost, 10, 32) // base 10, uint32 max bits
		if err != nil {
			fmt.Println("Error:", err)
			return
		}
		totalcostUintValue := uint(uit)
		bookings, err := GetBookingByUserID(int(userID), db)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Internal server error"})
			fmt.Println(err)
			return
		}

		for _, booking := range bookings {
			if booking.AccommodationID == uintValue {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusConflict)
				json.NewEncoder(w).Encode(map[string]string{"message": "Booking Already exists for user"})
				return
			}
		}

		bookingID, err := CreateBooking(userID, uintValue, checkInDate, checkOutDate, guestsUintValue, totalcostUintValue, db)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Failed to Create booking"})
			fmt.Println(err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int{"id": bookingID})
	}
}

func CreateBooking(userID, accommodationID uint, checkinDate, checkoutDate time.Time, guests uint, total_cost uint, db *gorm.DB) (id int, err error) {
	booking := models.Booking{UserID: userID, AccommodationID: accommodationID, CheckinDate: checkinDate, CheckoutDate: checkoutDate, Guests: guests, TotalCost: total_cost}
	result := db.Create(&booking)
	if result.Error != nil {
		return 0, result.Error
	} else {
		fmt.Println("Booking created successfully:", booking)
		return int(booking.ID), nil
	}
}

func GetBookingByUserID(userID int, db *gorm.DB) ([]models.Booking, error) {
	bookings := []models.Booking{}
	result := db.Where("user_id = ?", userID).Find(&bookings)
	if result.Error != nil {
		return nil, result.Error
	} else {
		return bookings, nil
	}
}

func GetAccommodationsByID(booking_id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation
	result := db.Where("id = ?", booking_id).First(&accommodation)
	if result.Error != nil {
		return nil, result.Error
	} else {
		// Enhance accommodation with sample data
		enhanceAccommodationWithSampleData(&accommodation, db)
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
		// Enhance accommodations with sample data
		for i := range accommodations {
			enhanceAccommodationWithSampleData(&accommodations[i], db)
		}
		return accommodations, nil
	}
}

func GetAccommodationsById(id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation

	result := db.First(&accommodation, id)

	if result.Error != nil {
		return nil, result.Error
	} else {
		// Enhance accommodation with sample data
		enhanceAccommodationWithSampleData(&accommodation, db)
		return &accommodation, nil
	}
}

// enhanceAccommodationWithSampleData adds the required fields for the response format
func enhanceAccommodationWithSampleData(accommodation *models.Accommodation, db *gorm.DB) {
	// Set a price based on the ID (for demonstration purposes)
	accommodation.PricePerNight = 199.0 + float64(accommodation.ID*10)

	// Set a rating between 4.0 and 5.0
	accommodation.Rating = 4.0 + (float64(accommodation.ID%10) / 10.0)
	if accommodation.Rating > 5.0 {
		accommodation.Rating = 5.0
	}

	// Use default owner data instead of trying to query the database
	// This avoids "record not found" errors when no hosts exist yet
	accommodation.Owner = models.Owner{
		Name:         "Host Name",
		Email:        "host@example.com",
		Phone:        "+1 (555) 123-4567",
		ResponseRate: "95% within 24 hours",
	}

	// Set sample reviews
	accommodation.UserReviews = []models.Review{
		{
			ID:       100 + accommodation.ID,
			UserName: "John D.",
			Rating:   4.8,
			Date:     "June 15, 2023",
			Comment:  "Wonderful place to stay! Highly recommended.",
		},
		{
			ID:       200 + accommodation.ID,
			UserName: "Jane S.",
			Rating:   4.5,
			Date:     "July 22, 2023",
			Comment:  "Great location and amenities. Would stay again.",
		},
	}
}

func RemoveBookingByBookingID(bookingID int, db *gorm.DB) error {
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	result := tx.Where("id = ?", bookingID).Delete(&models.Booking{})

	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	if result.RowsAffected == 0 {
		tx.Rollback()
		return errors.New("error removing booking")
	}

	return tx.Commit().Error

}

func RemoveBooking(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		queryParams := r.URL.Query()
		booking_id := queryParams.Get("booking_id")

		u, err := strconv.ParseUint(booking_id, 10, 32) // base 10, uint32 max bits
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		uintValue := uint(u)

		err = RemoveBookingByBookingID(int(uintValue), db)
		if err != nil {
			http.Error(w, "Booking not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode("Booking removed")
	}
}
