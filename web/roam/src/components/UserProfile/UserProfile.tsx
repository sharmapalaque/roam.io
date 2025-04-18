import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  Drawer,
  TextField,
  Button,
  InputAdornment,
  Rating
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Close,
  LocationOn,
  CalendarToday,
  Star,
  Person
} from '@mui/icons-material';
import Header from '../Header/Header';
import './UserProfile.css';

// Define interface for avatars
interface AvatarOption {
  id: string;
  src: string;
  name: string;
}

// Define interface for booking cards (common fields)
interface BaseBooking {
  id: number;
  name: string;
  location: string;
  image: string;
  date: string;
  status: 'upcoming' | 'past' | 'cancelled';
}

// Accommodation specific fields
interface AccommodationBooking extends BaseBooking {
  type: 'accommodation';
  checkIn: string;
  checkOut: string;
  guests: number; // Added guests field
}

// Event specific fields
interface EventBooking extends BaseBooking {
  type: 'event';
  organizer: string;
  seats: number;
  availableSeats: number;
}

// Union type for bookings
type Booking = AccommodationBooking | EventBooking;

// Interface for reviews
interface Review {
  id: number;
  itemId: number;
  itemType: 'accommodation' | 'event';
  itemName: string;
  rating: number;
  comment: string;
  date: string;
}

// Interface for user data
interface UserData {
  name: string;
  email: string;
  avatarId: string;
}

// Avatar options
const avatarOptions: AvatarOption[] = [
  { id: 'Bluey', src: '../../../public/avatars/Bluey.png', name: 'Bluey' },
  { id: 'Marshmallow', src: 'https://i.imgur.com/EP6TJA7.png', name: 'Marshmallow' },
  { id: 'Mocha', src: '../../../public/avatars/Mocha.png', name: 'Mocha' },
  { id: 'Nugget', src: '../../../public/avatars/Nugget.png', name: 'Nugget' },
  { id: 'Pearl', src: '../../../public/avatars/Pearl.png', name: 'Pearl' },
  { id: 'Pebbles', src: '../../../public/avatars/Pebbles.png', name: 'Pebbles' },
  { id: 'Pip', src: '../../../public/avatars/Pip.png', name: 'Pip' },
  { id: 'Rusty', src: '../../../public/avatars/Rusty.png', name: 'Rusty' },
  { id: 'Sirius', src: '../../../public/avatars/Sirius.png', name: 'Sirius' },
  { id: 'Snuffles', src: '../../../public/avatars/Snuffles.png', name: 'Snuffles' },
  { id: 'Stripe', src: '../../../public/avatars/Stripe.png', name: 'Stripe' },
  { id: 'Thumper', src: '../../../public/avatars/Thumper.png', name: 'Thumper' },
];

// Dummy booking data with guest counts added
const dummyBookings: Booking[] = [
  {
    id: 1,
    type: 'accommodation',
    name: 'Ocean View Apartment',
    location: 'Miami, FL',
    image: '../../../public/Pasted image.png',
    checkIn: '2023-11-15',
    checkOut: '2023-11-20',
    date: '2023-11-15',
    status: 'past',
    guests: 2
  },
  {
    id: 2,
    type: 'accommodation',
    name: 'Mountain Cabin',
    location: 'Aspen, CO',
    image: '../../../public/Pasted image.png',
    checkIn: '2023-12-10',
    checkOut: '2023-12-15',
    date: '2023-12-10',
    status: 'past',
    guests: 4
  },
  {
    id: 3,
    type: 'accommodation',
    name: 'City Center Studio',
    location: 'New York, NY',
    image: '../../../public/Pasted image.png',
    checkIn: '2024-05-20',
    checkOut: '2024-05-25',
    date: '2024-05-20',
    status: 'upcoming',
    guests: 1
  }
];

// Dummy reviews
const dummyReviews: Review[] = [
  {
    id: 101,
    itemId: 1,
    itemType: 'accommodation',
    itemName: 'Ocean View Apartment',
    rating: 4.5,
    comment: 'Beautiful views and very clean apartment. The kitchen was well-equipped and the location was perfect. Highly recommend!',
    date: '2023-11-21'
  }
];

// Tab panel component for accessibility
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      className="tab-panel-container"
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main UserProfile component
const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [subtabValue, setSubtabValue] = useState(0);
  const [isAvatarDrawerOpen, setIsAvatarDrawerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // for updating data based on API response
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // User data (this would come from a backend)
  const [userData, setUserData] = useState<UserData>({
    name: 'Palaque Sharma',
    email: 'sharmapalaque@example.com',
    avatarId: 'Marshmallow'
  });

  // State for current avatar
  const [currentAvatar, setCurrentAvatar] = useState<AvatarOption | null>(null);

  // Find avatar by ID from userData
  useEffect(() => {
    const avatar = avatarOptions.find(avatar => avatar.id === userData.avatarId);
    setCurrentAvatar(avatar || avatarOptions[0]);
  }, [userData.avatarId]);

  function isDateOlderThanCurrent(givenDate: string) {
    const currentDate = new Date();
    const dateToCheck = new Date(givenDate);
  
    if (dateToCheck < currentDate) {
      return 'past';
    } else {
      return 'upcoming';
    }
  }
  

  // to get data from server (keep it separate, else with avatar change it will be called every single time)
    useEffect(() => {
      // In a real application, this would be an API call
      const fetchUserData = async () => {        
        try {
          const response = await fetch(
            `http://localhost:8080/users/profile?`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Ensure cookies (like session IDs) are sent
            }
          );
  
          // Check if response status is NOT ok
          if (!response.ok) {
            // Specifically handle 401 Unauthorized without an alert
            if (response.status === 401) {
              console.log("User not authenticated. Profile data not loaded.");
              // setUserData(null); // Ensure user data is cleared
              return; // Exit the function early
            }
            // For other errors, throw the error to be caught below
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
  
          // Log the raw response text before parsing
          const responseText = await response.text();
          console.log("Raw profile response text:", responseText);
  
          // Try to parse the response as JSON
          try {
            const result = JSON.parse(responseText);
            console.log("User profile response:", result);
            // Assuming the profile endpoint returns an object with name and avatarId
            // setUserData({ name: result.name, avatarId: result.avatar_url }); 

            const currentUser: UserData = {
              name: result.name,
              email: result.email,
              avatarId: 'Marshmallow'
            }
            setUserData(currentUser)

            console.log(result.bookings);
            console.log(result.event_bookings);

            console.log(result.bookings.length)

            // add accomodation bookings
            result.bookings.map((currentBooking: any) => {
              console.log(currentBooking.id);
              const given_date = currentBooking.checkin_date.split('T')[0];

              const newBooking: Booking = {
                id: currentBooking.id,
                type: "accommodation",
                name: currentBooking.accommodation.name,
                location: currentBooking.accommodation.location,
                image: currentBooking.accommodation.image_url,
                checkIn: given_date,
                checkOut: currentBooking.checkout_date.split('T')[0],
                date: new Date().toISOString().split('T')[0],
                status: isDateOlderThanCurrent(given_date),
                guests: currentBooking.guests 
              };

              setBookings(bookings => [...bookings, newBooking]);
            })

            // add event bookings
            result.event_bookings.map((currentBooking: any) => {
              console.log(currentBooking.id);

              const newBooking: Booking = {
                id: currentBooking.id,
                type: "event",
                name: currentBooking.event.name,
                location: currentBooking.event.location,
                image: currentBooking.event.image,
                date: '2025-04-15',
                status: 'upcoming',
                organizer: 'Unknown',
                seats: 10,
                availableSeats: 10
              };

              setBookings(bookings => [...bookings, newBooking]);
            })
            
  
          } catch (error) {
            console.error("Error parsing profile JSON:", error);
            // Optionally alert or handle JSON parsing error differently
            // alert("Failed to parse profile response"); 
          }
        } catch (error) {
          // This will now catch network errors or non-401 HTTP errors
          console.error("Error fetching user profile:", error);
          // Avoid alerting for general fetch errors unless needed
          // alert(error); 
          // setUserData(null);
        }
      };
  
      fetchUserData();
    }, []);

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSubtabValue(0); // Reset subtab when main tab changes
  };

  // Handle subtab change
  const handleSubtabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSubtabValue(newValue);
  };

  // Toggle avatar drawer
  const toggleAvatarDrawer = () => {
    setIsAvatarDrawerOpen(!isAvatarDrawerOpen);
  };

  // Select avatar and update user data
  const selectAvatar = (avatar: AvatarOption) => {
    setCurrentAvatar(avatar);
    // Update user data with new avatar ID
    const updatedUserData = {
      ...userData,
      avatarId: avatar.id
    };
    setUserData(updatedUserData);
    setIsAvatarDrawerOpen(false);
    
    /*
    fetch('/api/user/update-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarId: avatar.id }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Avatar updated successfully:', data);
      })
      .catch(error => {
        console.error('Error updating avatar:', error);
      });
    */
    
    console.log('API call would be made to update avatar to:', avatar.id);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle security field change
  const handleSecurityChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecurityData({
      ...securityData,
      [field]: event.target.value
    });
  };

  // Handle password update
  const handleUpdatePassword = () => {
    // In a real app, this would call an API to update the password
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    
    /*
    fetch('/api/user/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Password updated successfully:', data);
      })
      .catch(error => {
        console.error('Error updating password:', error);
      });
    */
    
    console.log('API call would be made to update password');
    alert("Password would be updated");
    setSecurityData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Delete booking
  const handleDeleteBooking = (bookingId: number) => {
    // In a real app, this would call an API to delete the booking
    alert(`Booking ${bookingId} would be deleted`);
  };

  // View booking details
  const handleViewBooking = (booking: Booking) => {
    // Navigate to details page
    if (booking.type === 'accommodation') {
      navigate(`/details/${booking.id}`);
    } else {
      navigate(`/events/${booking.id}`);
    }
  };

  // Filter bookings by type and status
  const getBookingsByType = (type: 'accommodation' | 'event', status?: 'upcoming' | 'past') => {
    return bookings.filter(booking => 
      booking.type === type && 
      (status ? booking.status === status : true)
    );
  };

  // Filter reviews by type
  const getReviewsByType = (type: 'accommodation' | 'event') => {
    return dummyReviews.filter(review => review.itemType === type);
  };

  // Function to format date in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Function to render booking card
  const renderBookingCard = (booking: Booking) => {
    return (
      <Card key={booking.id} className="booking-card">
        <Box className="booking-card-content">
          <Box className="booking-image-container">
            <img
              src={booking.image}
              alt={booking.name}
              className="booking-image"
            />
          </Box>
          <CardContent className="booking-details">
            <Typography variant="h6" className="booking-title">
              {booking.name}
            </Typography>
            
            <Box className="booking-location">
              <LocationOn className="location-icon" />
              <Typography variant="body2">{booking.location}</Typography>
            </Box>
            
            <Box className="booking-dates">
              <CalendarToday className="calendar-icon" />
              <Typography variant="body2">
                {booking.type === 'accommodation' ? 
                  `${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}` : 
                  formatDate(booking.date)
                }
              </Typography>
            </Box>
            
            {/* Display number of guests for accommodation bookings */}
            {booking.type === 'accommodation' && (
              <Box className="booking-guests">
                <Person className="guests-icon" />
                <Typography variant="body2">
                  {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Box>
        
        <Box className="booking-actions">
          <IconButton 
            className="view-button" 
            onClick={() => handleViewBooking(booking)}
            aria-label="View details"
          >
            <Visibility />
          </IconButton>
          
          {booking.status === 'upcoming' && (
            <IconButton 
              className="delete-button" 
              onClick={() => handleDeleteBooking(booking.id)}
              aria-label="Cancel booking"
            >
              <Delete />
            </IconButton>
          )}
        </Box>
      </Card>
    );
  };

  // Function to render review card with star ratings
  const renderReviewCard = (review: Review) => {
    return (
      <Card key={review.id} className="review-card">
        <CardContent>
          <Box className="review-header">
            <Typography variant="h6" className="review-title">
              {review.itemName}
            </Typography>
            <Typography variant="body2" className="review-date">
              {formatDate(review.date)}
            </Typography>
          </Box>
          
          {/* Added star rating from Material-UI */}
          <Box sx={{ textAlign: 'left', mb: 2 }}>
            <Rating
              value={review.rating}
              precision={0.5}
              readOnly
              size="small"
              sx={{ color: '#70c9c2' }}
            />
          </Box>
          
          <Typography variant="body2" className="review-comment">
            {review.comment}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  // Render empty state consistently
  const renderEmptyState = (message: string) => (
    <Box className="empty-state">
      <Typography variant="body1" className="empty-message">
        {message}
      </Typography>
    </Box>
  );

  return (
    <div className="page-wrapper">
      <Header />
      
      <Box className="profile-page">
        {/* Teal header background with styling to match accommodation page */}
        <Box className="teal-header profile-header">
          <Container maxWidth="lg" className="profile-container">
            <Box className="profile-header-content">
              <Box className="avatar-and-name">
                <Box className="avatar-container">
                  <div className="user-avatar-wrapper" onClick={toggleAvatarDrawer}>
                    {currentAvatar ? (
                      <div className="user-avatar-image-container">
                        <img src={currentAvatar.src} alt={currentAvatar.name} className="user-avatar-image" />
                      </div>
                    ) : (
                      <div className="user-avatar-placeholder">J</div>
                    )}
                    <div className="edit-avatar-button-wrapper">
                      <Edit className="edit-icon" />
                    </div>
                  </div>
                </Box>
                <Typography variant="h3" className="user-name">
                  {userData.name}
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        <Container maxWidth="lg" className="profile-content-container">
          <Box className="profile-tabs-container">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              className="main-tabs"
              variant="standard"
              indicatorColor="primary"
            >
              <Tab label="ACCOMMODATIONS" className="main-tab" />
              <Tab label="EVENTS" className="main-tab" />
              <Tab label="SECURITY" className="main-tab" />
            </Tabs>
            
            {/* Accommodation Tab */}
            <TabPanel value={tabValue} index={0}>
              <Box className="tab-content">
                <Tabs 
                  value={subtabValue} 
                  onChange={handleSubtabChange} 
                  className="sub-tabs"
                >
                  <Tab label="BOOKINGS" className="sub-tab" />
                  <Tab label="REVIEWS" className="sub-tab" />
                </Tabs>
                
                {/* Accommodation Bookings */}
                <TabPanel value={subtabValue} index={0}>
                  <Box className="bookings-container">
                    {getBookingsByType('accommodation', 'upcoming').length > 0 && (
                      <Box className="bookings-section">
                        <Typography variant="h6" className="section-title">
                          UPCOMING BOOKINGS
                        </Typography>
                        <Box className="bookings-list">
                          {getBookingsByType('accommodation', 'upcoming').map(renderBookingCard)}
                        </Box>
                      </Box>
                    )}
                    
                    {getBookingsByType('accommodation', 'past').length > 0 && (
                      <Box className="bookings-section">
                        <Typography variant="h6" className="section-title">
                          PAST BOOKINGS
                        </Typography>
                        <Box className="bookings-list">
                          {getBookingsByType('accommodation', 'past').map(renderBookingCard)}
                        </Box>
                      </Box>
                    )}
                    
                    {getBookingsByType('accommodation').length === 0 && (
                      renderEmptyState("You don't have any accommodation bookings yet.")
                    )}
                  </Box>
                </TabPanel>
                
                {/* Accommodation Reviews */}
                <TabPanel value={subtabValue} index={1}>
                  <Box className="reviews-container">
                    <Typography variant="h6" className="section-title">
                      REVIEWS
                    </Typography>
                    {getReviewsByType('accommodation').length > 0 ? (
                      getReviewsByType('accommodation').map(renderReviewCard)
                    ) : (
                      renderEmptyState("You haven't submitted any accommodation reviews yet.")
                    )}
                  </Box>
                </TabPanel>
              </Box>
            </TabPanel>
            
            {/* Events Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box className="tab-content">
                <Tabs 
                  value={subtabValue} 
                  onChange={handleSubtabChange} 
                  className="sub-tabs"
                >
                  <Tab label="BOOKINGS" className="sub-tab" />
                  <Tab label="REVIEWS" className="sub-tab" />
                </Tabs>

                {/* Event Bookings */}
                <TabPanel value={subtabValue} index={0}>
                  <Box className="bookings-container">
                    {getBookingsByType('event', 'upcoming').length > 0 && (
                      <Box className="bookings-section">
                        <Typography variant="h6" className="section-title">
                          UPCOMING BOOKINGS
                        </Typography>
                        <Box className="bookings-list">
                          {getBookingsByType('event', 'upcoming').map(renderBookingCard)}
                        </Box>
                      </Box>
                    )}
                    
                    {getBookingsByType('event', 'past').length > 0 && (
                      <Box className="bookings-section">
                        <Typography variant="h6" className="section-title">
                          PAST BOOKINGS
                        </Typography>
                        <Box className="bookings-list">
                          {getBookingsByType('event', 'past').map(renderBookingCard)}
                        </Box>
                      </Box>
                    )}
                    
                    {getBookingsByType('event').length === 0 && (
                      renderEmptyState("You don't have any accommodation bookings yet.")
                    )}
                  </Box>
                </TabPanel>
                
                {/* Event Reviews - Empty placeholder for now */}
                <TabPanel value={subtabValue} index={1}>
                  <Box className="reviews-container">
                    <Typography variant="h6" className="section-title">
                      REVIEWS
                    </Typography>
                    {renderEmptyState("You haven't submitted any event reviews yet.")}
                  </Box>
                </TabPanel>
              </Box>
            </TabPanel>

            {/* Security Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box className="tab-content">
                <Typography variant="h6" className="section-title">
                  SECURITY
                </Typography>
                <Box className="security-container">
                  <Box className="security-field">
                    <Typography variant="body1" className="security-label">
                      Email ID
                    </Typography>
                    <Typography variant="body1" className="security-value">
                      {userData.email}
                    </Typography>
                  </Box>
                                    
                  <Box className="update-password-container">
                    <Typography variant="h6" className="update-password-title">
                      UPDATE PASSWORD
                    </Typography>
                    
                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="Current Password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={securityData.currentPassword}
                      onChange={handleSecurityChange('currentPassword')}
                      className="security-input"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="New Password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={securityData.newPassword}
                      onChange={handleSecurityChange('newPassword')}
                      className="security-input"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <TextField
                      type={showPassword ? "text" : "password"}
                      label="Confirm New Password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={securityData.confirmPassword}
                      onChange={handleSecurityChange('confirmPassword')}
                      className="security-input"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    
                    <Button
                      variant="contained"
                      onClick={handleUpdatePassword}
                      className="update-password-button"
                    >
                      Update Password
                    </Button>
                  </Box>
                </Box>
              </Box>
            </TabPanel>
          </Box>
        </Container>
      </Box>
      
      {/* Avatar selection drawer */}
      <Drawer
        anchor="right"
        open={isAvatarDrawerOpen}
        onClose={toggleAvatarDrawer}
        className="avatar-drawer"
      >
        <Box className="avatar-drawer-content">
          <Box className="avatar-drawer-header">
            <Typography variant="h6">Choose Your Avatar</Typography>
            <IconButton 
              onClick={toggleAvatarDrawer}
              aria-label="Close drawer"
            >
              <Close />
            </IconButton>
          </Box>
          
          <Grid container spacing={2} className="avatar-grid">
            {avatarOptions.map((avatar) => (
              <Grid item xs={4} key={avatar.id}>
                <div 
                  className={`avatar-option ${currentAvatar && currentAvatar.id === avatar.id ? 'selected' : ''}`}
                  onClick={() => selectAvatar(avatar)}
                >
                  <img
                    src={avatar.src}
                    alt={avatar.name}
                    className="avatar-option-image"
                  />
                  <Typography variant="body2" className="avatar-name">
                    {avatar.name}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Drawer>
    </div>
  );
};

export default UserProfile;