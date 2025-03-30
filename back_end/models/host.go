package models

// Host represents a user object in the system
type Host struct {
	ID      uint   `gorm:"primaryKey"`
	Name    string `gorm:"size:100"`
	Email   string `gorm:"uniqueIndex"`
	Contact string
}
