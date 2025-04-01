# Sprint 3 Report for Roam.io

## **Progress**

### **1. Feature Development**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **32** | **User Profile: Back End** | Closed as duplicate of issue 119 (user reviews functionality) |
| **35** | **List Local Events: Front End** | Developed interface for browsing and filtering local events with search and location filtering capabilities |
| **36** | **List Local Events: Back End** | Created API endpoints for retrieving and filtering events based on location and search criteria |
| **39** | **Photo Sharing: Front End** | Feature canceled - Implementation removed from project scope due to image hosting infrastructure complexities |
| **40** | **Photo Sharing: Back End** | Feature canceled - Implementation removed from project scope due to image hosting infrastructure complexities |
| **76** | **Create Support and FAQ pages** | Implemented Support page with contact methods, office locations, and message form. Created FAQ page with categorized questions and answers |
| **79** | **Change website title display** | Updated website title and metadata for better SEO and user experience |
| **82** | **Make username dynamic on landing page** | Updated landing page to display personalized greeting with user's username |
| **84** | **Create a crash page for website** | Implemented 404 page with navigation options to improve user experience when pages aren't found |
| **88** | **Add Host table, with host details** | Added database table and relations for accommodation hosts |
| **89** | **Add total_cost column in bookings table** | Enhanced booking table schema to include total cost calculation |
| **94** | **Integrate accommodation details page** | Connected accommodation details page with backend APIs for displaying comprehensive information |
| **100** | **Add feature to reserve events for user** | Implemented functionality for users to book event tickets |
| **105** | **Add functionality to remove event booking** | Implemented API endpoint to allow users to cancel event bookings |
| **106** | **Add new fields to accommodation table** | Extended accommodation schema with additional information fields |
| **109** | **Add REST API calls for remaining features** | Implemented missing API endpoints for complete feature set |
| **114** | **Host repo images** | Set up repository for hosting and serving images used throughout the application |
| **119** | **Add feature to add user reviews to accommodations** | Implemented review system allowing users to rate and comment on accommodations |
| **120** | **Add API to create organizers for local events** | Created functionality to assign and manage event organizers |

### **2. Bug-Fixes and Clean-Up**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **90** | **Resolve Delete booking API issue** | Fixed issues with the API endpoint for cancelling accommodation bookings |
| **97** | **Integrate fetch booking feature** | Fixed issues with booking retrieval functionality for user dashboard |

### **3. Testing**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **86** | **Cypress e2e testcase** | Added end-to-end tests for critical user flows including event booking and support |
| **115** | **Add unit tests for event handler functions** | Implemented tests for event creation, retrieval, and management APIs |
| **118** | **Add unit test cases for user reviews functionality** | Created tests to verify review submission and retrieval functionality |
| **-** | **Unit tests for new components** | Added comprehensive tests for NotFound, FAQ, Support, and EventList components |

---

## **Frontend Unit Tests**

### **Test Names by Component**

#### **1. NotFound Component (notfound.test.js)**
- Renders 404 page elements
- Renders action buttons
- Home button navigates correctly
- Find stays button navigates correctly
- Support link navigates correctly

#### **2. FAQ Component (faq.test.js)**
- Renders header and title
- Renders all category tabs
- Shows General category content
- Shows Accommodations content
- Displays contact support section
- Displays team members in About Us section

#### **3. Support Component (support.test.js)**
- Renders header and title
- Displays contact options section
- Renders office locations section
- Renders contact form with all fields
- Renders emergency support section

#### **4. EventList Component (eventlist.test.js)**
- Basic test to verify Jest is working
- Has expected search functionality
- Ticket calculation works correctly
- Location filtering matches expected behavior
- Booking validation functions correctly
- Formatting dates displays correctly

---

## **Cypress Tests**

### **EventList**
1. Should render the page with search input and location filter
2. Should filter events based on search term
3. Should filter events based on selected location
4. Should highlight the selected event when clicked
5. Should update ticket count and total price correctly
6. Should display images in the event gallery
7. Should successfully send booking data when booking tickets
8. Should render selected event details when clicked

### **FAQ**
1. Should render the FAQ page with title and subtitle
2. Should display FAQ category tabs
3. Should switch between FAQ categories when tabs are clicked
4. Should expand and collapse FAQ answers when accordion is clicked
5. Should display FAQ questions and answers correctly
6. Should display the "Contact Support" button and navigate correctly

### **NotFound**
1. Displays the 404 error code and message
2. Displays the error description text
3. Renders GO HOME and FIND STAYS buttons
4. Renders Contact Support link
5. Has working links (not broken)

### **Support**
1. Renders page title and subtitle
2. Displays all support contact options
3. Displays all office locations
4. Displays emergency support section

### **App**
1. Renders (verifies if APP component is getting rendered)

### **Header** *(Modified from Sprint 2)*
1. Should show loading state initially
2. Should display logo correctly
3. Should display slogan text
4. Should display all navigation links with correct hrefs

### **Accommodation Details** *(Modified from Sprint 2)*
1. Renders the accommodation name and location
2. Displays the main image and thumbnails
3. Changes image when thumbnail is clicked
4. Displays rating and review count
5. Renders all facilities with icons
6. Shows check-in and check-out date pickers
7. Enables booking when valid dates are selected
8. Shows error if check-out is before check-in
9. Renders user reviews
10. Displays total cost when both dates are selected

### **Accommodation List** *(Modified from Sprint 2)*
1. Should display the page title correctly
2. Should display all accommodations on initial load
3. Should filter accommodations by search term
4. Should filter accommodations by location
5. Should display no results message when no accommodations match criteria
6. Should display accommodation details correctly
7. Should reset location filter when "All Locations" is selected
8. Should properly handle location filter selection via the DOM

### **Login** *(Modified from Sprint 2)*
1. Should render the login form
2. Should show validation errors for empty fields
3. Should show validation error for invalid email
4. Should allow user to enter email and password
5. Should navigate to register page on link click

### **Register** *(Modified from Sprint 2)*
1. Should render the registration form
2. Should show validation errors for empty fields
3. Should show validation error for invalid email
4. Should submit form successfully and show success alert

### **UserProfile** *(Modified from Sprint 2)*
1. Should render the profile page with title and user name
2. Should display profile tabs for "ACCOMMODATIONS", "EVENTS", and "SECURITY"
3. Should switch to "SECURITY" tab when clicked
4. Should open and close the avatar selection drawer
5. Should change the avatar when a new avatar is selected

---

## **Backend Unit Tests**

### **Accommodation Test Functions**
- **TestFetchAccommodations**: Tests retrieving accommodations with location filters, verifies HTTP status and response structure
- **TestFetchAccommodationById**: Tests fetching a specific accommodation by ID, confirms proper data retrieval and status code
- **TestCreateAccommodation**: Tests creating a new accommodation listing, validates HTTP status and response content

### **Login Test Function**
- **TestLogoutHandler**: Tests two scenarios - successful logout and user not logged in

### **Event Test Functions**
- **TestCreateEvent**: Tests event creation API, validates response structure and status codes
- **TestCreateEvent_InvalidPayload**: Tests handling of malformed JSON payloads for event creation
- **TestFetchEventById**: Tests retrieving events by ID with scenarios for successful fetch, not found, and database errors
- **TestCreateEventBooking**: Tests the event booking creation function with both success and error cases
- **TestAddEventBookingHandler**: Tests the event booking handler with various scenarios (successful booking, missing parameters, duplicate booking, insufficient seats)
- **TestRemoveEventBookingByID**: Tests the removal of event bookings with successful and error cases
- **TestRemoveEventBooking**: Tests the event booking removal API endpoint with multiple test scenarios

### **Review Test Function**
- **TestAddReview**: Tests review creation with multiple scenarios including successful creation, invalid ratings, empty comments, and authentication issues

---

## **Documentation of Backend API**

### **Accommodation Management**

#### **Get Accommodations**
- **URL**: /accommodations
- **Method**: GET
- **Handler**: FetchAccommodations(db)
- **Description**: Retrieves all accommodations or filters by location. Updated to include owners of the accommodations and user reviews.
- **Query Parameters**: location (optional) - Filter accommodations by location
- **Response**: 
  - Success (200 OK): List of accommodations
  - Error (500 Internal Server Error): Database error

#### **Get Accommodation by ID**
- **URL**: /accommodations/{id}
- **Method**: GET
- **Handler**: FetchAccommodationsById(db)
- **Description**: Retrieves details of a specific accommodation. Updated to include owners of the accommodations and user reviews.
- **Query Parameters**: id - Accommodation ID
- **Response**:
  - Success (200 OK): List of accommodations
  - Error (404 Not Found): Accommodation not found
  - Error (500 Internal Server Error): Database error

#### **Create Accommodation**
- **URL**: /accommodations
- **Method**: POST
- **Handler**: CreateAccommodation(db)
- **Description**: Creates a new accommodation listing. Updated to include owner id.
- **Request Body**: JSON with accommodation details including name, location, images, and owner ID
- **Response**:
  - Success (201 Created): Created accommodation details
  - Error (400 Bad Request): Invalid request payload

#### **Add Review for Accommodation**
- **URL**: /accommodations/{id}/reviews
- **Method**: POST
- **Handler**: AddReview(db)
- **Description**: Adds a user review for a specific accommodation.
- **Request Body**: JSON with rating and comment
- **Response**:
  - Success (201 Created): Created review details
  - Error (400 Bad Request): Invalid request payload or rating out of range
  - Error (401 Unauthorized): User not logged in
  - Error (500 Internal Server Error): Database error

### **Owner Management**

#### **Create Owner**
- **URL**: /owner
- **Method**: POST
- **Handler**: CreateOwner(db)
- **Description**: Creates an owner in the hosts table that can host accommodations.
- **Request Body**: JSON with owner's name, email, and phone
- **Response**:
  - Success (201 Created): Created owner
  - Error (400 Bad Request): Invalid request payload

### **User Management**

#### **User Logout**
- **URL**: /users/logout
- **Method**: POST
- **Handler**: LogoutHandler(db)
- **Description**: Clears the user session and logs the user out.
- **Response**:
  - Success (200 OK): {"message": "Logout successful"}
  - Error (401 Unauthorized): {"message": "Not logged in"}
  - Error (500 Internal Server Error): {"message": "Failed to logout"}

#### **Get User Profile**
- **URL**: /users/profile
- **Method**: GET
- **Handler**: GetUserProfileHandler(db)
- **Description**: Retrieves the profile information of the currently logged-in user.
- **Response**:
  - Success (200 OK): User profile details
  - Error (401 Unauthorized): No session found
  - Error (404 Not Found): User not found

### **Event Management**

#### **Create Event**
- **URL**: /events
- **Method**: POST
- **Handler**: CreateEvent(db)
- **Description**: Creates a new event listing.
- **Request Body**: JSON with event details including name, location, date, and organizer ID
- **Response**:
  - Success (201 Created): Created event details
  - Error (400 Bad Request): Invalid request payload

#### **Get Event by ID**
- **URL**: /events/{id}
- **Method**: GET
- **Handler**: FetchEventById(db)
- **Description**: Retrieves details of a specific event with its organizer information.
- **Response**:
  - Success (200 OK): Event details including organizer information
  - Error (404 Not Found): Event not found
  - Error (500 Internal Server Error): Database error

#### **Get Events**
- **URL**: /events
- **Method**: GET
- **Handler**: FetchEvents(db)
- **Description**: Retrieves all events or filters by location with their organizer information.
- **Query Parameters**: location (optional) - Filter events by location
- **Response**:
  - Success (200 OK): List of events with organizer information
  - Error (500 Internal Server Error): Database error

#### **Add Event Booking**
- **URL**: /events
- **Method**: PUT
- **Handler**: AddEventBooking(db)
- **Description**: Creates a booking for an event.
- **Query Parameters**: event_id, guests, total_cost
- **Response**:
  - Success (201 Created): {"id": booking_id}
  - Error (400 Bad Request): Missing parameters
  - Error (401 Unauthorized): No session found
  - Error (409 Conflict): Booking already exists for user
  - Error (500 Internal Server Error): Database error or seats not available

#### **Remove Event Booking**
- **URL**: /events
- **Method**: DELETE
- **Handler**: RemoveEventBooking(db)
- **Description**: Removes a booking for an event.
- **Query Parameters**: event_booking_id - ID of the event booking to remove
- **Response**:
  - Success (200 OK): "Event Booking removed"
  - Error (404 Not Found): Event Booking not found

#### **Create Organizer**
- **URL**: /organizer
- **Method**: POST
- **Handler**: CreateOrganizer(db)
- **Description**: Creates an organizer in the database that can host events.
- **Request Body**: JSON with organizer's name, email, and phone
- **Response**:
  - Success (201 Created): Created organizer details
  - Error (400 Bad Request): Invalid request payload
  - Error (500 Internal Server Error): Database error

### **Data Models**

#### **Review**
- ID: Unique identifier (uint)
- UserID: ID of the user who wrote the review (uint)
- AccommodationID: ID of the reviewed accommodation (uint)
- UserName: Name of the user who wrote the review (string)
- Rating: Numerical rating score (float64)
- Date: Date when review was posted (string)
- Comment: Review content (string)

#### **Owner**
- ID: Unique identifier (uint)
- Name: Owner's full name (string)
- Email: Owner's email address (string)
- Phone: Owner's contact number (string)

#### **Organizer**
- ID: Unique identifier (uint)
- Name: Organizer's name (string)
- Email: Organizer's email address (string)
- Phone: Organizer's contact number (string)

#### **Event**
- ID: Unique identifier (uint)
- EventName: Name of the event (string)
- Location: Event location (string)
- Date: Event date (string)
- Time: Event start time (string)
- Images: Array of event image URLs (pq.StringArray)
- Description: Detailed description of the event (string)
- Price: Event ticket price (string)
- AvailableSeats: Number of available seats (uint)
- TotalSeats: Total number of seats (uint)
- OfficialLink: Link to official event page (string)
- OrganizerID: ID of the event organizer (uint)

#### **EventResponse**
- ID: Unique identifier (uint)
- Name: Event name (string)
- Location: Event location (string)
- Date: Event date (string)
- Time: Event start time (string)
- Images: Array of event image URLs (pq.StringArray)
- Description: Detailed description (string)
- Price: Event ticket price (string)
- AvailableSeats: Number of available seats (uint)
- TotalSeats: Total number of seats (uint)
- OfficialLink: Link to official event page (string)
- Organizer: Event organizer details (Organizer)

#### **EventBooking**
- ID: Unique identifier (uint)
- UserID: ID of the user making the booking (uint)
- EventId: ID of the booked event (uint)
- Guests: Number of guests (uint)
- TotalCost: Total cost of booking (uint)

#### **Updated Accommodation**
Additional fields from Sprint 3:
- OwnerID: ID of the accommodation owner (uint)
- PricePerNight: Cost per night (float64)
- Rating: Average accommodation rating (float64)
- Owner: Owner details (Owner)

#### **Updated Booking**
Additional field from Sprint 3:
- TotalCost: Total cost of booking (uint)