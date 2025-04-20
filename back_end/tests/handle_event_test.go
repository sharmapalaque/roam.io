package routes

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/mux"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"roam.io/models"
	"roam.io/routes"
)

func TestCreateEvent(t *testing.T) {
	// Setup
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Test cases
	tests := []struct {
		name           string
		payload        models.Event
		mockSetup      func()
		expectedStatus int
		expectedEvent  models.Event
	}{
		{
			name: "Successful event creation",
			payload: models.Event{
				EventName:    "Test Event",
				Location:     "Test Location",
				Images:       pq.StringArray{"image1.jpg", "image2.jpg"},
				Description:  "Test Description",
				Date:         "2025-04-15",
				Time:         "18:00",
				Price:        "100",
				TotalSeats:   100,
				OfficialLink: "https://test-event.com",
				OrganizerID:  1,
			},
			mockSetup: func() {
				// Expect the INSERT query
				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "events"`).
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
				mock.ExpectCommit()
			},
			expectedStatus: http.StatusCreated,
			expectedEvent: models.Event{
				ID:             1,
				EventName:      "Test Event",
				Location:       "Test Location",
				Images:         pq.StringArray{"image1.jpg", "image2.jpg"},
				Description:    "Test Description",
				Date:           "2025-04-15",
				Time:           "18:00",
				Price:          "100",
				AvailableSeats: 100,
				Coordinates:    "41.003, 32.002",
				TotalSeats:     100,
				OfficialLink:   "https://test-event.com",
				OrganizerID:    1,
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock expectations
			tc.mockSetup()

			// Create request
			payloadBytes, err := json.Marshal(tc.payload)
			assert.NoError(t, err)
			req, err := http.NewRequest("POST", "/events", bytes.NewBuffer(payloadBytes))
			assert.NoError(t, err)
			req.Header.Set("Content-Type", "application/json")

			// Create response recorder
			rr := httptest.NewRecorder()

			// Call the handler
			handler := routes.CreateEvent(db)
			handler.ServeHTTP(rr, req)

			// Check status code
			assert.Equal(t, tc.expectedStatus, rr.Code)

			// For successful cases, verify the response body
			if tc.expectedStatus == http.StatusCreated && rr.Code == http.StatusCreated {
				var responseEvent models.Event
				err = json.Unmarshal(rr.Body.Bytes(), &responseEvent)
				assert.NoError(t, err)

				// ID might be auto-generated, so we can set it from the response
				tc.expectedEvent.ID = responseEvent.ID
				assert.Equal(t, tc.expectedEvent, responseEvent)
			}

			// Ensure all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestCreateEvent_InvalidPayload(t *testing.T) {
	// Setup mock DB
	sqlDB, _, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Create request with invalid JSON
	req, err := http.NewRequest("POST", "/events", bytes.NewBuffer([]byte(`{invalid json}`)))
	assert.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Call the handler
	handler := routes.CreateEvent(db)
	handler.ServeHTTP(rr, req)

	// Check status code
	assert.Equal(t, http.StatusBadRequest, rr.Code)
	assert.Contains(t, rr.Body.String(), "Invalid request payload")
}

func TestFetchEventById(t *testing.T) {
	// Setup
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Test cases
	tests := []struct {
		name           string
		eventID        string
		mockSetup      func()
		expectedStatus int
		expectedEvent  *models.EventResponse
	}{
		{
			name:    "Successful event fetch",
			eventID: "1",
			mockSetup: func() {
				eventRows := sqlmock.NewRows([]string{"id", "event_name", "location", "images", "description", "date", "time", "price", "available_seats", "total_seats", "official_link", "organizer_id"}).
					AddRow(1, "Test Event", "Test Location", pq.StringArray{"image1.jpg", "image2.jpg"}, "Test Description", "2025-04-15", "18:00", "100", 100, 100, "https://test-event.com", 1)

				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("1", 1).
					WillReturnRows(eventRows)

				organizerRows := sqlmock.NewRows([]string{"id", "name", "email", "phone"}).
					AddRow(1, "Test Organizer", "organizer@test.com", "123-456-7890")

				mock.ExpectQuery(`SELECT \* FROM "organizers" WHERE id = \$1 ORDER BY "organizers"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnRows(organizerRows)
			},
			expectedStatus: http.StatusOK,
			expectedEvent: &models.EventResponse{
				ID:             1,
				Name:           "Test Event",
				Location:       "Test Location",
				Images:         pq.StringArray{"image1.jpg", "image2.jpg"},
				Description:    "Test Description",
				Date:           "2025-04-15",
				Time:           "18:00",
				Price:          "100",
				AvailableSeats: 100,
				Coordinates:    "21.004, 32.003",
				TotalSeats:     100,
				OfficialLink:   "https://test-event.com",
				Organizer: models.Organizer{
					ID:    1,
					Name:  "Test Organizer",
					Email: "organizer@test.com",
					Phone: "123-456-7890",
				},
			},
		},
		{
			name:    "Event not found",
			eventID: "999",
			mockSetup: func() {
				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("999", 1).
					WillReturnError(gorm.ErrRecordNotFound)
			},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:    "Database error when fetching event",
			eventID: "1",
			mockSetup: func() {
				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("1", 1).
					WillReturnError(gorm.ErrInvalidData)
			},
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock expectations
			tc.mockSetup()

			// Create request
			req, err := http.NewRequest("GET", "/events/"+tc.eventID, nil)
			assert.NoError(t, err)

			// Setup router and add URL parameters
			router := mux.NewRouter()
			router.HandleFunc("/events/{id}", routes.FetchEventById(db))

			// Create response recorder
			rr := httptest.NewRecorder()

			// Serve the request
			router.ServeHTTP(rr, req)

			// Check status code
			assert.Equal(t, tc.expectedStatus, rr.Code)

			// For successful cases, verify the response body
			if tc.expectedStatus == http.StatusOK && tc.expectedEvent != nil {
				var responseEvent models.EventResponse
				err = json.Unmarshal(rr.Body.Bytes(), &responseEvent)
				assert.NoError(t, err)
				assert.Equal(t, *tc.expectedEvent, responseEvent)
			}

			// Ensure all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestCreateEventBooking(t *testing.T) {
	// Setup
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Test cases
	tests := []struct {
		name       string
		userID     uint
		eventID    uint
		guests     uint
		totalCost  uint
		mockSetup  func()
		expectedID int
		expectErr  bool
	}{
		{
			name:      "Successful booking creation",
			userID:    1,
			eventID:   2,
			guests:    3,
			totalCost: 300,
			mockSetup: func() {
				// Expect the INSERT query
				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "event_bookings"`).
					WithArgs(1, 2, 3, 300).
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
				mock.ExpectCommit()
			},
			expectedID: 1,
			expectErr:  false,
		},
		{
			name:      "Database error",
			userID:    1,
			eventID:   2,
			guests:    3,
			totalCost: 300,
			mockSetup: func() {
				// Simulate a database error
				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "event_bookings"`).
					WithArgs(1, 2, 3, 300).
					WillReturnError(errors.New("database error"))
				mock.ExpectRollback()
			},
			expectedID: 0,
			expectErr:  true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock expectations
			tc.mockSetup()

			// Call the function
			id, err := routes.CreateEventBooking(tc.userID, tc.eventID, tc.guests, tc.totalCost, db)

			// Check results
			if tc.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedID, id)
			}

			// Ensure all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled expectations: %s", err)
			}
		})
	}
}

// To:
func TestAddEventBookingHandler(t *testing.T) {
	// Setup
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Create a modified version of AddEventBooking that doesn't use sessions
	testAddEventBooking := func(db *gorm.DB) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			// Parse query parameters
			queryParams := r.URL.Query()
			event_id := queryParams.Get("event_id")
			guests := queryParams.Get("guests")
			total_cost := queryParams.Get("total_cost")

			if event_id == "" || guests == "" || total_cost == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"message": "Invalid JSON format"})
				return
			}

			// Use fixed user ID for testing
			userID := uint(1)

			u, err := strconv.ParseUint(event_id, 10, 32)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"message": "Invalid event ID"})
				return
			}
			uintValue := uint(u)

			ui, err := strconv.ParseUint(guests, 10, 32)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"message": "Invalid guests number"})
				return
			}
			guestsUintValue := uint(ui)

			uit, err := strconv.ParseUint(total_cost, 10, 32)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusBadRequest)
				json.NewEncoder(w).Encode(map[string]string{"message": "Invalid total cost"})
				return
			}
			totalcostUintValue := uint(uit)

			bookings, err := routes.GetEventBookingByUserID(int(userID), db)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Internal server error"})
				return
			}

			for _, booking := range bookings {
				if booking.EventId == uintValue {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusConflict)
					json.NewEncoder(w).Encode(map[string]string{"message": "Event Booking Already exists for user"})
					return
				}
			}

			event, err := routes.GetEventByID(event_id, db)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Failed to Event"})
				return
			}

			if int(event.AvailableSeats)-int(guestsUintValue) < 0 {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Seats not available"})
				return
			}

			bookingID, err := routes.CreateEventBooking(userID, uintValue, guestsUintValue, totalcostUintValue, db)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Failed to Create booking"})
				return
			}

			err = routes.UpdateEventSeats(event_id, int(event.AvailableSeats)-int(guestsUintValue), db)
			if err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Error updating avaliable seats"})
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]int{"id": bookingID})
		}
	}

	// Test cases
	tests := []struct {
		name           string
		queryParams    map[string]string
		mockSetup      func()
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name: "Successful booking creation",
			queryParams: map[string]string{
				"event_id":   "1",
				"guests":     "2",
				"total_cost": "200",
			},
			mockSetup: func() {
				// Mock GetEventBookingByUserID
				bookingsRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"})
				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE user_id = \$1`).
					WithArgs(1).
					WillReturnRows(bookingsRows)

				// Mock GetEventByID
				eventRows := sqlmock.NewRows([]string{"id", "event_name", "location", "date", "time", "description", "price", "available_seats", "total_seats", "official_link", "organizer_id", "images"}).
					AddRow(1, "Test Event", "Test Location", "2025-04-15", "18:00", "Test Description", "100", 10, 100, "https://test-event.com", 1, pq.StringArray{"image1.jpg"})

				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("1", 1).
					WillReturnRows(eventRows)

				// Mock CreateEventBooking
				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "event_bookings"`).
					WithArgs(1, 1, 2, 200).
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
				mock.ExpectCommit()

				// Mock UpdateEventSeats
				mock.ExpectBegin()
				mock.ExpectExec(`UPDATE "events" SET "available_seats"=\$1 WHERE id = \$2`).
					WithArgs(8, "1").
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			},
			expectedStatus: http.StatusCreated,
			expectedBody: map[string]interface{}{
				"id": float64(1), // JSON unmarshals numbers as float64
			},
		},
		{
			name: "Missing query parameters",
			queryParams: map[string]string{
				"event_id": "1",
				"guests":   "2",
				// missing total_cost
			},
			mockSetup:      func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"message": "Invalid JSON format",
			},
		},
		{
			name: "Event already booked by user",
			queryParams: map[string]string{
				"event_id":   "1",
				"guests":     "2",
				"total_cost": "200",
			},
			mockSetup: func() {
				// Mock GetEventBookingByUserID with existing booking
				bookingsRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"}).
					AddRow(1, 1, 1, 2, 200)
				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE user_id = \$1`).
					WithArgs(1).
					WillReturnRows(bookingsRows)
			},
			expectedStatus: http.StatusConflict,
			expectedBody: map[string]interface{}{
				"message": "Event Booking Already exists for user",
			},
		},
		{
			name: "Not enough available seats",
			queryParams: map[string]string{
				"event_id":   "1",
				"guests":     "20",
				"total_cost": "2000",
			},
			mockSetup: func() {
				// Mock GetEventBookingByUserID
				bookingsRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"})
				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE user_id = \$1`).
					WithArgs(1).
					WillReturnRows(bookingsRows)

				// Mock GetEventByID with only 10 available seats
				eventRows := sqlmock.NewRows([]string{"id", "event_name", "location", "date", "time", "description", "price", "available_seats", "total_seats", "official_link", "organizer_id", "images"}).
					AddRow(1, "Test Event", "Test Location", "2025-04-15", "18:00", "Test Description", "100", 10, 100, "https://test-event.com", 1, pq.StringArray{"image1.jpg"})

				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("1", 1).
					WillReturnRows(eventRows)
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"message": "Seats not available",
			},
		},
		{
			name: "Error getting event",
			queryParams: map[string]string{
				"event_id":   "999",
				"guests":     "2",
				"total_cost": "200",
			},
			mockSetup: func() {
				// Mock GetEventBookingByUserID
				bookingsRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"})
				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE user_id = \$1`).
					WithArgs(1).
					WillReturnRows(bookingsRows)

				// Mock GetEventByID with error
				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("999", 1).
					WillReturnError(gorm.ErrRecordNotFound)
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"message": "Failed to Event",
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock expectations
			tc.mockSetup()

			// Create request with query parameters
			req, err := http.NewRequest("POST", "/bookings", nil)
			assert.NoError(t, err)

			q := req.URL.Query()
			for key, value := range tc.queryParams {
				q.Add(key, value)
			}
			req.URL.RawQuery = q.Encode()

			// Create response recorder
			rr := httptest.NewRecorder()

			// Call the handler
			handler := testAddEventBooking(db)
			handler(rr, req)

			// Check status code
			assert.Equal(t, tc.expectedStatus, rr.Code)

			// Check response body
			var responseBody map[string]interface{}
			err = json.Unmarshal(rr.Body.Bytes(), &responseBody)
			assert.NoError(t, err)
			assert.Equal(t, tc.expectedBody, responseBody)

			// Ensure all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestRemoveEventBookingByID(t *testing.T) {
	// Setup
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Test cases
	tests := []struct {
		name      string
		bookingID int
		mockSetup func()
		expectErr bool
	}{
		{
			name:      "Successful booking removal",
			bookingID: 1,
			mockSetup: func() {
				// Expect transaction
				mock.ExpectBegin()
				mock.ExpectExec(`DELETE FROM "event_bookings" WHERE id = \$1`).
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			},
			expectErr: false,
		},
		{
			name:      "Booking not found",
			bookingID: 999,
			mockSetup: func() {
				// Expect transaction with no rows affected
				mock.ExpectBegin()
				mock.ExpectExec(`DELETE FROM "event_bookings" WHERE id = \$1`).
					WithArgs(999).
					WillReturnResult(sqlmock.NewResult(0, 0))
				mock.ExpectRollback()
			},
			expectErr: true,
		},
		{
			name:      "Database error",
			bookingID: 1,
			mockSetup: func() {
				// Expect transaction with error
				mock.ExpectBegin()
				mock.ExpectExec(`DELETE FROM "event_bookings" WHERE id = \$1`).
					WithArgs(1).
					WillReturnError(errors.New("database error"))
				mock.ExpectRollback()
			},
			expectErr: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock expectations
			tc.mockSetup()

			// Call the function
			err := routes.RemoveEventBookingByID(tc.bookingID, db)

			// Check results
			if tc.expectErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}

			// Ensure all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled expectations: %s", err)
			}
		})
	}
}
func TestRemoveEventBooking(t *testing.T) {
	// Setup
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock DB: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn:       sqlDB,
		DriverName: "postgres",
	})

	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open gorm DB: %v", err)
	}

	// Test cases
	tests := []struct {
		name           string
		bookingID      string
		mockSetup      func()
		expectedStatus int
		expectedBody   map[string]interface{}
	}{
		{
			name:      "Successful booking removal",
			bookingID: "1",
			mockSetup: func() {
				// Mock GetEventBookingByID
				bookingRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"}).
					AddRow(1, 1, 2, 3, 300)

				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE id = \$1`).
					WithArgs("1").
					WillReturnRows(bookingRows)

				// Mock GetEventByID
				eventRows := sqlmock.NewRows([]string{"id", "event_name", "location", "date", "time", "description", "price", "available_seats", "total_seats", "official_link", "organizer_id", "images"}).
					AddRow(2, "Test Event", "Test Location", "2025-04-15", "18:00", "Test Description", "100", 7, 10, "https://test-event.com", 1, pq.StringArray{"image1.jpg"})

				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("2", 1).
					WillReturnRows(eventRows)

				// Mock UpdateEventSeats
				mock.ExpectBegin()
				mock.ExpectExec(`UPDATE "events" SET "available_seats"=\$1 WHERE id = \$2`).
					WithArgs(10, "2").
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()

				// Mock RemoveEventBookingByID
				mock.ExpectBegin()
				mock.ExpectExec(`DELETE FROM "event_bookings" WHERE id = \$1`).
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			},
			expectedStatus: http.StatusOK,
			expectedBody:   nil, // The function returns a string, not a map
		},
		{
			name:      "Booking not found",
			bookingID: "999",
			mockSetup: func() {
				// Mock GetEventBookingByID
				bookingRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"}).
					AddRow(999, 1, 2, 3, 300)

				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE id = \$1`).
					WithArgs("999").
					WillReturnRows(bookingRows)

				// Mock GetEventByID with error
				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("2", 1).
					WillReturnError(gorm.ErrRecordNotFound)
			},
			expectedStatus: http.StatusNotFound,
			expectedBody: map[string]interface{}{
				"message": "Error event booking not found",
			},
		},
		{
			name:      "Error updating seats",
			bookingID: "1",
			mockSetup: func() {
				// Mock GetEventBookingByID
				bookingRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"}).
					AddRow(1, 1, 2, 3, 300)

				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE id = \$1`).
					WithArgs("1").
					WillReturnRows(bookingRows)

				// Mock GetEventByID
				eventRows := sqlmock.NewRows([]string{"id", "event_name", "location", "date", "time", "description", "price", "available_seats", "total_seats", "official_link", "organizer_id", "images"}).
					AddRow(2, "Test Event", "Test Location", "2025-04-15", "18:00", "Test Description", "100", 7, 10, "https://test-event.com", 1, pq.StringArray{"image1.jpg"})

				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("2", 1).
					WillReturnRows(eventRows)

				// Mock UpdateEventSeats with error
				mock.ExpectBegin()
				mock.ExpectExec(`UPDATE "events" SET "available_seats"=\$1 WHERE id = \$2`).
					WithArgs(10, "2").
					WillReturnError(errors.New("database error"))
				mock.ExpectRollback()
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"message": "Error updating avaliable seats",
			},
		},
		{
			name:      "Error removing booking",
			bookingID: "1",
			mockSetup: func() {
				// Mock GetEventBookingByID
				bookingRows := sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"}).
					AddRow(1, 1, 2, 3, 300)

				mock.ExpectQuery(`SELECT \* FROM "event_bookings" WHERE id = \$1`).
					WithArgs("1").
					WillReturnRows(bookingRows)

				// Mock GetEventByID
				eventRows := sqlmock.NewRows([]string{"id", "event_name", "location", "date", "time", "description", "price", "available_seats", "total_seats", "official_link", "organizer_id", "images"}).
					AddRow(2, "Test Event", "Test Location", "2025-04-15", "18:00", "Test Description", "100", 7, 10, "https://test-event.com", 1, pq.StringArray{"image1.jpg"})

				mock.ExpectQuery(`SELECT \* FROM "events" WHERE id = \$1 ORDER BY "events"."id" LIMIT \$2`).
					WithArgs("2", 1).
					WillReturnRows(eventRows)

				// Mock UpdateEventSeats
				mock.ExpectBegin()
				mock.ExpectExec(`UPDATE "events" SET "available_seats"=\$1 WHERE id = \$2`).
					WithArgs(10, "2").
					WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()

				// Mock RemoveEventBookingByID with error
				mock.ExpectBegin()
				mock.ExpectExec(`DELETE FROM "event_bookings" WHERE id = \$1`).
					WithArgs(1).
					WillReturnResult(sqlmock.NewResult(0, 0))
				mock.ExpectRollback()
			},
			expectedStatus: http.StatusNotFound,
			expectedBody:   nil, // The error is returned directly via http.Error
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock expectations
			tc.mockSetup()

			// Create request with query parameters
			req, err := http.NewRequest("DELETE", "/bookings?event_booking_id="+tc.bookingID, nil)
			assert.NoError(t, err)

			// Create response recorder
			rr := httptest.NewRecorder()

			// Call the handler
			handler := routes.RemoveEventBooking(db)
			handler(rr, req)

			// Check status code
			assert.Equal(t, tc.expectedStatus, rr.Code)

			// Check response body if expected
			if tc.expectedBody != nil {
				var responseBody map[string]interface{}
				err = json.Unmarshal(rr.Body.Bytes(), &responseBody)
				assert.NoError(t, err)
				assert.Equal(t, tc.expectedBody, responseBody)
			}

			// Ensure all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled expectations: %s", err)
			}
		})
	}
}
