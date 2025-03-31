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
	err := db.AutoMigrate(&models.User{}, &models.Accommodation{}, &models.Booking{}, models.Host{}, models.Event{}, models.Organizer{}, models.EventBooking{})
	if err != nil {
		panic("Failed to migrate database")
	}

	// Check if PricePerNight and Rating columns exist, and add them if they don't
	if !db.Migrator().HasColumn(&models.Accommodation{}, "price_per_night") {
		err := db.Migrator().AddColumn(&models.Accommodation{}, "price_per_night")
		if err != nil {
			fmt.Println("Failed to add price_per_night column:", err)
		}
	}

	if !db.Migrator().HasColumn(&models.Accommodation{}, "rating") {
		err := db.Migrator().AddColumn(&models.Accommodation{}, "rating")
		if err != nil {
			fmt.Println("Failed to add rating column:", err)
		}
	}

	if !db.Migrator().HasColumn(&models.Accommodation{}, "raw_user_reviews") {
		err := db.Migrator().AddColumn(&models.Accommodation{}, "raw_user_reviews")
		if err != nil {
			fmt.Println("Failed to add raw_user_reviews column:", err)
		}
	}

	fmt.Println("Database migrated successfully")
}
