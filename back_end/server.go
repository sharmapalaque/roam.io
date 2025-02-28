package main

import (
	"log"

	"roam.io/db"
	"roam.io/routes"
)

// @title Your API Title
// @version 1.0
// @description Your API Description
// @host localhost:8080
// @BasePath /
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
