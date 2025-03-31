package models

// User represents a user object in the system
type EventBooking struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint `gorm:"not null"`
	EventId   uint `gorm:"not null"`
	Guests    uint `gorm:"not null"`
	TotalCost uint `gorm:"not null"`
}
