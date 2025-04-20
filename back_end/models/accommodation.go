package models

import "github.com/lib/pq"

// Review represents a user review
type Review struct {
	ID              uint    `gorm:"primaryKey" json:"ID"`
	UserID          uint    `gorm:"not null" json:"UserID"`          // Foreign key to User
	AccommodationID uint    `gorm:"not null" json:"AccommodationID"` // Foreign key to Accommodation
	UserName        string  `json:"UserName"`                        // Can be fetched based on UserID, but stored for convenience/denormalization
	Rating          float64 `json:"Rating"`
	Date            string  `json:"Date"` // Consider using time.Time for better date handling
	Comment         string  `gorm:"type:text" json:"Comment"`
}

// Accommodation represents an accommodation object in the system
type Accommodation struct {
	ID            uint           `gorm:"primaryKey" json:"ID"`
	Name          string         `gorm:"size:100" json:"Name"`
	Location      string         `gorm:"size:100" json:"Location"`
	Description   string         `gorm:"type:text" json:"Description"`
	Facilities    pq.StringArray `gorm:"type:text[]" json:"Facilities"`
	ImageUrls     pq.StringArray `gorm:"type:text[]" json:"ImageUrls"`
	UserReviews   []Review       `gorm:"foreignKey:AccommodationID" json:"UserReviews"` // Define the foreign key relationship
	OwnerID       uint           `gorm:"not null" json:"OwnerID"`                       // Foreign key linking to the Owner
	PricePerNight float64        `json:"PricePerNight"`
	Rating        float64        `json:"Rating"` // Consider calculating this based on Reviews
	Owner         Owner          `gorm:"foreignKey:OwnerID" json:"Owner"`
	Coordinates   string         `gorm:"type:text" json:"Coordinates"`
}
