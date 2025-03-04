# Sprint 2 Report for Roam.io

## **Progress**

### **1. Feature Development**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **23** | **Create Listview template for the accommodation booking page** | Completed the list view template with improved UI for displaying available accommodations |
| **29** | **Accommodation Booking: Front End** | Implemented user interface for viewing and booking accommodations |
| **30** | **Accommodation Booking: Back End** | Developed API endpoints and database integration for accommodation booking functionality |
| **31** | **User Profile: Front End** | Created user profile page allowing users to view and edit their personal information |
| **32** | **User Profile: Back End** | Implemented backend services for storing and retrieving user profile information |
| **33** | **Delete Accommodation Booking: Front End** | Added UI components to allow users to cancel their existing bookings |
| **34** | **Delete Accommodation Booking: Back End** | Created API endpoints to handle deletion of accommodation bookings in the database |
| **48** | **Create universal header for the website** | Designed and implemented a consistent header component across all pages |
| **50** | **Integrate frontend with backend** | Added Fetch API calls for Login, Register and Landing pages. Implemented routing on 200 response from the server and functionality for modifying accommodation based on search or filters |

### **2. Bug-Fixes and Clean-Up**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **45** | **Resolve gorm db issue on adding booking for user** | Fixed database issue that was preventing proper booking creation in the system |
| **52** | **Unable to connect to backend server** | Fixed connection issues between frontend and backend components |
| **57** | **Remove unnecessary files from React** | Code cleanup activity which was observed at the end of sprint 1 and performed in sprint 2 |
| **65** | **Fix the gradient background for UserProfile page** | Resolved UI issue with background display on the user profile page |

### **3. Testing**

| **Serial No.** | **Description** | **Details** |
|----------------|-----------------|-------------|
| **54** | **Cypress integration with React** | Added Cypress packages and dependencies, created test cases for each of the components |
| **68** | **Add UTs for components developed so far** | Added dependencies for Jest, React Testing Library and JSDOM, created mocks and wrote tests |
| **-** | **UTs for Backend** | Implemented unit tests targeted with the respective issues of development, including tests for previously developed features that were also clubbed with these |

---

## **Frontend Unit Tests**

### **Test Names by Component**

#### **1. App Component (app-test.js)**
- Renders router structure
- Renders routes for all paths
- Renders login component on default route

#### **2. AccommodationDetails Component (accommodation-details.test.js)**
- Renders accommodation details
- Renders booking panel
- Book Now button is initially present
- Can enter booking dates
- Clicking Book Now button navigates to bookings page
- Not found state works for invalid ID

#### **3. AccommodationList Component (accommodation-list.test.js)**
- Renders page title and search components


#### **4. Header Component (header.test.js)**
- Renders logo and navigation links
- Shows loading state initially
- Loads user data after timeout
- Shows dropdown menu on hover
- Dropdown menu contains profile and logout links

#### **5. Login Component (login.test.js)**
- Renders login form elements

- Register link navigates correctly

#### **6. Register Component (register.test.js)**
- Renders registration form elements

- Login link navigates correctly

### **Mocked Elements List**

#### **Components**
- Login
- Register
- AccommodationList
- AccommodationDetails
- UserProfile
- Header

#### **Libraries/Modules**
- **react-router-dom:**
  - BrowserRouter
  - Routes
  - Route
  - MemoryRouter
  - useNavigate
  - useParams
- **Material UI components:**
  - Typography, Container, Grid, Paper, Box, Button
  - TextField, Rating, Divider, Chip, InputAdornment
  - FormControl, Select, MenuItem, InputLabel
  - IconButton, Tabs, Tab, Drawer, CardContent, CardMedia
- **MUI icons:**
  - SearchIcon, LocationOnIcon, Wifi, LocalParking, AcUnit
  - Kitchen, Pool, Tv, Home, Star, Phone, Mail, Edit
  - Delete, Visibility, VisibilityOff, Close, CalendarToday, Person
- **Lucide React icons:**
  - User, ChevronDown, Mail, Phone, Star, Edit
  - Visibility, VisibilityOff, Close, LocationOn, CalendarToday
  - Delete, Person
- **react-hook-form:**
  - useForm with register, handleSubmit, and formState
- **@hookform/resolvers/yup:**
  - yupResolver

#### **Browser APIs and Methods**
- window.alert
- console.log
- setTimeout

---

## **Cypress Tests**

### **Login**
1. Should render the login form *(checks if all required elements are there on the page)*
2. Should show validation errors for empty fields *(logs in with empty field and verifies error msgs)*
3. Should show validation error for invalid email *(verifies error thrown due to missing '@' symbol in email field)*
4. Should allow user to enter email and password *(verifies if user typed values is available in the respective fields)*
5. Should submit the form successfully *(verifies if user is able to submit form, with dummy credentials)*
6. Should navigate to register page on link click *(verifies if the redirection works fine)*

### **Register**
1. Should render the registration form *(checks if all required elements are there on the page)*
2. Should show validation error for empty fields *(clicks submit on empty form, to verify all the errors)*
3. Should show validation for invalid email *(validation for improper email format)*
4. Should submit form successfully and show success alert *(checks if proper success msg is shown by mocking API redirection)*

### **Header**
1. Should show loading state initially *(verifies if the avatar and greeting msgs are correct in header during loading stage)*
2. Should display logo correctly *(checks for the logo)*
3. Should display slogan text *(checks for the slogan text in header)*
4. Should display all navigation fields with correct hrefs *(verifies if all the items on header has correct hrefs associated with them)*

### **AccommodationList** *(uses mock API response data for testing purpose)*
1. Should display the page title correctly *(verifies existence of page title and matches the text)*
2. Should display all accommodations on initial load *(verifies the element counts on first load of the page)*
3. Should filter accommodations by search term *(check if correct item is being displayed as per searchTerm)*
4. Should filter accommodations by location *(checks if accommodations are getting filtered out by given location choice)*
5. Should display no results message when no accommodations match criteria *(verifies element visibility for invalid search option)*
6. Should display accommodation details correctly *(verifies if all the details are correct for 1st item in the elements list)*
7. Should reset location filter when "all locations" is selected *(verifies if all elements are visible again after the location filter has been reset)*
8. Should properly handle location filter selection via the DOM

---

## **Backend Unit Tests**

### **User Management Functions**
- TestCreateUserHandler: Tests the handler for user registration
- TestCreateUser: Verifies password hashing using bcrypt
- TestHashPassword: Tests user creation in the database
- TestLoginHandler: Validates user authentication
- TestGetUserProfile_Unauthenticated: Tests unauthorized access to user profiles
- TestGetUserProfile_UserNotFound: Verifies handling when users don't exist
- TestGetUserProfile_BookingsError: Tests error handling for booking retrieval issues
- TestGetUserProfile_Success: Validates successful user profile retrieval

### **Accommodation Functions**
- TestFetchAccommodations: Tests retrieval of all accommodations with optional location filtering
- TestFetchAccommodationById: Verifies retrieval of specific accommodations by ID
- TestCreateAccommodation: Tests creation of new accommodation listings

### **Booking Functions**
- TestAddBooking: Verifies creation of bookings for accommodations
- TestRemoveBookingByAccommodationID: Tests deletion of accommodation bookings
- TestGetBookingByUserID: Validates retrieval of bookings for specific users

---

## **Documentation of Backend API**

### **User Management**

#### **Register User**
- **URL**: /users/register
- **Method**: POST
- **Handler**: CreateUserHandler(db)
- **Description**: Creates a new user account
- **Request Body**: JSON with name, username, email, password, and date of birth
- **Response**: Returns user ID on success, appropriate error codes for invalid data or server issues

#### **Login**
- **URL**: /users/login
- **Method**: POST
- **Handler**: LoginHandler(db)
- **Description**: Authenticates a user and creates a session
- **Request Body**: JSON with email and password
- **Response**: Returns successful login message and user ID, with appropriate error codes for authentication failures

#### **Protected Endpoint**
- **URL**: /protected-endpoint
- **Method**: GET
- **Handler**: ProtectedEndpointHandler(db)
- **Description**: Example endpoint requiring authentication
- **Authentication**: Session cookie required
- **Response**: Returns access granted message and user details for authenticated users

### **Accommodation Management**

#### **Get All Accommodations**
- **URL**: /accommodations
- **Method**: GET
- **Handler**: FetchAccommodations(db)
- **Description**: Retrieves all accommodations with optional location filtering
- **Query Parameters**: location (optional)
- **Response**: Returns list of accommodations, with server error for database issues

#### **Get Accommodation by ID**
- **URL**: /accommodations/{id}
- **Method**: GET
- **Handler**: FetchAccommodationById(db)
- **Description**: Retrieves details of a specific accommodation
- **URL Parameters**: id (accommodation ID)
- **Response**: Returns accommodation details or appropriate error codes

#### **Create Accommodation**
- **URL**: /accommodations
- **Method**: POST
- **Handler**: CreateAccommodation(db)
- **Description**: Creates a new accommodation listing
- **Request Body**: JSON with accommodation details including name, location, images, and facilities
- **Response**: Returns created accommodation details or error messages

### **Booking Management**

#### **Add Booking**
- **URL**: /accommodations
- **Method**: PUT
- **Handler**: AddBooking(db)
- **Description**: Creates a booking for an accommodation
- **Authentication**: Session cookie required
- **Query Parameters**: accommodation_id, check_in_date, check_out_date, guests
- **Response**: Returns booking ID on success or appropriate error codes

#### **Remove Booking**
- **URL**: /accommodations
- **Method**: DELETE
- **Handler**: RemoveBooking(db)
- **Description**: Removes a booking for an accommodation
- **Authentication**: Session cookie required
- **Query Parameters**: accommodation_id
- **Response**: Returns success message or error codes for authentication/not found issues

### **Data Models**

#### **User**
- ID: Unique identifier (uint)
- Name: User's full name (string)
- Email: User's email address (string)
- Username: User's username (string)
- Password: Hashed password (string)
- Dob: Date of birth (time.Time)

#### **Accommodation**
- ID: Unique identifier (uint)
- Name: Accommodation name (string)
- Location: Geographical location (string)
- ImageUrls: Array of image URLs (pq.StringArray)
- UserReviews: User reviews (array)
- Description: Detailed description (string)
- Facilities: Available facilities (array)

#### **Booking**
- ID: Unique identifier (uint)
- UserID: ID of the user making the booking (uint)
- AccommodationID: ID of the booked accommodation (uint)
- CheckinDate: Check-in date (time.Time)
- CheckoutDate: Check-out date (time.Time)
- Guests: Number of guests (uint)

### **Authentication**
The API uses session-based authentication. After successful login, a session cookie is set which must be included in subsequent requests to protected endpoints. The session contains the user's ID which is used to authenticate and authorize operations.
