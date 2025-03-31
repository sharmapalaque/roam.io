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

// addSessionToRequest sets a session value ("user_id") in the request using the session testing helpers.
func addSessionToRequest(req *http.Request, userID uint) *http.Request {
	// Create a session with the user ID
	session, _ := testStore.New(req, "session")
	session.Values["user_id"] = userID

	// Use the session testing helpers
	routes.SetStoreForTesting(testStore)
	routes.SetSessionForTesting(req, session)

	return req
}

func TestGetUserProfile_Unauthenticated(t *testing.T) {
	// Setup dummy DB (won't be used) and handler.
	db, _ := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	req := httptest.NewRequest("GET", "/profile", nil)
	// Note: Do not attach a session cookie.

	// For the unauthenticated test, setup an empty session
	session, _ := testStore.New(req, "session")
	routes.SetStoreForTesting(testStore)
	routes.SetSessionForTesting(req, session)

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
	// Setup mock DB and handler.
	db, mock := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	// Setup expectation: User ID 42 not found.
	userID := uint(42)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 ORDER BY "users"."id" LIMIT $2`)).
		WithArgs(userID, 1).
		WillReturnRows(sqlmock.NewRows(nil))

	// Create request with session
	req := httptest.NewRequest("GET", "/profile", nil)
	req = addSessionToRequest(req, userID)

	rr := httptest.NewRecorder()

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
}

func TestGetUserProfile_BookingsError(t *testing.T) {
	// Setup mock DB and handler.
	db, mock := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	// Setup expectations: User found, but error retrieving bookings.
	userID := uint(42)
	userRows := sqlmock.NewRows([]string{"id", "name", "email", "created_at", "updated_at", "deleted_at"}).
		AddRow(userID, "Test User", "test@example.com", time.Now(), time.Now(), nil)

	// Mock finding the user
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 ORDER BY "users"."id" LIMIT $2`)).
		WithArgs(userID, 1).
		WillReturnRows(userRows)

	// Mock error when retrieving bookings
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE user_id = $1`)).
		WithArgs(userID).
		WillReturnError(fmt.Errorf("database error"))

	// Create request with session
	req := httptest.NewRequest("GET", "/profile", nil)
	req = addSessionToRequest(req, userID)

	rr := httptest.NewRecorder()

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
}

func TestGetUserProfile_Success(t *testing.T) {
	// Setup mock DB and handler.
	db, mock := setupTestDB(t)
	handler := routes.GetUserProfileHandler(db)

	// Setup expectations: User and bookings found.
	userID := uint(42)
	userRows := sqlmock.NewRows([]string{"id", "name", "email", "created_at", "updated_at", "deleted_at"}).
		AddRow(userID, "Test User", "test@example.com", time.Now(), time.Now(), nil)

	// Mock finding the user
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "users" WHERE "users"."id" = $1 ORDER BY "users"."id" LIMIT $2`)).
		WithArgs(userID, 1).
		WillReturnRows(userRows)

	// Mock empty bookings result (success but no bookings)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "bookings" WHERE user_id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "accommodation_id", "check_in", "check_out", "total_price", "created_at", "updated_at", "deleted_at"}))

	// Mock empty event bookings
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "event_bookings" WHERE user_id = $1`)).
		WithArgs(userID).
		WillReturnRows(sqlmock.NewRows([]string{"id", "user_id", "event_id", "guests", "total_cost"}))

	// Create request with session
	req := httptest.NewRequest("GET", "/profile", nil)
	req = addSessionToRequest(req, userID)

	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, status)
	}

	var profile routes.UserProfile
	if err := json.Unmarshal(rr.Body.Bytes(), &profile); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	// Check user details are correct
	if profile.Name != "Test User" {
		t.Errorf("expected name %q, got %v", "Test User", profile.Name)
	}
	if profile.Email != "test@example.com" {
		t.Errorf("expected email %q, got %v", "test@example.com", profile.Email)
	}

	// Check bookings is an empty array
	if len(profile.Bookings) != 0 {
		t.Errorf("expected empty bookings, got %v", profile.Bookings)
	}

	// Check event bookings is an empty array
	if len(profile.EventBookings) != 0 {
		t.Errorf("expected empty event bookings, got %v", profile.EventBookings)
	}
}
