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
			Rating:        payload.Rating, // Initial rating, could be updated based on reviews later
		}

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
		// Return the accommodation without reviews initially, as none exist yet.
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

		session, _ := getSession(r, "session")

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
	// Use Preload to fetch associated Owner and UserReviews
	result := db.Preload("Owner").Preload("UserReviews").First(&accommodation, id)
	if result.Error != nil {
		fmt.Printf("Error fetching accommodation %s by ID: %v\n", id, result.Error)
		return nil, result.Error
	}

	// Owner details are now loaded via Preload, so manual fetching is not strictly needed
	// unless you want separate error handling/logging for owner fetching.
	// We keep the logging for demonstration.
	if accommodation.Owner.ID == 0 && accommodation.OwnerID != 0 {
		// Log if owner was expected but not loaded (e.g., issue with preload or data integrity)
		fmt.Printf("Warning: Owner %d for accommodation %d was not preloaded.\n", accommodation.OwnerID, accommodation.ID)
	} else if accommodation.OwnerID != 0 {
		fmt.Printf("Successfully preloaded owner %d for accommodation %d\n", accommodation.OwnerID, accommodation.ID)
	}

	fmt.Printf("Successfully preloaded %d reviews for accommodation %d\n", len(accommodation.UserReviews), accommodation.ID)

	return &accommodation, nil
}

func GetAccommodationsByLocation(location string, db *gorm.DB) ([]models.Accommodation, error) {
	var accommodations []models.Accommodation
	query := db.Preload("Owner").Preload("UserReviews") // Preload Owner and UserReviews

	var result *gorm.DB
	if location == "" {
		result = query.Find(&accommodations)
	} else {
		result = query.Where("location = ?", location).Find(&accommodations)
	}
	if result.Error != nil {
		fmt.Printf("Error fetching accommodations by location '%s': %v\n", location, result.Error)
		return nil, result.Error
	}

	// Check if any owners aren't loaded properly
	for i, accommodation := range accommodations {
		if accommodation.Owner.ID == 0 && accommodation.OwnerID != 0 {
			// Owner wasn't properly preloaded, fetch manually
			var owner models.Owner
			if err := db.First(&owner, accommodation.OwnerID).Error; err != nil {
				fmt.Printf("Warning: Could not load owner %d for accommodation %d: %v\n",
					accommodation.OwnerID, accommodation.ID, err)
			} else {
				accommodations[i].Owner = owner
				fmt.Printf("Manually loaded owner %d for accommodation %d\n", owner.ID, accommodation.ID)
			}
		}
	}

	return accommodations, nil
}

func GetAccommodationsById(id string, db *gorm.DB) (*models.Accommodation, error) {
	var accommodation models.Accommodation
	// Use Preload here as well
	result := db.Preload("Owner").Preload("UserReviews").First(&accommodation, id)

	if result.Error != nil {
		fmt.Printf("Error fetching accommodation %s: %v\n", id, result.Error)
		return nil, result.Error
	}

	// If owner not loaded but OwnerID exists, manually load the owner
	if accommodation.Owner.ID == 0 && accommodation.OwnerID != 0 {
		var owner models.Owner
		if err := db.First(&owner, accommodation.OwnerID).Error; err != nil {
			fmt.Printf("Warning: Could not load owner %d for accommodation %d: %v\n",
				accommodation.OwnerID, accommodation.ID, err)
		} else {
			accommodation.Owner = owner
			fmt.Printf("Manually loaded owner %d for accommodation %d\n", owner.ID, accommodation.ID)
		}
	}

	fmt.Printf("Successfully preloaded %d reviews for accommodation %d\n", len(accommodation.UserReviews), accommodation.ID)

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

func AddReview(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Get Accommodation ID from URL path
		vars := mux.Vars(r)
		accommodationIDStr, ok := vars["id"]
		if !ok {
			http.Error(w, "Accommodation ID missing in URL path", http.StatusBadRequest)
			return
		}
		accommodationID, err := strconv.ParseUint(accommodationIDStr, 10, 64)
		if err != nil {
			http.Error(w, "Invalid Accommodation ID format", http.StatusBadRequest)
			return
		}

		// 2. Get User ID from session
		session, _ := getSession(r, "session")
		userID, ok := session.Values["user_id"].(uint)
		if !ok || userID == 0 {
			http.Error(w, "Unauthorized: User not logged in", http.StatusUnauthorized)
			return
		}

		// 3. Parse Review from request body
		var reviewPayload models.Review
		if err := json.NewDecoder(r.Body).Decode(&reviewPayload); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// 4. Fetch User details (specifically UserName)
		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			// Handle case where user might exist in session but not DB (unlikely but possible)
			http.Error(w, "Failed to retrieve user details", http.StatusInternalServerError)
			fmt.Printf("Error fetching user %d details for review: %v\n", userID, err)
			return
		}

		// 5. Create the Review object
		review := models.Review{
			UserID:          userID,
			AccommodationID: uint(accommodationID),
			UserName:        user.Username, // Get username from logged-in user
			Rating:          reviewPayload.Rating,
			Date:            time.Now().Format("2006-01-02"), // Set current date
			Comment:         reviewPayload.Comment,
		}

		// Basic Validation
		if review.Rating < 1 || review.Rating > 5 {
			http.Error(w, "Rating must be between 1 and 5", http.StatusBadRequest)
			return
		}
		if review.Comment == "" {
			http.Error(w, "Comment cannot be empty", http.StatusBadRequest)
			return
		}

		// 6. Save the review to the database
		result := db.Create(&review)
		if result.Error != nil {
			// Check if the error is due to foreign key constraint (invalid AccommodationID)
			// Note: GORM might return a generic error, check the underlying error type if needed.
			// Example check (may vary based on DB driver):
			var pgErr *pq.Error
			if errors.As(result.Error, &pgErr) && pgErr.Code == "23503" { // Foreign key violation
				http.Error(w, "Invalid AccommodationID provided", http.StatusBadRequest)
				return
			}
			fmt.Printf("Error creating review: %v\n", result.Error)
			http.Error(w, "Failed to create review", http.StatusInternalServerError)
			return
		}

		// Optional: Update Accommodation's average rating (more complex, involves calculating average)

		// 7. Return success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(review) // Return the created review
	}
}
