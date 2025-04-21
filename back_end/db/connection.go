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
	dsn := "host=host.docker.internal user=postgres password=postgres dbname=mydb port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database!")
	}
	fmt.Println("Database connected successfully")
	return db, nil
}

func MigrateDB(db *gorm.DB) {
	err := db.AutoMigrate(&models.User{}, &models.Accommodation{}, &models.Booking{}, models.Owner{}, models.Event{}, models.Organizer{}, models.EventBooking{}, models.Review{})
	if err != nil {
		panic("Failed to migrate database")
	}

	if !db.Migrator().HasColumn(&models.User{}, "avatar_id") {
		// Add the column with default value
		if err := db.Exec("ALTER TABLE users ADD COLUMN avatar_id VARCHAR(100) DEFAULT 'Marshmallow'").Error; err != nil {
			fmt.Println("Error adding avatar_id column:", err)
		} else {
			fmt.Println("Added avatar_id column to users table")
		}
	} else {
		// Set any NULL or empty avatar_ids to 'Marshmallow'
		if err := db.Exec("UPDATE users SET avatar_id = 'Marshmallow' WHERE avatar_id IS NULL OR avatar_id = ''").Error; err != nil {
			fmt.Println("Error updating empty avatar_id values:", err)
		} else {
			fmt.Println("Updated empty avatar_id values to 'Marshmallow'")
		}
	}

	fmt.Println("Database migrated successfully")
}
