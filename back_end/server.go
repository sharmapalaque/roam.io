package main

import (
	"log"

	"roam.io/db"
	_ "roam.io/docs" // Import generated docs
	"roam.io/routes"
)

// @title Roam.io API
// @version 1.0
// @description Roam.io is a travel booking platform API for accommodations and events
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url https://github.com/sharmapalaque/roam.io
// @contact.email pragyna.titty@ufl.edu

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /
// @schemes http
func main() {
	// Setup router
	gormDb, err := db.Connect()
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}
	db.MigrateDB(gormDb)

	// Pass db connection to the routes
	routes.NewRouter(gormDb)
}
