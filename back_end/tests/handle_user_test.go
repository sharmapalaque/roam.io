package routes

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"roam.io/routes"
)

func TestCreateUserHandler(t *testing.T) {
	// Create a mock database
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      db,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening gorm database", err)
	}

	// Test cases
	testCases := []struct {
		name           string
		inputJSON      string
		expectedStatus int
		mockBehavior   func()
	}{
		{
			name:           "Valid Input",
			inputJSON:      `{"name":"John Doe","username":"johndoe","email":"john@example.com","password":"password123","dob":"1990-01-01"}`,
			expectedStatus: http.StatusCreated,
			mockBehavior: func() {
				mock.ExpectBegin()
				mock.ExpectExec("INSERT INTO `users`").WillReturnResult(sqlmock.NewResult(1, 1))
				mock.ExpectCommit()
			},
		},
		{
			name:           "Invalid JSON",
			inputJSON:      `{"name":"John Doe","username":"johndoe","email":"john@example.com","password":"password123","dob":"1990-01-01"`,
			expectedStatus: http.StatusBadRequest,
			mockBehavior:   func() {},
		},
		{
			name:           "Invalid Date Format",
			inputJSON:      `{"name":"John Doe","username":"johndoe","email":"john@example.com","password":"password123","dob":"1990/01/01"}`,
			expectedStatus: http.StatusBadRequest,
			mockBehavior:   func() {},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			tc.mockBehavior()

			// Create a request to pass to our handler
			req, err := http.NewRequest("POST", "/users", bytes.NewBufferString(tc.inputJSON))
			if err != nil {
				t.Fatal(err)
			}

			// Create a ResponseRecorder to record the response
			rr := httptest.NewRecorder()
			handler := routes.CreateUserHandler(gormDB)

			// Call the handler
			handler.ServeHTTP(rr, req)

			// Check the status code
			if status := rr.Code; status != tc.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v", status, tc.expectedStatus)
			}

			// Check for remaining expectations
			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestCreateUser(t *testing.T) {
	// Create a mock database
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	gormDB, err := gorm.Open(mysql.New(mysql.Config{
		Conn:                      db,
		SkipInitializeWithVersion: true,
	}), &gorm.Config{})
	if err != nil {
		t.Fatalf("An error '%s' was not expected when opening gorm database", err)
	}

	name := "John Doe"
	email := "john@example.com"
	username := "johndoe"
	password := "hashedpassword"
	dob := time.Date(1990, 1, 1, 0, 0, 0, 0, time.UTC)

	// Use AnyArg() for all arguments since GORM's order might change
	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO `users`").WithArgs(
		sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(),
		sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg(), // Added extra arg for avatar_id
	).WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	id, err := routes.CreateUser(name, email, username, password, dob, gormDB)
	if err != nil {
		t.Errorf("error was not expected while creating user: %s", err)
	}

	if id != 1 {
		t.Errorf("expected id to be 1, got %d", id)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("there were unfulfilled expectations: %s", err)
	}
}

func TestHashPassword(t *testing.T) {
	password := "password123"
	hashedPassword, err := routes.HashPassword(password)
	if err != nil {
		t.Errorf("error was not expected while hashing password: %s", err)
	}

	if hashedPassword == password {
		t.Errorf("hashed password should not be equal to original password")
	}

	if len(hashedPassword) == 0 {
		t.Errorf("hashed password should not be empty")
	}
}
