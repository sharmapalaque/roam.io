package models

// User represents a user object in the system
type User struct {
	ID       uint   `gorm:"primaryKey"`
	Name     string `gorm:"size:100"`
	Username string `gorm:"size:50;uniqueIndex"` // unique username
	Email    string `gorm:"uniqueIndex"`
	Age      int    `gorm:"not null"` // age cannot be null
	Password string
}
