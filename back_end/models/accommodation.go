package models

import "github.com/lib/pq"

// Review represents a user review
type Review struct {
	ID       uint    `json:"ID"`
	UserName string  `json:"UserName"`
	Rating   float64 `json:"Rating"`
	Date     string  `json:"Date"`
	Comment  string  `json:"Comment"`
}

// Owner represents accommodation owner information
type Owner struct {
	Name  string `json:"Name"`
	Email string `json:"Email"`
	Phone string `json:"Phone"`
}

// Accommodation represents an accommodation object in the system
type Accommodation struct {
	ID            uint           `gorm:"primaryKey" json:"ID"`
	Name          string         `gorm:"size:100" json:"Name"`
	Location      string         `gorm:"size:100" json:"Location"`
	Description   string         `gorm:"type:text" json:"Description"`
	Facilities    pq.StringArray `gorm:"type:text[]" json:"Facilities"`
	ImageUrls     pq.StringArray `gorm:"type:text[]" json:"ImageUrls"`
	UserReviews   []Review       `gorm:"-" json:"UserReviews"` // Using gorm:"-" to handle this separately
	OwnerID       uint           `gorm:"not null" json:"OwnerID"`
	PricePerNight float64        `json:"PricePerNight"`
	Rating        float64        `json:"Rating"`
	Owner         Owner          `gorm:"-" json:"Owner"` // Using gorm:"-" to handle this separately
	// Store raw reviews as JSON strings in database
	RawUserReviews pq.StringArray `gorm:"type:text[]" json:"-"`
}
