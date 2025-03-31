package models

// Owner represents a user object in the system (previously Host)
type Owner struct {
	ID    uint   `gorm:"primaryKey" json:"ID"`     // Added json tag for consistency
	Name  string `gorm:"size:100" json:"Name"`     // Added json tag
	Email string `gorm:"uniqueIndex" json:"Email"` // Added json tag
	Phone string `json:"Phone"`                    // Renamed from Contact, added json tag
}
