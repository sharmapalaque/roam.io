package routes

import (
	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
	"gorm.io/gorm" // This is needed to serve Swagger UI
)

func NewRouter(db *gorm.DB) *mux.Router {
	r := mux.NewRouter()

	// Define user-related routes
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	r.HandleFunc("/users/register", CreateUserHandler(db)).Methods("POST")
	r.HandleFunc("/users/login", LoginHandler(db)).Methods("POST")
	r.HandleFunc("/protected-endpoint", ProtectedEndpointHandler(db)).Methods("GET")
	r.HandleFunc("/accommodations/{id}", FetchAccommodationById(db)).Methods("GET")
	r.HandleFunc("/accommodations", FetchAccommodations(db)).Methods("GET")
	r.HandleFunc("/accommodations", AddBooking(db)).Methods("PUT")
	r.HandleFunc("/accommodations", RemoveBooking(db)).Methods("DELETE")
	r.HandleFunc("/accommodations", CreateAccommodation(db)).Methods("POST")
	return r
}
