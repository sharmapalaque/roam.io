package routes

import (
	"net/http"

	"github.com/gorilla/sessions"
)

// Variables to help with testing session handling
var (
	testStore    sessions.Store
	testSession  *sessions.Session
	testStoreSet bool
)

// SetStoreForTesting allows tests to set a custom session store
func SetStoreForTesting(store sessions.Store) {
	testStore = store
	testStoreSet = true
}

// SetSessionForTesting allows tests to set a session for a request
func SetSessionForTesting(r *http.Request, session *sessions.Session) {
	testSession = session
}

// GetSessionForTesting is a helper function used by handlers during testing
// This is called by store.Get in handlers when testStoreSet is true
func GetSessionForTesting(r *http.Request, name string) (*sessions.Session, error) {
	return testSession, nil
}
