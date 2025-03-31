package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"gorm.io/gorm"
	"roam.io/models"
)

func FetchEvents(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		{
			queryParams := r.URL.Query()
			location := queryParams.Get("location")
			events, err := GetEventsByLocation(location, db)
			var response []models.EventResponse
			for _, event := range events {
				organizer, _ := GetOrganizerByID(event.OrganizerID, db)
				currEvent := models.EventResponse{ID: event.ID, Name: event.EventName, Location: event.Location, Images: pq.StringArray(event.Images), Description: event.Description, Date: event.Date, Time: event.Time, Price: event.Price, AvailableSeats: event.AvailableSeats, TotalSeats: event.TotalSeats, OfficialLink: event.OfficialLink, Organizer: *organizer}
				response = append(response, currEvent)
			}
			if err != nil {
				http.Error(w, "Failed to fetch accommodations", http.StatusInternalServerError)
				fmt.Println(err)
				return
			}
			// Return response with the new user ID
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(response)
		}
	}
}

func FetchEventById(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		event_id, exists := vars["id"]
		if event_id != "" || exists {
			result, err := GetEventByID(event_id, db)
			if err != nil {
				if err == gorm.ErrRecordNotFound {
					http.Error(w, "Event not Found", http.StatusNotFound)
					return
				}
				http.Error(w, "Failed to fetch event", http.StatusInternalServerError)
				fmt.Println(err)
				return
			}
			organizer, err := GetOrganizerByID(result.OrganizerID, db)
			event := models.EventResponse{ID: result.ID, Name: result.EventName, Location: result.Location, Images: pq.StringArray(result.Images), Description: result.Description, Date: result.Date, Time: result.Time, Price: result.Price, AvailableSeats: result.AvailableSeats, TotalSeats: result.TotalSeats, OfficialLink: result.OfficialLink, Organizer: *organizer}
			// Return response with the new user ID
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(event)
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
		}
	}

}

func CreateEvent(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse the JSON body
		var payload models.Event
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			fmt.Println(err)
			return
		}
		event := models.Event{EventName: payload.EventName, Location: payload.Location, Images: pq.StringArray(payload.Images), Description: payload.Description, Date: payload.Date, Time: payload.Time, Price: payload.Price, AvailableSeats: payload.TotalSeats, TotalSeats: payload.TotalSeats, OfficialLink: payload.OfficialLink, OrganizerID: payload.OrganizerID}
		result := db.Create(&event)
		if result.Error != nil {
			fmt.Println(result.Error)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(event)
	}
}

// func AddBooking(db *gorm.DB) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		// Parse the JSON body
// 		queryParams := r.URL.Query()
// 		accommodation_id := queryParams.Get("accommodation_id")
// 		checking_date := queryParams.Get("check_in_date")
// 		checkout_date := queryParams.Get("check_out_date")
// 		guests := queryParams.Get("guests")
// 		total_cost := queryParams.Get("total_cost")
// 		layout := "2006-01-02" // Date format (YYYY-MM-DD)
// 		if accommodation_id == "" || checking_date == "" || checkout_date == "" || guests == "" || total_cost == "" {
// 			w.Header().Set("Content-Type", "application/json")
// 			w.WriteHeader(http.StatusBadRequest)
// 			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid JSON format:"})
// 			return
// 		}
// 		// Convert string to time.Time
// 		checkInDate, err := time.Parse(layout, checking_date)
// 		if err != nil {
// 			fmt.Println("Error parsing date:", err)
// 			return
// 		}

// 		// Convert string to time.Time
// 		checkOutDate, err := time.Parse(layout, checkout_date)
// 		if err != nil {
// 			fmt.Println("Error parsing date:", err)
// 			return
// 		}
// 		// accommodation, err := GetAccommodationsByID(accommodation_id, db)
// 		// if err != nil {
// 		// 	http.Error(w, "Failed to fetch accommodation", http.StatusInternalServerError)
// 		// 	fmt.Println(err)
// 		// 	return
// 		// }

// 		session, _ := store.Get(r, "session")

// 		// Get user ID from session
// 		userID, ok := session.Values["user_id"].(uint)
// 		fmt.Print("USER ID: ")
// 		fmt.Println(userID)
// 		if !ok || userID == 0 {
// 			w.Header().Set("Content-Type", "application/json")
// 			w.WriteHeader(http.StatusUnauthorized)
// 			json.NewEncoder(w).Encode(map[string]string{"message": "Unauthorized, no session found"})
// 			return
// 		}
// 		u, err := strconv.ParseUint(accommodation_id, 10, 32) // base 10, uint32 max bits
// 		if err != nil {
// 			fmt.Println("Error:", err)
// 			return
// 		}

// 		uintValue := uint(u)
// 		ui, err := strconv.ParseUint(guests, 10, 32) // base 10, uint32 max bits
// 		if err != nil {
// 			fmt.Println("Error:", err)
// 			return
// 		}
// 		guestsUintValue := uint(ui)

// 		uit, err := strconv.ParseUint(total_cost, 10, 32) // base 10, uint32 max bits
// 		if err != nil {
// 			fmt.Println("Error:", err)
// 			return
// 		}
// 		totalcostUintValue := uint(uit)
// 		bookings, err := GetBookingByUserID(int(userID), db)
// 		if err != nil {
// 			w.Header().Set("Content-Type", "application/json")
// 			w.WriteHeader(http.StatusInternalServerError)
// 			json.NewEncoder(w).Encode(map[string]string{"message": "Internal server error"})
// 			fmt.Println(err)
// 			return
// 		}

// 		for _, booking := range bookings {
// 			if booking.AccommodationID == uintValue {
// 				w.Header().Set("Content-Type", "application/json")
// 				w.WriteHeader(http.StatusConflict)
// 				json.NewEncoder(w).Encode(map[string]string{"message": "Booking Already exists for user"})
// 				return
// 			}
// 		}

// 		bookingID, err := CreateBooking(userID, uintValue, checkInDate, checkOutDate, guestsUintValue, totalcostUintValue, db)
// 		if err != nil {
// 			w.Header().Set("Content-Type", "application/json")
// 			w.WriteHeader(http.StatusInternalServerError)
// 			json.NewEncoder(w).Encode(map[string]string{"message": "Failed to Create booking"})
// 			fmt.Println(err)
// 			return
// 		}

// 		w.Header().Set("Content-Type", "application/json")
// 		w.WriteHeader(http.StatusCreated)
// 		json.NewEncoder(w).Encode(map[string]int{"id": bookingID})
// 	}
// }

// func CreateBooking(userID, accommodationID uint, checkinDate, checkoutDate time.Time, guests uint, total_cost uint, db *gorm.DB) (id int, err error) {
// 	booking := models.Booking{UserID: userID, AccommodationID: accommodationID, CheckinDate: checkinDate, CheckoutDate: checkoutDate, Guests: guests, TotalCost: total_cost}
// 	result := db.Create(&booking)
// 	if result.Error != nil {
// 		return 0, result.Error
// 	} else {
// 		fmt.Println("Booking created successfully:", booking)
// 		return int(booking.ID), nil
// 	}
// }

// func GetBookingByUserID(userID int, db *gorm.DB) ([]models.Booking, error) {
// 	bookings := []models.Booking{}
// 	result := db.Where("user_id = ?", userID).Find(&bookings)
// 	if result.Error != nil {
// 		return nil, result.Error
// 	} else {
// 		return bookings, nil
// 	}
// }

func GetEventByID(event_id string, db *gorm.DB) (*models.Event, error) {
	var event models.Event
	result := db.Where("id = ?", event_id).First(&event)
	if result.Error != nil {
		return nil, result.Error
	} else {
		return &event, nil
	}
}

func GetOrganizerByID(organizer_id uint, db *gorm.DB) (*models.Organizer, error) {
	var organizer models.Organizer
	result := db.Where("id = ?", organizer_id).First(&organizer)
	if result.Error != nil {
		return nil, result.Error
	} else {
		return &organizer, nil
	}
}

func GetEventsByLocation(location string, db *gorm.DB) ([]models.Event, error) {
	var events []models.Event
	var result *gorm.DB
	if location == "" {
		result = db.Find(&events)
	} else {
		result = db.Where("location = ?", location).Find(&events)
	}
	if result.Error != nil {
		return nil, result.Error
	} else {
		return events, nil
	}
}

// func RemoveBookingByBookingID(bookingID int, db *gorm.DB) error {
// 	tx := db.Begin()
// 	defer func() {
// 		if r := recover(); r != nil {
// 			tx.Rollback()
// 		}
// 	}()

// 	result := tx.Where("booking_id = ?", bookingID).Delete(&models.Booking{})

// 	if result.Error != nil {
// 		tx.Rollback()
// 		return result.Error
// 	}

// 	if result.RowsAffected == 0 {
// 		tx.Rollback()
// 		return errors.New("error removing booking")
// 	}

// 	return tx.Commit().Error

// }

// func RemoveBooking(db *gorm.DB) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		// Parse the JSON body
// 		queryParams := r.URL.Query()
// 		booking_id := queryParams.Get("booking_id")

// 		u, err := strconv.ParseUint(booking_id, 10, 32) // base 10, uint32 max bits
// 		if err != nil {
// 			fmt.Println("Error:", err)
// 			return
// 		}

// 		uintValue := uint(u)

// 		err = RemoveBookingByBookingID(int(uintValue), db)
// 		if err != nil {
// 			http.Error(w, "Booking not found", http.StatusNotFound)
// 			return
// 		}

// 		w.Header().Set("Content-Type", "text/plain")
// 		w.WriteHeader(http.StatusOK)
// 		json.NewEncoder(w).Encode("Booking removed")
// 	}
// }
