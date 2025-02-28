package routes

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	httpSwagger "github.com/swaggo/http-swagger"
	"gorm.io/gorm" // This is needed to serve Swagger UI
)

func NewRouter(db *gorm.DB) {
	r := mux.NewRouter()

	// Define user-related routes
	r.PathPrefix("/swagger/").Handler(httpSwagger.WrapHandler)

	r.HandleFunc("/users/register", CreateUserHandler(db)).Methods("POST")
	r.HandleFunc("/users/login", LoginHandler(db)).Methods("POST")
	r.HandleFunc("/protected-endpoint", ProtectedEndpointHandler(db)).Methods("GET")
	r.HandleFunc("/accommodations", FetchAccommodations(db)).Methods("GET")
	r.HandleFunc("/accommodations", AddBooking(db)).Methods("PUT")
	r.HandleFunc("/accommodations", RemoveBooking(db)).Methods("DELETE")
	r.HandleFunc("/create", CreateAccommodation(db)).Methods("POST")

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

	// Configure CORS
	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	originsOk := handlers.AllowedOrigins([]string{"*"}) // Change to "*" for testing
	methodsOk := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})

	// Start the server
	fmt.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(originsOk, headersOk, methodsOk)(r)))
}
