package models

import "time"

// User represents a user object in the system
type Booking struct {
	ID           uint `gorm:"primaryKey"`
	UserID       uint `gorm:"not null"`
	BookingID    uint `gorm:"not null"`
	CheckinDate  time.Time
	CheckoutDate time.Time
}
