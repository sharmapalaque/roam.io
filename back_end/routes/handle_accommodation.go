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
		// Ensure OwnerID is provided
		if payload.OwnerID == 0 {
			http.Error(w, "OwnerID is required", http.StatusBadRequest)
			return
		}

		accommodation := models.Accommodation{
			Name:          payload.Name,
			Location:      payload.Location,
			ImageUrls:     pq.StringArray(payload.ImageUrls),
			Description:   payload.Description,
			Facilities:    payload.Facilities,
			OwnerID:       payload.OwnerID,
			PricePerNight: payload.PricePerNight,
			Rating:        payload.Rating,
			// RawUserReviews field will be handled if review creation is implemented separately
		}

		// // Convert reviews to strings for storage - Removed as reviews are not handled during creation
		// if len(payload.UserReviews) > 0 {
		// 	rawReviews := make([]string, 0, len(payload.UserReviews))
		// 	for _, review := range payload.UserReviews {
		// 		reviewJSON, _ := json.Marshal(review)
		// 		rawReviews = append(rawReviews, string(reviewJSON))
		// 	}
		// 	accommodation.RawUserReviews = pq.StringArray(rawReviews)
		// }

		result := db.Create(&accommodation)
		if result.Error != nil {
			// Check if the error is due to foreign key constraint (invalid OwnerID)
			if errors.Is(result.Error, gorm.ErrForeignKeyViolated) {
				http.Error(w, "Invalid OwnerID provided", http.StatusBadRequest)
				return
			}
			fmt.Println(result.Error)
			http.Error(w, "Failed to create accommodation", http.StatusInternalServerError)
			return
		}

		// Fetch the associated owner details to populate the Owner field for the response
		var ownerDetails models.Owner
		if err := db.First(&ownerDetails, accommodation.OwnerID).Error; err != nil {
			// Log the error but proceed, as the accommodation was created
			fmt.Printf("Warning: Failed to fetch owner details for new accommodation %d: %v\n", accommodation.ID, err)
		} else {
			accommodation.Owner = ownerDetails
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

func GetAccommodationsByID(id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation
	result := db.Where("id = ?", id).First(&accommodation)
	if result.Error != nil {
		// Log the error when fetching accommodation fails
		fmt.Printf("Error fetching accommodation %s by ID: %v\n", id, result.Error)
		return nil, result.Error
	}

	// Fetch the associated owner details
	var ownerDetails models.Owner
	ownerResult := db.First(&ownerDetails, accommodation.OwnerID)
	if ownerResult.Error == nil {
		// Owner found
		accommodation.Owner = ownerDetails
		fmt.Printf("Successfully fetched owner %d for accommodation %d (ByID)\n", accommodation.OwnerID, accommodation.ID) // Log success
	} else {
		// Log the specific error when fetching owner fails
		fmt.Printf("Failed to fetch owner %d for accommodation %d (ByID): %v\n", accommodation.OwnerID, accommodation.ID, ownerResult.Error)
		// Only log as an application-level error if it's NOT ErrRecordNotFound
		if !errors.Is(ownerResult.Error, gorm.ErrRecordNotFound) {
			fmt.Printf("Error fetching owner %d for accommodation %d (ByID): %v\n", accommodation.OwnerID, accommodation.ID, ownerResult.Error)
		}
		// Do not return an error here, just leave Owner as zero-value if not found
	}

	return &accommodation, nil
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
		fmt.Printf("Error fetching accommodations by location '%s': %v\n", location, result.Error)
		return nil, result.Error
	}

	if len(accommodations) > 0 {
		// Fetch owner details efficiently
		ownerIDs := make([]uint, 0, len(accommodations))
		for _, acc := range accommodations {
			if acc.OwnerID != 0 { // Avoid querying for owner ID 0
				ownerIDs = append(ownerIDs, acc.OwnerID)
			}
		}

		// Remove duplicates if any
		uniqueOwnerIDs := make(map[uint]struct{})
		distinctOwnerIDs := make([]uint, 0, len(ownerIDs))
		for _, id := range ownerIDs {
			if _, exists := uniqueOwnerIDs[id]; !exists {
				uniqueOwnerIDs[id] = struct{}{}
				distinctOwnerIDs = append(distinctOwnerIDs, id)
			}
		}

		var owners []models.Owner
		ownerMap := make(map[uint]models.Owner)
		if len(distinctOwnerIDs) > 0 {
			// Log the IDs we are searching for
			fmt.Printf("Fetching owners with IDs: %v for location '%s'\n", distinctOwnerIDs, location)
			if err := db.Where("id IN ?", distinctOwnerIDs).Find(&owners).Error; err != nil {
				fmt.Printf("Error fetching owners for accommodations (location '%s'): %v\n", location, err)
				// Proceed without owner details if owners can't be fetched
			} else {
				// Log how many owners were actually found
				fmt.Printf("Found %d owners for location '%s'\n", len(owners), location)
				for _, o := range owners {
					ownerMap[o.ID] = o
				}
			}
		}

		// Populate Owner field
		for i := range accommodations {
			if ownerDetails, ok := ownerMap[accommodations[i].OwnerID]; ok {
				accommodations[i].Owner = ownerDetails
			} else if accommodations[i].OwnerID != 0 {
				// Log if an owner was expected but not found in the map (should have been caught by db query logging)
				fmt.Printf("Owner %d for accommodation %d not found in map (location '%s')\n", accommodations[i].OwnerID, accommodations[i].ID, location)
			}
		}
	}
	return accommodations, nil
}

func GetAccommodationsById(id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation

	result := db.First(&accommodation, id) // Fetch accommodation first

	if result.Error != nil {
		// Log the error when fetching accommodation fails
		fmt.Printf("Error fetching accommodation %s: %v\n", id, result.Error)
		return nil, result.Error
	}

	// Fetch the associated owner details separately
	var ownerDetails models.Owner
	// Use a separate variable for the query result/error
	ownerResult := db.First(&ownerDetails, accommodation.OwnerID)
	if ownerResult.Error == nil {
		// Owner found, assign it
		accommodation.Owner = ownerDetails
		fmt.Printf("Successfully fetched owner %d for accommodation %d\n", accommodation.OwnerID, accommodation.ID) // Log success
	} else {
		// Log the specific error when fetching owner fails
		fmt.Printf("Failed to fetch owner %d for accommodation %d: %v\n", accommodation.OwnerID, accommodation.ID, ownerResult.Error)
		// Only log as an application-level error if it's NOT ErrRecordNotFound
		if !errors.Is(ownerResult.Error, gorm.ErrRecordNotFound) {
			fmt.Printf("Error fetching owner %d for accommodation %d: %v\n", accommodation.OwnerID, accommodation.ID, ownerResult.Error)
		}
		// Do not return an error here, just leave Owner as zero-value if not found
	}
	return &accommodation, nil
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
