package routes

import (
	"database/sql"

	"github.com/gorilla/mux"
)

// NewRouter initializes the routes and returns the router
func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	// Define user-related routes
	r.HandleFunc("/users/register", CreateUserHandler(db)).Methods("POST")

	return r
}
