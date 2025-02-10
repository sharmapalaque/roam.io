package models

// User represents a user object in the system
type Accommodation struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"size:100"`
	Location    string `gorm:"size:100"`
	ImageUrl    string `gorm:"type:text"`
	UserReviews string `gorm:"size:50"`
}
