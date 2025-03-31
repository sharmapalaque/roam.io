package routes

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
	"gorm.io/gorm"
)

func NewRouter(db *gorm.DB) *mux.Router {
	r := mux.NewRouter()

	// Define user-related routes
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	r.HandleFunc("/users/register", CreateUserHandler(db)).Methods("POST")
	r.HandleFunc("/users/login", LoginHandler(db)).Methods("POST")
	r.HandleFunc("/protected-endpoint", ProtectedEndpointHandler(db)).Methods("GET")
	r.HandleFunc("/accommodations/{id}", FetchAccommodationById(db)).Methods("GET")
	r.HandleFunc("/events", CreateEvent(db)).Methods("POST")
	r.HandleFunc("/events/{id}", FetchEventById(db)).Methods("GET")
	r.HandleFunc("/accommodations", CreateAccommodation(db)).Methods("POST")
	r.HandleFunc("/accommodations", FetchAccommodations(db)).Methods("GET")
	r.HandleFunc("/events", FetchEvents(db)).Methods("GET")
	r.HandleFunc("/accommodations", AddBooking(db)).Methods("PUT")
	r.HandleFunc("/events", AddEventBooking(db)).Methods("PUT")

	r.HandleFunc("/accommodations", RemoveBooking(db)).Methods("DELETE")
	r.HandleFunc("/events", RemoveEventBooking(db)).Methods("DELETE")
	r.HandleFunc("/users/profile", GetUserProfileHandler(db)).Methods("GET")
	r.HandleFunc("/host", CreateHost(db)).Methods("POST")

	// Handle OPTIONS requests
	r.Use(mux.CORSMethodMiddleware(r))

	// Log incoming requests for debugging
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Println("Origin:", r.Header.Get("Origin"))
			log.Println("Method:", r.Method)
			next.ServeHTTP(w, r)
		})
	})

	// Configure CORS - Modified for credential support
	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	// Change from wildcard to specific origins
	originsOk := handlers.AllowedOrigins([]string{"http://localhost:5173"}) // Frontend URL
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	// Add credentials allowed option
	credentialsOk := handlers.AllowCredentials()

	// Start the server
	fmt.Println("Server is running on port 8080...")
	// Add the credentials option to the CORS handler
	corsHandler := handlers.CORS(originsOk, headersOk, methodsOk, credentialsOk)
	log.Fatal(http.ListenAndServe(":8080", corsHandler(r)))
	return r
}
