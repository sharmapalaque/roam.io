package models

import "github.com/lib/pq"

// User represents a user object in the system
type Accommodation struct {
	ID          uint           `gorm:"primaryKey"`
	Name        string         `gorm:"size:100"`
	Location    string         `gorm:"size:100"`
	Description string         `gorm:"type:text"`
	Facilities  pq.StringArray `gorm:"type:text[]"`
	ImageUrls   pq.StringArray `gorm:"type:text[]"`
	UserReviews pq.StringArray `gorm:"type:text[]"`
}
