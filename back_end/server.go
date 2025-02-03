package main

import (
	"fmt"
	"log"
	"net/http"

	"roam.io/db"
	"roam.io/routes"
)

func main() {
	// Setup router
	gormDb, err := db.Connect()
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}
	db.MigrateDB(gormDb)

	// Pass db connection to the routes
	r := routes.NewRouter(gormDb)

	// Start the server
	fmt.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", r))
}
