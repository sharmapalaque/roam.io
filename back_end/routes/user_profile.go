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
	AvatarURL     string                    `json:"avatar_url"`
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
			AvatarURL:     "https://example.com/avatars/default.png",
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
