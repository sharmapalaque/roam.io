# Sprint 4 Report for Roam.io

## **Progress**

### **1. Feature Development**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **37** | **User Review System: Front End** | Implemented user review system interface for rating and reviewing accommodations |
| **41** | **Navigation Support: Front End** | Developed navigation support with map integration for accommodations and events |
| **42** | **Navigation Support: Back End** | Created backend API support for coordinate-based navigation services |
| **97** | **Integrate fetch booking feature** | Connected booking retrieval functionality with frontend interface |
| **122** | **Remove "View Password" from User Profile** | Removed the view password functionality from user profile page to improve security |
| **124** | **Add "Show/Hide Password" functionality to Login and Register pages** | Added toggle functionality to show or hide password on login and registration forms |
| **126** | **Integrate user review** | Connected user review system with backend API |
| **128** | **Integrate Delete Booking functionality** | Implemented functionality for users to cancel their accommodation bookings |
| **130** | **Integrate Delete booking feature** | Closed as duplicate of issue 128 (Delete Booking functionality) |
| **131** | **Integrate Delete Event booking functionality** | Implemented functionality for users to cancel their event bookings |
| **132** | **API for fetching accommodation reviews** | Created API endpoint for retrieving reviews for a specific accommodation |
| **135** | **Host Accommodation Images** | Implemented secure image hosting solution utilizing Imgur platform for accommodation visuals |
| **147** | **Fetch user reviews in user profile** | Added functionality to display user's submitted reviews in their profile |
| **148** | **Make avatar changes dynamic** | Implemented real-time avatar updates synchronized with backend database |
| **154** | **Add coordinates for accommodations** | Added geographic coordinates to accommodation data for map integration and navigation features |
| **155** | **Add coordinates for navigating events** | Added geographic coordinates to events data to enable map integration and navigation features |
| **159** | **Navigation Support: Events** | Added navigation functionality for event locations |
| **161** | **Integrate Support form with Google Sheet** | Connected support form with Google Sheets using Google Scripts |
| **163** | **Make Avatar dynamic on Header** | Updated header to display user's current avatar image |

### **2. Bug-Fixes and Clean-Up**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **127** | **User profile name correction** | Fixed user name display issues in the profile section |
| **139** | **Title, Location and User Reviews not visible on Accommodation Details page** | Fixed display issues for accommodation information and reviews |
| **141** | **Fix alignment issues on Accommodation Listing page** | Corrected UI layout problems on the accommodation listing page |
| **143** | **Clean-Up User Profile** | Improved user profile interface and usability |
| **165** | **Fix interface issues on front-end** | Addressed various UI issues throughout the application |
| **172** | **Navigate button alignment fixing** | Issue closed as the alignment problem could not be replicated during testing |
| **177** | **Fixing minor bugs in frontend** | Addressed specific UI rendering and functionality issues in frontend components |

### **3. Documentation**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **145** | **Update ReadMe to document final details of the project** | Comprehensively updated project documentation with final implementation details as specified in Sprint 4 requirements |
| **174** | **Create Sprint4.md** | Created Sprint 4 documentation detailing progress and implementation |

### **4. Testing**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **179** | **Add cypress testcases for new functionality** | Added end-to-end tests for critical user flows including navigation and review features |

### **5. DevOps Implementation**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **152** | **Automated the Build Using Jenkins Pipeline** | Implemented CI/CD pipeline using Jenkins for automated building and testing |
| **169** | **Added backend API documentation using Swagger** | Implemented comprehensive Swagger documentation for all backend APIs |
| **182** | **Containerized the application using Docker** | Created Docker containers for all application components to ensure consistent deployment |
| **185** | **Deployed the application on Kubernetes Cluster** | Set up Kubernetes infrastructure for container orchestration and application scaling |

---

## **Frontend Unit Tests**

### **Test Names by Component**

#### **1. Accommodation Details (accommodation-details-tests-fixed.js)**
- Renders Navigate Me button
- Navigate Me button opens Google Maps in new tab
- Navigate Me button handles missing coordinates
- Renders reviews section
- Can open and close review form
- Submit button is disabled when review text is empty
- Can submit a review
- Handles review submission errors

#### **2. Support Component (updated-support-tests.js)**
- Renders success message (for Google Sheets integration)

#### **3. EventList Component (eventlist.test.js)**
- Navigation URL creation works correctly
- Navigate me function behaves correctly

---

## **Cypress Tests**

### **Accommodation Details**
1. Opens Google Maps with correct coordinates on Navigate Me click
2. Calculates and displays total price including service and cleaning fees
3. Shows the review form when "Write a Review" is clicked

---

## **Backend Unit Tests**

### **Accommodation Test Functions**
- **TestFetchAccommodations**: Tests retrieving accommodations with location filters, verifies HTTP status and response structure (Modified for new format accounting the new coordinates field)
- **TestFetchAccommodationById**: Tests fetching a specific accommodation by ID, confirms proper data retrieval and status code (Modified for new format accounting the new coordinates field)
- **TestCreateAccommodation**: Tests creating a new accommodation listing, validates HTTP status and response content (Modified for new format accounting the new coordinates field)

### **Event Test Functions**
- **TestCreateEvent**: Tests event creation API, validates response structure and status codes (Modified for new format accounting the new coordinates field)
- **TestCreateEvent_InvalidPayload**: Tests handling of malformed JSON payloads for event creation
- **TestFetchEventById**: Tests retrieving events by ID with scenarios for successful fetch, not found, and database errors
- **TestCreateEventBooking**: Tests the event booking creation function with both success and error cases
- **TestAddEventBookingHandler**: Tests the event booking handler with various scenarios (successful booking, missing parameters, duplicate booking, insufficient seats)
- **TestRemoveEventBookingByID**: Tests the removal of event bookings with successful and error cases
- **TestRemoveEventBooking**: Tests the event booking removal API endpoint with multiple test scenarios

### **Get User Reviews Test Function**
- **TestGetUserReviews_Unauthenticated**: Case of unauthenticated user trying to fetch reviews
- **TestGetUserReviews_FetchError**: Case of trying to fetch user reviews but getting error
- **TestGetUserReviews_Success**: Case of user reviews being successfully fetched

### **Update Avatar Test Function**
- **TestUpdateUserAvatar_Unauthenticated**: Case of trying to update the avatar of an unauthenticated user
- **TestUpdateUserAvatar_InvalidRequest**: Case of trying to send an invalid request to the endpoint
- **TestUpdateUserAvatar_UpdateError**: Case of error while trying to update avatar
- **TestUpdateUserAvatar_Success**: Case of successfully updating avatar

---

## **Documentation of Backend API**

### **User Management**

#### **Get User Reviews**
- **URL**: /users/reviews
- **Method**: GET
- **Handler**: GetUserReviewsHandler(db)
- **Description**: Returns the reviews added by the currently logged in user.
- **Query Parameters**: None
- **Response**: 
  - Success (200 OK): List of reviews
  - Unauthorized (401): User not authenticated
  - Error (500 Internal Server Error): Database error

#### **Update Avatar ID**
- **URL**: /users/avatar
- **Method**: PUT
- **Handler**: UpdateUserAvatarHandler(db)
- **Description**: Updates the Avatar string in the users table.
- **Query Parameters**: avatar_id: string
- **Response**: 
  - Success (200 OK): Avatar updated successfully 
  - Bad request (400): Invalid request format
  - Unauthorized (401): User not authenticated
  - Error (500 Internal Server Error): Problem with session retrieval

### **Data Models**

#### **Updated Event**
- Additional fields from Sprint 3:
  - Coordinates: Coordinates for navigation (string)

#### **Updated EventResponse**
- Additional field from Sprint 3:
  - Coordinates: Coordinates of the event (string)

#### **Updated Accommodation**
- Additional field from Sprint 3:
  - Coordinates: Coordinates for navigation (string)