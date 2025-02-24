package routes

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

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
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(accommodations)
	}
}

func AddBooking(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		queryParams := r.URL.Query()
		accommodation_id := queryParams.Get("accommodation_id")
		checking_date := queryParams.Get("check_in_date")
		checkout_date := queryParams.Get("check_out_date")
		layout := "2006-01-02" // Date format (YYYY-MM-DD)

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
		bookings, err := GetBookingByUserID(int(userID), db)
		if err != nil {
			http.Error(w, "Failed to fetch user bookings", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		for _, booking := range bookings {
			if booking.AccommodationID == uintValue {
				http.Error(w, "Booking already exists for user", http.StatusConflict)
				return
			}
		}

		bookingID, err := CreateBooking(userID, uintValue, checkInDate, checkOutDate, db)
		if err != nil {
			http.Error(w, "Failed to create booking", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]int{"id": bookingID})
	}
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

func CreateBooking(userID, accommodationID uint, checkinDate, checkoutDate time.Time, db *gorm.DB) (id int, err error) {
	booking := models.Booking{UserID: userID, AccommodationID: accommodationID, CheckinDate: checkinDate, CheckoutDate: checkoutDate}
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

func CreateAccommodation(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var user models.Accommodation
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		accommodation := models.Accommodation{Name: user.Name, Location: user.Location, ImageUrl: user.ImageUrl, UserReviews: user.UserReviews}
		result := db.Create(&accommodation)
		if result.Error != nil {
			fmt.Println(result.Error)
		}
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

func RemoveBookingByAccommodationID(accommodationID, userID int, db *gorm.DB) error {
	var booking models.Booking
	result := db.Where("accommodation_id = ? AND user_id = ?", accommodationID, userID).Delete(&booking)

	if result.RowsAffected > 0 {
		return nil
	} else {
		return errors.New("error removing booking")
	}

}
