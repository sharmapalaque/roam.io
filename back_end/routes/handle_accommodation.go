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
		accommodation := models.Accommodation{Name: payload.Name, Location: payload.Location, ImageUrls: pq.StringArray(payload.ImageUrls), UserReviews: payload.UserReviews, Description: payload.Description, Facilities: payload.Facilities}
		result := db.Create(&accommodation)
		if result.Error != nil {
			fmt.Println(result.Error)
		}
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
		layout := "2006-01-02" // Date format (YYYY-MM-DD)
		if accommodation_id == "" || checking_date == "" || checkout_date == "" || guests == "" {
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

		bookingID, err := CreateBooking(userID, uintValue, checkInDate, checkOutDate, guestsUintValue, db)
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

func CreateBooking(userID, accommodationID uint, checkinDate, checkoutDate time.Time, guests uint, db *gorm.DB) (id int, err error) {
	booking := models.Booking{UserID: userID, AccommodationID: accommodationID, CheckinDate: checkinDate, CheckoutDate: checkoutDate, Guests: guests}
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

func GetAccommodationsById(id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation

	result := db.First(&accommodation, id)

	if result.Error != nil {

		return nil, result.Error
	} else {
		return &accommodation, nil
	}
}

func RemoveBookingByAccommodationID(accommodationID, userID int, db *gorm.DB) error {
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	result := tx.Where("accommodation_id = ? AND user_id = ?", accommodationID, userID).Delete(&models.Booking{})

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
		accommodation_id := queryParams.Get("accommodation_id")

		session, _ := store.Get(r, "session")

		// Get user ID from session
		userID, ok := session.Values["user_id"].(uint)
		fmt.Println(userID)
		if !ok {
			http.Error(w, "Unauthorized: No session found", http.StatusUnauthorized)
			return
		}
		u, err := strconv.ParseUint(accommodation_id, 10, 32) // base 10, uint32 max bits
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		uintValue := uint(u)

		err = RemoveBookingByAccommodationID(int(uintValue), int(userID), db)
		if err != nil {
			http.Error(w, "Booking not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode("Booking removed")
	}
}
