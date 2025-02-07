package db

import (
	"fmt"

	_ "github.com/lib/pq" // PostgreSQL driver
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"roam.io/models"
)

// Connect establishes and returns a database connection
func Connect() (*gorm.DB, error) {
	dsn := "host=localhost user=postgres password=postgres dbname=mydb port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database!")
	}
	fmt.Println("Database connected successfully")
	return db, nil
}

func MigrateDB(db *gorm.DB) {
	err := db.AutoMigrate(&models.User{})
	if err != nil {
		panic("Failed to migrate database")
	}
	fmt.Println("Database migrated successfully")
}
