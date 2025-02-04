package models

// User represents a user object in the system
type User struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Age      int    `json:"age"`
	Password string `json:"passwrd"`
}
