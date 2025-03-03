// To test, cd to back_end/routes and run: go test -v -run TestLoginHandler

package routes

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"roam.io/models"
)

type UserRepository interface {
	FindUserByEmail(email string) (*models.User, error)
}

type MockUserRepository struct {
	findUserFunc func(email string) (*models.User, error)
}

func (m *MockUserRepository) FindUserByEmail(email string) (*models.User, error) {
	return m.findUserFunc(email)
}

type mockSessionStore struct {
	sessions map[string]*sessions.Session
}

func newMockSessionStore() *mockSessionStore {
	return &mockSessionStore{
		sessions: make(map[string]*sessions.Session),
	}
}

func (m *mockSessionStore) Get(r *http.Request, name string) (*sessions.Session, error) {
	session, exists := m.sessions[name]
	if !exists {
		session = sessions.NewSession(m, name)
		m.sessions[name] = session
	}
	return session, nil
}

func (m *mockSessionStore) New(r *http.Request, name string) (*sessions.Session, error) {
	session := sessions.NewSession(m, name)
	session.IsNew = true
	m.sessions[name] = session
	return session, nil
}

func (m *mockSessionStore) Save(r *http.Request, w http.ResponseWriter, s *sessions.Session) error {
	m.sessions[s.Name()] = s
	return nil
}

func mockLoginHandler(repo UserRepository) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request payload"})
			return
		}

		if req.Email == "" || req.Password == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"message": "Email and password are required"})
			return
		}

		user, err := repo.FindUserByEmail(req.Email)
		if err != nil {
			if err == gorm.ErrRecordNotFound {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
				return
			} else {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{"message": "Database error"})
				return
			}
		}

		if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Invalid password"})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Login successful",
			"user_id": user.ID,
		})
	}
}

func TestLoginHandler(t *testing.T) {
	tests := []struct {
		name         string
		requestBody  interface{}
		mockFindUser func(email string) (*models.User, error)
		expectedCode int
		expectedBody map[string]interface{}
	}{
		{
			name: "Valid login",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "password123",
			},
			mockFindUser: func(email string) (*models.User, error) {
				if email == "test@example.com" {
					hashedPw, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
					return &models.User{
						ID:       1,
						Email:    "test@example.com",
						Password: string(hashedPw),
					}, nil
				}
				return nil, gorm.ErrRecordNotFound
			},
			expectedCode: http.StatusOK,
			expectedBody: map[string]interface{}{
				"message": "Login successful",
				"user_id": float64(1),
			},
		},
		{
			name:        "Invalid JSON payload",
			requestBody: "invalid json",
			mockFindUser: func(email string) (*models.User, error) {
				return nil, nil
			},
			expectedCode: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"message": "Invalid request payload",
			},
		},
		{
			name: "Empty email",
			requestBody: map[string]string{
				"email":    "",
				"password": "password123",
			},
			mockFindUser: func(email string) (*models.User, error) {
				return nil, nil
			},
			expectedCode: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"message": "Email and password are required",
			},
		},
		{
			name: "Empty password",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "",
			},
			mockFindUser: func(email string) (*models.User, error) {
				return nil, nil
			},
			expectedCode: http.StatusBadRequest,
			expectedBody: map[string]interface{}{
				"message": "Email and password are required",
			},
		},
		{
			name: "User not found",
			requestBody: map[string]string{
				"email":    "nonexistent@example.com",
				"password": "password123",
			},
			mockFindUser: func(email string) (*models.User, error) {
				return nil, gorm.ErrRecordNotFound
			},
			expectedCode: http.StatusNotFound,
			expectedBody: map[string]interface{}{
				"message": "User not found",
			},
		},
		{
			name: "Database error",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "password123",
			},
			mockFindUser: func(email string) (*models.User, error) {
				return nil, errors.New("database connection error")
			},
			expectedCode: http.StatusInternalServerError,
			expectedBody: map[string]interface{}{
				"message": "Database error",
			},
		},
		{
			name: "Invalid password",
			requestBody: map[string]string{
				"email":    "test@example.com",
				"password": "wrongpassword",
			},
			mockFindUser: func(email string) (*models.User, error) {
				hashedPw, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
				return &models.User{
					ID:       1,
					Email:    "test@example.com",
					Password: string(hashedPw),
				}, nil
			},
			expectedCode: http.StatusUnauthorized,
			expectedBody: map[string]interface{}{
				"message": "Invalid password",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &MockUserRepository{
				findUserFunc: tt.mockFindUser,
			}

			handler := mockLoginHandler(repo)

			// Create request
			var reqBody []byte
			var err error

			switch v := tt.requestBody.(type) {
			case string:
				reqBody = []byte(v)
			default:
				reqBody, err = json.Marshal(tt.requestBody)
				if err != nil {
					t.Fatalf("Failed to marshal request body: %v", err)
				}
			}

			req, err := http.NewRequest("POST", "/users/login", bytes.NewBuffer(reqBody))
			if err != nil {
				t.Fatalf("Failed to create request: %v", err)
			}
			req.Header.Set("Content-Type", "application/json")

			rr := httptest.NewRecorder()

			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectedCode {
				t.Errorf("Expected status code %d, got %d", tt.expectedCode, rr.Code)
			}

			var response map[string]interface{}
			if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
				t.Fatalf("Failed to unmarshal response body: %v", err)
			}

			for key, expectedValue := range tt.expectedBody {
				if actualValue, ok := response[key]; !ok || actualValue != expectedValue {
					t.Errorf("Expected response body to contain %s: %v, got %v", key, expectedValue, actualValue)
				}
			}
		})
	}
}
