package routes

import (
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

// NewRouter initializes the routes and returns the router
func NewRouter(db *gorm.DB) *mux.Router {
	r := mux.NewRouter()

	// Define user-related routes
	r.HandleFunc("/users/register", CreateUserHandler(db)).Methods("POST")
	r.HandleFunc("/users/login", LoginHandler(db)).Methods("POST")
	r.HandleFunc("/protected-endpoint", ProtectedEndpointHandler(db)).Methods("GET")
	r.HandleFunc("/accommodations", FetchAccommodations(db)).Methods("GET")
	r.HandleFunc("/accommodations", AddAccommodation(db)).Methods("PUT")
	r.HandleFunc("/create", CreateAccommodation(db)).Methods("POST")
	return r
}
