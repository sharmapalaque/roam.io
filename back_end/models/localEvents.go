package models

import (
	"github.com/lib/pq"
)

type Event struct {
	ID             uint   `gorm:"primaryKey"`
	EventName      string `gorm:"size:100"`
	Location       string `gorm:"size:100"`
	Date           string
	Time           string         `gorm:"size:100"`
	Images         pq.StringArray `gorm:"type:text[]"`
	Description    string         `gorm:"type:text"`
	Price          string         `gorm:"type:text"`
	AvailableSeats uint
	TotalSeats     uint
	OfficialLink   string `gorm:type:text"`
	OrganizerID    uint   `gorm:"not null"`
	Coordinates    string `gorm:type:text`
}

type EventResponse struct {
	ID             uint   `gorm:"primaryKey"`
	Name           string `gorm:"size:100"`
	Location       string `gorm:"size:100"`
	Date           string
	Time           string         `gorm:"size:100"`
	Images         pq.StringArray `gorm:"type:text[]"`
	Description    string         `gorm:"type:text"`
	Price          string         `gorm:"type:text"`
	AvailableSeats uint
	TotalSeats     uint
	OfficialLink   string    `gorm:"type:text"`
	Organizer      Organizer `gorm:"type:json"`
	Coordinates    string    `gorm:text"`
}
