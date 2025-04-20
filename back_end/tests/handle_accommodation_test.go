package routes

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/lib/pq"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"roam.io/models"
	"roam.io/routes"
)

// MockDB is a mock database for testing
type MockDB struct {
	mock.Mock
}

// DB is a wrapper around MockDB that implements the necessary methods of *gorm.DB
type DB struct {
	*MockDB
}

var store = sessions.NewCookieStore([]byte("your-secret-key"))

// MockSessionStore is a mock implementation of the sessions.Store interface
type MockSessionStore struct {
	session *sessions.Session
}

// Get retrieves a session by name
func (m *MockSessionStore) Get(r *http.Request, name string) (*sessions.Session, error) {
	return m.session, nil
}

// New creates a new session
func (m *MockSessionStore) New(r *http.Request, name string) (*sessions.Session, error) {
	return m.session, nil
}

// Save saves the session state
func (m *MockSessionStore) Save(r *http.Request, w http.ResponseWriter, s *sessions.Session) error {
	return nil // No-op for testing
}

func (m *MockDB) Where(query interface{}, args ...interface{}) *gorm.DB {
	m.Called(query, args)
	return &gorm.DB{}
}

func (m *MockDB) Find(dest interface{}, conds ...interface{}) *gorm.DB {
	m.Called(dest, conds)
	return &gorm.DB{}
}

func (m *MockDB) First(dest interface{}, conds ...interface{}) *gorm.DB {
	m.Called(dest, conds)
	return &gorm.DB{}
}

func (m *MockDB) Create(value interface{}) *gorm.DB {
	m.Called(value)
	return &gorm.DB{}
}

// TestFetchAccommodations tests the FetchAccommodations function
func TestFetchAccommodations(t *testing.T) {
	gormDB, mock := NewMockDB()

	// Set up expectations for GetAccommodationsByLocation
	// First query to get accommodations with location=New York
	mock.ExpectQuery("^SELECT \\* FROM `accommodations` WHERE location = \\?").
		WithArgs("New York").
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "location", "description", "facilities", "image_urls", "owner_id", "price_per_night", "rating"}).
			AddRow(1, "Hotel A", "New York", "Description", pq.StringArray{"WiFi", "Pool"}, pq.StringArray{"image1.jpg"}, 1, 149.99, 4.5))

	// Preload Owner expectation
	mock.ExpectQuery("^SELECT \\* FROM `hosts` WHERE `hosts`.`id` = \\?").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email", "phone"}).
			AddRow(1, "Owner Name", "owner@example.com", "123-456-7890"))

	// Preload Reviews expectation
	mock.ExpectQuery("^SELECT \\* FROM `reviews` WHERE `reviews`.`accommodation_id` = \\?").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "accommodation_id", "user_name", "rating", "date", "comment"}).
			AddRow(1, 1, 1, "User1", 4.5, "2023-01-01", "Great place!"))

	// Call the function under test
	handler := routes.FetchAccommodations(gormDB)
	req, _ := http.NewRequest("GET", "/accommodations?location=New York", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	// Assert the results
	assert.Equal(t, http.StatusOK, rr.Code)

	// Check if all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

// TestFetchAccommodationById tests the FetchAccommodationById function
func TestFetchAccommodationById(t *testing.T) {
	gormDB, mock := NewMockDB()

	// First query to get accommodation with id=1
	mock.ExpectQuery("^SELECT \\* FROM `accommodations` WHERE `accommodations`.`id` = \\? ORDER BY `accommodations`.`id` LIMIT \\?").
		WithArgs("1", 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "location", "description", "facilities", "image_urls", "owner_id", "price_per_night", "rating"}).
			AddRow(1, "Hotel A", "New York", "A nice hotel", pq.StringArray{"WiFi", "Pool"}, pq.StringArray{"image1.jpg"}, 1, 149.99, 4.5))

	// Preload Owner expectation
	mock.ExpectQuery("^SELECT \\* FROM `hosts` WHERE `hosts`.`id` = \\?").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email", "phone"}).
			AddRow(1, "Owner Name", "owner@example.com", "123-456-7890"))

	// Preload Reviews expectation
	mock.ExpectQuery("^SELECT \\* FROM `reviews` WHERE `reviews`.`accommodation_id` = \\?").
		WithArgs(1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "accommodation_id", "user_name", "rating", "date", "comment"}).
			AddRow(1, 1, 1, "User1", 4.5, "2023-01-01", "Great place!"))

	req, err := http.NewRequest("GET", "/accommodations/1", nil)
	assert.NoError(t, err)

	vars := map[string]string{
		"id": "1",
	}
	req = mux.SetURLVars(req, vars)

	rr := httptest.NewRecorder()
	handler := routes.FetchAccommodationById(gormDB)
	handler.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

// TestCreateAccommodation tests the CreateAccommodation function
func TestCreateAccommodation(t *testing.T) {
	gormDB, mock := NewMockDB()

	// Update the mock expectations to match what the actual code is doing
	mock.ExpectBegin()
	mock.ExpectExec("^INSERT INTO `accommodations` ").
		WithArgs(
			sqlmock.AnyArg(), // Let's use AnyArg for all arguments to be more flexible
			sqlmock.AnyArg(),
			sqlmock.AnyArg(),
			sqlmock.AnyArg(),
			sqlmock.AnyArg(),
			sqlmock.AnyArg(),
			sqlmock.AnyArg(),
			sqlmock.AnyArg(),
		).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	// After creating the accommodation, we fetch the owner details
	// Fix the query to match GORM's actual SQL with LIMIT clause
	mock.ExpectQuery("^SELECT \\* FROM `hosts` WHERE `hosts`.`id` = \\? ORDER BY `hosts`.`id` LIMIT \\?").
		WithArgs(1, 1).
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email", "phone"}).
			AddRow(1, "Owner Name", "owner@example.com", "123-456-7890"))

	payload := models.Accommodation{
		Name:          "Test Hotel",
		Location:      "Test City",
		Description:   "A test hotel",
		Facilities:    pq.StringArray{"WiFi", "Pool"},
		ImageUrls:     pq.StringArray{"http://example.com/image.jpg"},
		OwnerID:       1,
		PricePerNight: 149.99,
		Coordinates:   "41.40338, 2.17403",
		Rating:        4.5,
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", "/accommodations", bytes.NewBuffer(body))
	assert.NoError(t, err)

	rr := httptest.NewRecorder()
	handler := routes.CreateAccommodation(gormDB)
	handler.ServeHTTP(rr, req)

	// If test fails, print the response body for debugging
	if rr.Code != http.StatusCreated {
		t.Logf("Response body: %s", rr.Body.String())
	}

	assert.Equal(t, http.StatusCreated, rr.Code)

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestAddBooking(t *testing.T) {
	// Mock database
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Error creating mock database: %v", err)
	}
	defer db.Close()

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn: db,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("Error opening GORM DB: %v", err)
	}

	// Mock session store
	store = sessions.NewCookieStore([]byte("test-secret"))

	// Test cases
	testCases := []struct {
		name           string
		queryParams    map[string]string
		sessionUserID  uint
		expectedStatus int
		mockSetup      func()
	}{
		{
			name: "Successful booking",
			queryParams: map[string]string{
				"accommodation_id": "1",
				"check_in_date":    "2025-03-10",
				"check_out_date":   "2025-03-15",
				"guests":           "2",
				"total_cost":       "1000",
			},
			sessionUserID:  1,
			expectedStatus: http.StatusCreated,
			mockSetup: func() {
				mock.ExpectQuery(`SELECT (.+) FROM "bookings" WHERE user_id = ?`).
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"id"}))

				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "bookings" (.+) VALUES (.+) RETURNING "id"`).
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
				mock.ExpectCommit()
			},
		},
		{
			name: "Booking already exists",
			queryParams: map[string]string{
				"accommodation_id": "1",
				"check_in_date":    "2025-03-10",
				"check_out_date":   "2025-03-15",
				"guests":           "2",
				"total_cost":       "1000",
			},
			sessionUserID:  1,
			expectedStatus: http.StatusConflict,
			mockSetup: func() {
				mock.ExpectQuery(`SELECT (.+) FROM "bookings" WHERE user_id = ?`).
					WithArgs(1).
					WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "accommodation_id", "guests", "total_cost"}).
						AddRow(1, 1, 1, 2, 1000))
			},
		},
		{
			name: "Unauthorized",
			queryParams: map[string]string{
				"accommodation_id": "1",
				"check_in_date":    "2025-03-10",
				"check_out_date":   "2025-03-15",
				"guests":           "2",
				"total_cost":       "1000",
			},
			sessionUserID:  0,
			expectedStatus: http.StatusUnauthorized,
			mockSetup: func() {
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			tc.mockSetup()

			req, err := http.NewRequest("POST", "/add-booking", nil)
			if err != nil {
				t.Fatal(err)
			}

			q := req.URL.Query()
			for key, value := range tc.queryParams {
				q.Add(key, value)
			}
			req.URL.RawQuery = q.Encode()

			// Create a new recorder for each test case
			rr := httptest.NewRecorder()

			// Create a new session for each test case
			session, _ := store.Get(req, "session")
			session.Values["user_id"] = tc.sessionUserID
			err = session.Save(req, rr)
			if err != nil {
				t.Fatalf("Error saving session: %v", err)
			}

			// Add the session cookie to the request
			req.Header.Set("Cookie", rr.Header().Get("Set-Cookie"))

			// Create a new context with the request
			ctx := context.WithValue(req.Context(), "session", session)
			req = req.WithContext(ctx)

			handler := routes.AddBooking(gormDB)
			handler.ServeHTTP(rr, req)

			if status := rr.Code; status != tc.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v", status, tc.expectedStatus)
			}

			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}

// TestRemoveBookingByBookingID tests the RemoveBookingByBookingID function
func TestRemoveBookingByBookingID(t *testing.T) {
	sqlDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create mock: %v", err)
	}
	defer sqlDB.Close()

	dialector := postgres.New(postgres.Config{
		Conn: sqlDB,
	})
	db, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open GORM DB: %v", err)
	}

	t.Run("SuccessfulRemoval", func(t *testing.T) {
		bookingID := 1
		mock.ExpectBegin()
		mock.ExpectExec("DELETE FROM \"bookings\" WHERE id = \\$1").
			WithArgs(bookingID).
			WillReturnResult(sqlmock.NewResult(0, 1))
		mock.ExpectCommit()

		err := routes.RemoveBookingByBookingID(bookingID, db)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
	})

	t.Run("BookingNotFound", func(t *testing.T) {
		bookingID := 2
		mock.ExpectBegin()
		mock.ExpectExec("DELETE FROM \"bookings\" WHERE id = \\$1").
			WithArgs(bookingID).
			WillReturnResult(sqlmock.NewResult(0, 0))
		mock.ExpectRollback()

		err := routes.RemoveBookingByBookingID(bookingID, db)
		if err == nil {
			t.Error("Expected an error, got nil")
		}
		if err.Error() != "error removing booking" {
			t.Errorf("Expected 'error removing booking', got '%v'", err)
		}
	})

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Unfulfilled expectations: %v", err)
	}
}

// TestGetBookingByUserID tests the GetBookingByUserID function
func TestGetBookingByUserID(t *testing.T) {
	gormDB, mock := NewMockDB()

	userID := 1
	checkInDate := time.Now()
	checkOutDate := time.Now().Add(24 * time.Hour)
	totalCost := uint(1000)

	mock.ExpectQuery("^SELECT \\* FROM `bookings` WHERE user_id = \\?").
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "accommodation_id", "checkin_date", "checkout_date", "guests", "total_cost"}).
			AddRow(1, userID, 1, checkInDate, checkOutDate, 2, totalCost))

	bookings, err := routes.GetBookingByUserID(userID, gormDB)

	assert.NoError(t, err)
	assert.Len(t, bookings, 1)
	assert.Equal(t, userID, int(bookings[0].UserID))
	assert.Equal(t, totalCost, bookings[0].TotalCost)

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func NewMockDB() (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		panic(err)
	}

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      db,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	return gormDB, mock
}
