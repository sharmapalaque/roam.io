package routes

import (
	"encoding/json"
	"net/http"
	"time"

	"gorm.io/gorm"
	"roam.io/models"
)

type UserProfile struct {
	Name          string                    `json:"name"`
	Email         string                    `json:"email"`
	AvatarID      string                    `json:"avatar_id"`
	Bookings      []BookingWithDetails      `json:"bookings"`
	EventBookings []EventBookingWithDetails `json:"event_bookings"`
}

type BookingWithDetails struct {
	ID            uint                 `json:"id"`
	CheckinDate   time.Time            `json:"checkin_date"`
	CheckoutDate  time.Time            `json:"checkout_date"`
	Guests        uint                 `json:"guests"`
	Accommodation AccommodationDetails `json:"accommodation"`
}

type EventBookingWithDetails struct {
	ID     uint         `json:"id"`
	Guests uint         `json:"guests"`
	Event  EventDetails `json:"event"`
}

type AccommodationDetails struct {
	ID       uint   `json:"id"`
	Name     string `json:"name"`
	Location string `json:"location"`
	ImageURL string `json:"image_url"`
}

type EventDetails struct {
	ID        uint   `json:"id"`
	EventName string `json:"name"`
	Location  string `json:"location"`
	Image     string `json:"image"`
}
type UserReviewDetails struct {
	AccommodationName string  `json:"accommodation_name"`
	ReviewText        string  `json:"review_text"`
	ReviewRating      float64 `json:"review_rating"`
	ReviewDate        string  `json:"review_date"`
}

type UpdateAvatarRequest struct {
	AvatarID string `json:"avatar_id" example:"Marshmallow"`
}

// GetUserProfileHandler retrieves the user profile information
// @Summary Get user profile
// @Description Retrieves user profile information including personal details, bookings, and event bookings
// @Tags users
// @Produce json
// @Success 200 {object} UserProfile "User profile data including bookings"
// @Failure 401 {object} map[string]string "User not authenticated"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Server error"
// @Router /users/profile [get]
func GetUserProfileHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := getSession(r, "session")
		if err != nil {
			http.Error(w, "Error retrieving session", http.StatusInternalServerError)
			return
		}

		userID, ok := session.Values["user_id"].(uint)
		if !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "User not authenticated"})
			return
		}

		var user models.User
		if result := db.First(&user, userID); result.Error != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
			return
		}

		var bookings []models.Booking
		if result := db.Where("user_id = ?", userID).Find(&bookings); result.Error != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Error fetching user bookings"})
			return
		}

		var eventBookings []models.EventBooking
		if result := db.Where("user_id = ?", userID).Find(&eventBookings); result.Error != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Error fetching user event bookings"})
			return
		}

		profile := UserProfile{
			Name:          user.Name,
			Email:         user.Email,
			AvatarID:      user.AvatarID,
			Bookings:      make([]BookingWithDetails, 0, len(bookings)),
			EventBookings: make([]EventBookingWithDetails, 0, len(eventBookings)),
		}

		for _, booking := range bookings {
			var accommodation models.Accommodation
			if result := db.First(&accommodation, booking.AccommodationID); result.Error != nil {
				continue
			}

			imageURL := ""
			if len(accommodation.ImageUrls) > 0 {
				imageURL = accommodation.ImageUrls[0]
			}

			bookingDetails := BookingWithDetails{
				ID:           booking.ID,
				CheckinDate:  booking.CheckinDate,
				CheckoutDate: booking.CheckoutDate,
				Guests:       booking.Guests,
				Accommodation: AccommodationDetails{
					ID:       accommodation.ID,
					Name:     accommodation.Name,
					Location: accommodation.Location,
					ImageURL: imageURL,
				},
			}

			profile.Bookings = append(profile.Bookings, bookingDetails)
		}

		for _, eventBooking := range eventBookings {
			var event models.Event
			if result := db.First(&event, eventBooking.EventId); result.Error != nil {
				continue
			}

			images := ""
			if len(event.Images) > 0 {
				images = event.Images[0]
			}

			eventBookingDetails := EventBookingWithDetails{
				ID:     eventBooking.ID,
				Guests: eventBooking.Guests,
				Event: EventDetails{
					ID:        event.ID,
					EventName: event.EventName,
					Location:  event.Location,
					Image:     images,
				},
			}

			profile.EventBookings = append(profile.EventBookings, eventBookingDetails)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(profile); err != nil {
			http.Error(w, "Error encoding response", http.StatusInternalServerError)
			return
		}
	}
}

// GetUserReviewsHandler retrieves reviews made by the user
// @Summary Get user reviews
// @Description Retrieve all reviews submitted by the user
// @Tags users
// @Produce json
// @Success 200 {array} UserReviewDetails "User reviews"
// @Failure 401 {object} map[string]string "User not authenticated"
// @Failure 500 {object} map[string]string "Server error"
// @Router /users/reviews [get]
func GetUserReviewsHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, err := getSession(r, "session")
		if err != nil {
			http.Error(w, "Error retrieving session", http.StatusInternalServerError)
			return
		}

		userID, ok := session.Values["user_id"].(uint)
		if !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "User not authenticated"})
			return
		}

		var reviews []models.Review
		// Get reviews for the current user, ordered by newest first
		if result := db.Where("user_id = ?", userID).Order("id desc").Find(&reviews); result.Error != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Error fetching user reviews"})
			return
		}

		userReviews := make([]UserReviewDetails, 0, len(reviews))
		for _, review := range reviews {
			var accommodation models.Accommodation
			if result := db.First(&accommodation, review.AccommodationID); result.Error != nil {
				// Skip this review if we can't find its accommodation
				continue
			}

			userReviews = append(userReviews, UserReviewDetails{
				AccommodationName: accommodation.Name,
				ReviewText:        review.Comment,
				ReviewRating:      review.Rating,
				ReviewDate:        review.Date,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(userReviews); err != nil {
			http.Error(w, "Error encoding response", http.StatusInternalServerError)
			return
		}
	}
}

// UpdateUserAvatarHandler updates the user's avatar
// @Summary Update user avatar
// @Description Change the user's avatar image by setting a new avatar ID
// @Tags users
// @Accept json
// @Produce json
// @Param avatar body UpdateAvatarRequest true "New avatar ID"
// @Success 200 {object} map[string]string "Avatar updated successfully"
// @Failure 400 {object} map[string]string "Invalid request format"
// @Failure 401 {object} map[string]string "User not authenticated"
// @Failure 500 {object} map[string]string "Failed to update avatar"
// @Router /users/avatar [put]
func UpdateUserAvatarHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the current user from the session
		session, err := getSession(r, "session")
		if err != nil {
			http.Error(w, "Error retrieving session", http.StatusInternalServerError)
			return
		}

		userID, ok := session.Values["user_id"].(uint)
		if !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "User not authenticated"})
			return
		}

		var updateRequest UpdateAvatarRequest
		if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request format"})
			return
		}

		// Update the avatar_id in the database
		if result := db.Model(&models.User{}).Where("id = ?", userID).Update("avatar_id", updateRequest.AvatarID); result.Error != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Failed to update avatar"})
			return
		}

		// Return success response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Avatar updated successfully"})
	}
}
