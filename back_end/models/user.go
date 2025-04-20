package models

import "time" // Added time import for the date type

// User represents a user object in the system
type User struct {
	ID       uint      `gorm:"primaryKey"`
	Name     string    `gorm:"size:100"`
	Username string    `gorm:"size:50;uniqueIndex"` // unique username
	Email    string    `gorm:"uniqueIndex"`
	Dob      time.Time `gorm:"not null" json:"dob"` // date of birth cannot be null
	Password string
	AvatarID string `gorm:"default:Marshmallow:`
}
