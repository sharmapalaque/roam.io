package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/sessions"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"roam.io/routes"
)

var testStore = sessions.NewCookieStore([]byte("test-secret"))

func setupTestDB(t *testing.T) (*gorm.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock database: %v", err)
	}
	dialector := postgres.New(postgres.Config{
		Conn:                 db,
		PreferSimpleProtocol: true,
	})
	gormDB, err := gorm.Open(dialector, &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open gorm DB: %v", err)
	}
	return gormDB, mock
}

// addSessionToRequest sets a session value ("user_id") in the request.
func addSessionToRequest(req *http.Request, userID uint) *http.Request {
	session, _ := testStore.Get(req, "session")
	session.Values["user_id"] = userID
	// Save session in a temporary recorder to capture the cookie.
	rr := httptest.NewRecorder()
	session.Save(req, rr)
	// Add any returned cookie(s) to the request.
	for _, cookie := range rr.Result().Cookies() {
		req.AddCookie(cookie)
	}
	return req
}

func TestGetUserProfile_Unauthenticated(t *testing.T) {
	// Setup dummy DB (won't be used) and handler.
	db, _ := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	req := httptest.NewRequest("GET", "/profile", nil)
	// Note: Do not attach a session cookie.
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, status)
	}

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "User not authenticated" {
		t.Errorf("unexpected message: %v", resp)
	}
}

func TestGetUserProfile_UserNotFound(t *testing.T) {
	db, mock := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	req := httptest.NewRequest("GET", "/profile", nil)
	req = addSessionToRequest(req, 1) // Set user_id = 1 in session.
	rr := httptest.NewRecorder()

	// Update the expected query to match GORM's SQL with both arguments
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 ORDER BY "users"."id" LIMIT $2`)).
		WithArgs(1, 1). // Add LIMIT argument
		WillReturnRows(sqlmock.NewRows([]string{"id", "name", "email"}))

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusNotFound {
		t.Errorf("expected status %d, got %d", http.StatusNotFound, status)
	}

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "User not found" {
		t.Errorf("unexpected message: %v", resp)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}

func TestGetUserProfile_BookingsError(t *testing.T) {
	db, mock := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	req := httptest.NewRequest("GET", "/profile", nil)
	req = addSessionToRequest(req, 1)
	rr := httptest.NewRecorder()

	// Expect a query for user data.
	userRows := sqlmock.NewRows([]string{"id", "name", "email"}).
		AddRow(1, "Test User", "test@example.com")
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 ORDER BY "users"."id" LIMIT $2`)).
		WithArgs(1, 1). // Add LIMIT argument
		WillReturnRows(userRows)
	// Expect a query for bookings to return an error.
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE user_id = $1`)).
		WithArgs(1).
		WillReturnError(fmt.Errorf("db error"))

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, status)
	}

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Error fetching user bookings" {
		t.Errorf("unexpected message: %v", resp)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}

func TestGetUserProfile_Success(t *testing.T) {
	db, mock := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	req := httptest.NewRequest("GET", "/profile", nil)
	req = addSessionToRequest(req, 1)
	rr := httptest.NewRecorder()

	// Expect a query for user.
	userRows := sqlmock.NewRows([]string{"id", "name", "email"}).
		AddRow(1, "Test User", "test@example.com")
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 ORDER BY "users"."id" LIMIT $2`)).
		WithArgs(1, 1). // Add LIMIT argument
		WillReturnRows(userRows)

	// Expect a query for bookings.
	bookingRows := sqlmock.NewRows([]string{"id", "checkin_date", "checkout_date", "guests", "accommodation_id"}).
		AddRow(10, time.Now(), time.Now().Add(48*time.Hour), 2, 100)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE user_id = $1`)).
		WithArgs(1).
		WillReturnRows(bookingRows)

	// Expect a query for accommodation details.
	accomRows := sqlmock.NewRows([]string{"id", "name", "location", "image_urls"}).
		AddRow(100, "Ocean View Apartment", "Miami, FL", `{"https://example.com/accom.png"}`)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "accommodations" WHERE "accommodations"."id" = $1 ORDER BY "accommodations"."id" LIMIT $2`)).
		WithArgs(100, 1). // Add LIMIT argument
		WillReturnRows(accomRows)

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, status)
	}

	var profile routes.UserProfile
	if err := json.Unmarshal(rr.Body.Bytes(), &profile); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if profile.Name != "Test User" || profile.Email != "test@example.com" {
		t.Errorf("unexpected user data: %+v", profile)
	}
	if len(profile.Bookings) != 1 {
		t.Errorf("expected 1 booking, got %d", len(profile.Bookings))
	} else {
		booking := profile.Bookings[0]
		if booking.ID != 10 {
			t.Errorf("unexpected booking ID: %d", booking.ID)
		}
		if booking.Accommodation.ID != 100 {
			t.Errorf("unexpected accommodation ID: %d", booking.Accommodation.ID)
		}
		if booking.Accommodation.Name != "Ocean View Apartment" {
			t.Errorf("unexpected accommodation name: %s", booking.Accommodation.Name)
		}
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unfulfilled expectations: %s", err)
	}
}
