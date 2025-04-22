package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
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

func TestGetUserReviews_Unauthenticated(t *testing.T) {
	// Setup dummy DB and handler
	db, _ := setupTestDB(t)
	handler := routes.GetUserReviewsHandler(db)

	req := httptest.NewRequest("GET", "/users/reviews", nil)
	// Setup an empty session
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

func TestGetUserReviews_FetchError(t *testing.T) {
	// Setup mock DB and handler
	db, mock := setupTestDB(t)
	handler := routes.GetUserReviewsHandler(db)

	// Setup expectation: Error when fetching reviews
	userID := uint(42)
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "reviews" WHERE user_id = $1 ORDER BY id desc`)).
		WithArgs(userID).
		WillReturnError(fmt.Errorf("database error"))

	// Create request with session
	req := httptest.NewRequest("GET", "/users/reviews", nil)
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
	if msg, ok := resp["message"]; !ok || msg != "Error fetching user reviews" {
		t.Errorf("unexpected message: %v", resp)
	}
}

func TestGetUserReviews_Success(t *testing.T) {
	// Setup mock DB and handler
	db, mock := setupTestDB(t)
	handler := routes.GetUserReviewsHandler(db)

	// Setup expectations: User has reviews
	userID := uint(42)

	// Mock review records
	reviewDate := "2025-04-01"
	reviewRows := sqlmock.NewRows([]string{"id", "user_id", "accommodation_id", "user_name", "rating", "date", "comment"}).
		AddRow(1, userID, 100, "testuser", 4.5, reviewDate, "Great place!").
		AddRow(2, userID, 101, "testuser", 3.5, reviewDate, "Nice location")

	// Mock finding the reviews
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "reviews" WHERE user_id = $1 ORDER BY id desc`)).
		WithArgs(userID).
		WillReturnRows(reviewRows)

	// Mock finding the accommodations for each review
	accommodationRows1 := sqlmock.NewRows([]string{"id", "name", "location"}).
		AddRow(100, "Beach House", "Miami, FL")
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "accommodations" WHERE "accommodations"."id" = $1 ORDER BY "accommodations"."id" LIMIT $2`)).
		WithArgs(uint(100), 1).
		WillReturnRows(accommodationRows1)

	accommodationRows2 := sqlmock.NewRows([]string{"id", "name", "location"}).
		AddRow(101, "Mountain Cabin", "Denver, CO")
	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "accommodations" WHERE "accommodations"."id" = $1 ORDER BY "accommodations"."id" LIMIT $2`)).
		WithArgs(uint(101), 1).
		WillReturnRows(accommodationRows2)

	// Create request with session
	req := httptest.NewRequest("GET", "/users/reviews", nil)
	req = addSessionToRequest(req, userID)

	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, status)
	}

	var reviews []routes.UserReviewDetails
	if err := json.Unmarshal(rr.Body.Bytes(), &reviews); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}

	// Check that we got the expected number of reviews
	if len(reviews) != 2 {
		t.Errorf("expected 2 reviews, got %d", len(reviews))
	}

	// Check details of the first review
	if reviews[0].AccommodationName != "Beach House" {
		t.Errorf("expected accommodation name %q, got %q", "Beach House", reviews[0].AccommodationName)
	}
	if reviews[0].ReviewText != "Great place!" {
		t.Errorf("expected review text %q, got %q", "Great place!", reviews[0].ReviewText)
	}
	if reviews[0].ReviewRating != 4.5 {
		t.Errorf("expected rating %v, got %v", 4.5, reviews[0].ReviewRating)
	}
}

func TestUpdateUserAvatar_Unauthenticated(t *testing.T) {
	// Setup dummy DB and handler
	db, _ := setupTestDB(t)
	handler := routes.UpdateUserAvatarHandler(db)

	req := httptest.NewRequest("PUT", "/users/avatar", nil)
	// Setup an empty session
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

func TestUpdateUserAvatar_InvalidRequest(t *testing.T) {
	// Setup dummy DB and handler
	db, _ := setupTestDB(t)
	handler := routes.UpdateUserAvatarHandler(db)

	// Invalid JSON payload
	req := httptest.NewRequest("PUT", "/users/avatar", nil)
	req.Body = http.NoBody // Empty body, invalid request

	// Add session with user ID
	userID := uint(42)
	req = addSessionToRequest(req, userID)

	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, status)
	}

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Invalid request format" {
		t.Errorf("unexpected message: %v", resp)
	}
}

func TestUpdateUserAvatar_UpdateError(t *testing.T) {
	// Setup mock DB and handler
	db, mock := setupTestDB(t)
	handler := routes.UpdateUserAvatarHandler(db)

	// Setup expectation: Database error when updating
	userID := uint(42)

	// Use a more flexible mock pattern that will match any arguments
	mock.ExpectExec("UPDATE").
		WithArgs("Bluey", userID).
		WillReturnError(fmt.Errorf("database error"))

	// Create request with valid payload
	payload := `{"avatar_id": "Bluey"}`
	req := httptest.NewRequest("PUT", "/users/avatar", strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")

	// Add session with user ID
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
	if msg, ok := resp["message"]; !ok || msg != "Failed to update avatar" {
		t.Errorf("unexpected message: %v", resp)
	}
}

func TestUpdateUserAvatar_Success(t *testing.T) {
	// Setup mock DB and handler
	db, mock := setupTestDB(t)
	handler := routes.UpdateUserAvatarHandler(db)

	// Setup expectations: Avatar updated successfully within a transaction
	userID := uint(42)
	newAvatarID := "Marshmallow"

	mock.ExpectBegin() // Expect transaction start
	mock.ExpectExec(regexp.QuoteMeta(`UPDATE "users" SET "avatar_id"=$1 WHERE id = $2`)).
		WithArgs(newAvatarID, userID).            // Match specific arguments
		WillReturnResult(sqlmock.NewResult(1, 1)) // Expect 1 row affected
	mock.ExpectCommit() // Expect transaction commit

	// Create request with valid payload
	payload := fmt.Sprintf(`{"avatar_id": "%s"}`, newAvatarID)
	req := httptest.NewRequest("PUT", "/users/avatar", strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")

	// Add session with user ID
	req = addSessionToRequest(req, userID)

	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status %d, got %d. Body: %s", http.StatusOK, status, rr.Body.String())
	}

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to parse response: %v", err)
	}
	if msg, ok := resp["message"]; !ok || msg != "Avatar updated successfully" {
		t.Errorf("unexpected message: %v", resp)
	}

	// Verify all expectations were met
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}
