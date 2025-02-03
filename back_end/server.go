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
	db, err := db.Connect()
	if err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}
	defer db.Close()

	createTableSQL := `CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(150) UNIQUE NOT NULL,
		username VARCHAR(150) NOT NULL,
		password VARCHAR(150) NOT NULL,
		age INT CHECK (age >= 18),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatal("Failed to create table:", err)
	}

	fmt.Println("Table 'users' created successfully!")
	// Pass db connection to the routes
	r := routes.NewRouter(db)

	// Start the server
	fmt.Println("Server is running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", r))
}
