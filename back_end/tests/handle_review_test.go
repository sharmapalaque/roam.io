package routes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"roam.io/models"
	"roam.io/routes"
)

// TestAddReview tests the AddReview handler function
func TestAddReview(t *testing.T) {
	// Create test cases
	testCases := []struct {
		name             string
		accommodationID  string
		loggedInUserID   uint
		payload          models.Review
		mockSetup        func(mock sqlmock.Sqlmock)
		expectedStatus   int
		expectedResponse *models.Review
	}{
		{
			name:            "Successful Review Creation",
			accommodationID: "1",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  4.5,
				Comment: "This place was wonderful! Very clean and great location.",
			},
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock query to fetch user details
				userRows := sqlmock.NewRows([]string{"id", "name", "username", "email", "dob", "password"}).
					AddRow(1, "John Doe", "johndoe", "john@example.com", time.Now(), "hashedpassword")
				mock.ExpectQuery(`SELECT \* FROM "users" WHERE "users"."id" = \$1 ORDER BY "users"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnRows(userRows)

				// Mock the insert query for the review
				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "reviews" (.+) VALUES (.+) RETURNING "id"`).
					WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(1))
				mock.ExpectCommit()
			},
			expectedStatus: http.StatusCreated,
			expectedResponse: &models.Review{
				ID:              1,
				UserID:          1,
				AccommodationID: 1,
				UserName:        "johndoe",
				Rating:          4.5,
				Comment:         "This place was wonderful! Very clean and great location.",
			},
		},
		{
			name:            "Invalid Rating - Too Low",
			accommodationID: "1",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  0.5, // Rating must be between 1 and 5
				Comment: "This place was not great.",
			},
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock query to fetch user details
				userRows := sqlmock.NewRows([]string{"id", "name", "username", "email", "dob", "password"}).
					AddRow(1, "John Doe", "johndoe", "john@example.com", time.Now(), "hashedpassword")
				mock.ExpectQuery(`SELECT \* FROM "users" WHERE "users"."id" = \$1 ORDER BY "users"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnRows(userRows)
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:            "Invalid Rating - Too High",
			accommodationID: "1",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  5.5, // Rating must be between 1 and 5
				Comment: "This place was amazing!",
			},
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock query to fetch user details
				userRows := sqlmock.NewRows([]string{"id", "name", "username", "email", "dob", "password"}).
					AddRow(1, "John Doe", "johndoe", "john@example.com", time.Now(), "hashedpassword")
				mock.ExpectQuery(`SELECT \* FROM "users" WHERE "users"."id" = \$1 ORDER BY "users"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnRows(userRows)
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:            "Empty Comment",
			accommodationID: "1",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  4.0,
				Comment: "", // Comment cannot be empty
			},
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock query to fetch user details
				userRows := sqlmock.NewRows([]string{"id", "name", "username", "email", "dob", "password"}).
					AddRow(1, "John Doe", "johndoe", "john@example.com", time.Now(), "hashedpassword")
				mock.ExpectQuery(`SELECT \* FROM "users" WHERE "users"."id" = \$1 ORDER BY "users"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnRows(userRows)
			},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:            "User Not Authenticated",
			accommodationID: "1",
			loggedInUserID:  0, // No user ID in session
			payload: models.Review{
				Rating:  4.0,
				Comment: "Good place",
			},
			mockSetup:      func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusUnauthorized,
		},
		{
			name:            "Invalid Accommodation ID",
			accommodationID: "invalid",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  4.0,
				Comment: "Good place",
			},
			mockSetup:      func(mock sqlmock.Sqlmock) {},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:            "Error Fetching User",
			accommodationID: "1",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  4.0,
				Comment: "Good place",
			},
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock error when fetching user
				mock.ExpectQuery(`SELECT \* FROM "users" WHERE "users"."id" = \$1 ORDER BY "users"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnError(gorm.ErrRecordNotFound)
			},
			expectedStatus: http.StatusInternalServerError,
		},
		{
			name:            "Database Error When Creating Review",
			accommodationID: "1",
			loggedInUserID:  1,
			payload: models.Review{
				Rating:  4.0,
				Comment: "Good place",
			},
			mockSetup: func(mock sqlmock.Sqlmock) {
				// Mock query to fetch user details
				userRows := sqlmock.NewRows([]string{"id", "name", "username", "email", "dob", "password"}).
					AddRow(1, "John Doe", "johndoe", "john@example.com", time.Now(), "hashedpassword")
				mock.ExpectQuery(`SELECT \* FROM "users" WHERE "users"."id" = \$1 ORDER BY "users"."id" LIMIT \$2`).
					WithArgs(1, 1).
					WillReturnRows(userRows)

				// Mock database error when creating review
				mock.ExpectBegin()
				mock.ExpectQuery(`INSERT INTO "reviews" (.+) VALUES (.+) RETURNING "id"`).
					WillReturnError(gorm.ErrInvalidDB)
				mock.ExpectRollback()
			},
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock database
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

			// Setup test HTTP request
			payload, _ := json.Marshal(tc.payload)
			req, _ := http.NewRequest("POST", "/accommodations/"+tc.accommodationID+"/reviews", bytes.NewBuffer(payload))
			req.Header.Set("Content-Type", "application/json")

			// Set URL vars for Gorilla Mux
			vars := map[string]string{
				"id": tc.accommodationID,
			}
			req = mux.SetURLVars(req, vars)

			// Set up session with user ID
			sessions.NewCookieStore([]byte("test-secret"))
			session := &sessions.Session{
				Values: map[interface{}]interface{}{
					"user_id": tc.loggedInUserID,
				},
				IsNew: false,
			}
			// Mock the store.Get method
			routes.SetStoreForTesting(sessions.NewCookieStore([]byte("test-secret")))
			routes.SetSessionForTesting(req, session)

			// Set up mock database expectations
			tc.mockSetup(mock)

			// Create an HTTP response recorder
			rr := httptest.NewRecorder()

			// Call the handler function
			handler := routes.AddReview(gormDB)
			handler.ServeHTTP(rr, req)

			// Check the response status code
			assert.Equal(t, tc.expectedStatus, rr.Code)

			// For successful creation, check the response body
			if tc.expectedStatus == http.StatusCreated {
				var response models.Review
				err := json.Unmarshal(rr.Body.Bytes(), &response)
				assert.NoError(t, err)
				// Note: We only check the fields we can predict, not Date which is set to current date
				assert.Equal(t, tc.expectedResponse.UserID, response.UserID)
				assert.Equal(t, tc.expectedResponse.AccommodationID, response.AccommodationID)
				assert.Equal(t, tc.expectedResponse.UserName, response.UserName)
				assert.Equal(t, tc.expectedResponse.Rating, response.Rating)
				assert.Equal(t, tc.expectedResponse.Comment, response.Comment)
			}

			// Verify that all expectations were met
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("Unfulfilled mock expectations: %s", err)
			}
		})
	}
}
