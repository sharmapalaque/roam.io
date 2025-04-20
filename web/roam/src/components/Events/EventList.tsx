import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider,
  Button,
  LinearProgress
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Language as LanguageIcon,
  Navigation as NavigationIcon,
} from "@mui/icons-material";
import Header from "../Header/Header";
import "./EventList.css";

// Event type definition
type Event = {
  ID: number;
  Name: string;
  Organizer: {
    Name: string;
    Email: string;
    Phone: string;
  };
  Location: string;
  Coordinates: string; // Added coordinates property
  Date: string;
  Time: string;
  Images: string[];
  Description: string;
  Price: number;
  AvailableSeats: number;
  TotalSeats: number;
  OfficialLink: string;
};

// Dummy data for events (keeping it here just for backup and future reference)
const eventsData: Event[] = [
  {
    ID: 1,
    Name: "Annual Tech Conference",
    Organizer: {
      Name: "TechCorp Inc.",
      Email: "events@techcorp.com",
      Phone: "+1 (555) 123-4567"
    },
    Location: "San Francisco, CA",
    Coordinates: "37.7749,-122.4194", // Added coordinates
    Date: "2025-04-15",
    Time: "09:00 AM - 05:00 PM",
    Images: [
      "https://i.imgur.com/YXEVTDa.jpeg",
      "https://i.imgur.com/RA4oaru.jpeg",
      "https://i.imgur.com/dokBiQF.jpeg"
    ],
    Description: "Join us for the biggest tech conference of the year! Featuring keynote speakers from leading tech companies, hands-on workshops, networking opportunities, and the latest in tech innovation. Perfect for professionals, enthusiasts, and anyone interested in the future of technology.",
    Price: 299,
    AvailableSeats: 128,
    TotalSeats: 500,
    OfficialLink: "https://techtalkconference.com"
  },
  {
    ID: 2,
    Name: "Summer Music Festival",
    Organizer: {
      Name: "Melody Events",
      Email: "contact@melodyevents.com",
      Phone: "+1 (555) 987-6543"
    },
    Location: "Austin, TX",
    Coordinates: "30.2672,-97.7431", // Added coordinates
    Date: "2025-06-20",
    Time: "12:00 PM - 11:00 PM",
    Images: [
      "https://i.imgur.com/Ca0jj7R.jpeg",
      "https://i.imgur.com/zR8atqt.jpeg",
      "https://i.imgur.com/UQS4MnK.jpeg"
    ],
    Description: "Experience three days of amazing live music across five stages featuring top artists from around the world. Food vendors, art installations, and camping options available. Don't miss the biggest music event of the summer!",
    Price: 149,
    AvailableSeats: 2500,
    TotalSeats: 10000,
    OfficialLink: "https://summermusicfest.com"
  },
  {
    ID: 3,
    Name: "Business Leadership Summit",
    Organizer: {
      Name: "Enterprise Growth Partners",
      Email: "info@egp.com",
      Phone: "+1 (555) 234-5678"
    },
    Location: "New York, NY",
    Coordinates: "40.7128,-74.0060", // Added coordinates
    Date: "2025-05-10",
    Time: "08:30 AM - 04:30 PM",
    Images: [
      "https://i.imgur.com/lycQOFd.jpeg",
      "https://i.imgur.com/3plJ3Tm.jpeg",
      "https://i.imgur.com/7S1j0w0.jpeg"
    ],
    Description: "A premier gathering of business leaders and executives to discuss emerging trends, challenges, and opportunities in today's global marketplace. Features keynote speeches, panel discussions, and exclusive networking events.",
    Price: 499,
    AvailableSeats: 75,
    TotalSeats: 200,
    OfficialLink: "https://businessleadershipsummit.com"
  },
  {
    ID: 4,
    Name: "Culinary Festival",
    Organizer: {
      Name: "Gourmet Events",
      Email: "taste@gourmetevents.com",
      Phone: "+1 (555) 876-5432"
    },
    Location: "Chicago, IL",
    Coordinates: "41.8781,-87.6298", // Added coordinates
    Date: "2025-07-08",
    Time: "11:00 AM - 08:00 PM",
    Images: [
      "https://i.imgur.com/ygKZrG7.jpeg",
      "http://i.imgur.com/DVgKgcv.jpeg",
      "https://i.imgur.com/7w61fts.jpeg"
    ],
    Description: "Celebrate the art of cooking with world-renowned chefs, cooking demonstrations, tastings, and food competitions. Explore cuisines from around the world and discover new flavors and techniques.",
    Price: 85,
    AvailableSeats: 350,
    TotalSeats: 1000,
    OfficialLink: "https://culinaryfestival.com"
  }
];

// Get unique locations for filter dropdown
const locations = [...new Set(eventsData.map(event => event.Location))];

const EventList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(eventsData);
  
  // State for the active tab (selected event)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  // State for the selected image in the gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  
  // State for number of tickets to book
  const [ticketCount, setTicketCount] = useState<number>(1);

  // Filter events based on search term only (location filtering handled by backend)
  useEffect(() => {
    // setup for doing a REST API call
    // Construct query string with parameters
    const queryParams = new URLSearchParams({
      location: locationFilter,
    });

    // get data from backend based on REST API call
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/events?${queryParams.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Check if response status is NOT ok
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Log the raw response text before parsing
        // we are doing so that next part of code waits while we fetch response from server
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        // Try to parse the response as JSON
        try {
          const result: Event[] = JSON.parse(responseText);
          console.log("lets' see response");
          console.log(result);

          const filtered = result.filter(event => {
            const matchesSearch = 
              event.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.Description.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesSearch;
          });
          
          setFilteredEvents(filtered);
          
          // If current selection is no longer in filtered list, clear selection
          if (selectedEventId && !filtered.some(event => event.ID === selectedEventId)) {
            setSelectedEventId(null);
          }
          
          // If this is initial load and we have events, select the first one
          if (!selectedEventId && filtered.length > 0) {
            setSelectedEventId(filtered[0].ID);
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Failed to parse response");
        }
      } catch (error) {
        alert(error);
      }
    };

    // this method has been defined above which deals with REST API call
    fetchData();
  }, [searchTerm, locationFilter]);

  // Handle location filter change - this would trigger a backend API call in a real app
  const handleLocationChange = (newLocation: string) => {
    setLocationFilter(newLocation);
    // In a real implementation, would call backend API with the location parameter
    // For now, let's simulate a backend filtering response with setTimeout
    console.log(`Backend would filter by location: ${newLocation}`);
  };
  
  // Handle card click - set the selected event
  const handleEventCardClick = (id: number) => {
    setSelectedEventId(id);
    setSelectedImageIndex(0); // Reset image index when switching events
  };
  
  // Get the currently selected event
  const selectedEvent = selectedEventId 
    ? filteredEvents.find(event => event.ID === selectedEventId) 
    : null;
  
  // Handle Navigate Me button click
  const handleNavigateMe = () => {
    if (selectedEvent?.Coordinates) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.Coordinates}`, '_blank');
    } else {
      alert("Navigation coordinates are not available for this event.");
    }
  };
  
  // Handle booking button click
  const handleBookNow = () => {
    if (!selectedEvent) return;
    
    // In a real app, this would send the booking data to a backend
    console.log(selectedEventId, ticketCount, selectedEvent.Price * ticketCount + 10 * ticketCount)
    // alert(`Booked ${ticketCount} ticket(s) for ${selectedEvent.Name}!`);
    const total_cost = selectedEvent.Price * ticketCount + 10 * ticketCount;

    const sendBookingData = async () => {
      if (!selectedEventId) {
        console.error('ID is undefined');
        alert('ID is missing');
        return;
      }
    
      // Create query parameters using URLSearchParams
      const params = new URLSearchParams({
        event_id: selectedEventId.toString(),
        guests: ticketCount.toString(),
        total_cost: total_cost.toString()
        // Add other parameters here if needed
      });
  
      try {
        const response = await fetch(`http://localhost:8080/events?${params.toString()}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: "include", // Ensure cookies (like session IDs) are sent
        });
  
        if (response.ok) {
          alert('Booking has been confirmed!!!');
        } else {
          alert('Failed to book your accomodation :(');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error updating data');
      }
    };
    sendBookingData();
  };
  
  // Calculate if the book now button should be disabled
  const isBookingDisabled = !selectedEvent || ticketCount <= 0 || ticketCount > (selectedEvent?.AvailableSeats || 0);
  
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="app events-page">
      <Header />
      
      {/* Teal header background */}
      <Box className="teal-header"></Box>
      
      <main className="main-content">
        <h1 className="page-title">Discover Amazing Events</h1>
        
        {/* Filters */}
        <Box className="filter-container">
          <TextField
            className="search-input"
            placeholder="Search events..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="search-icon" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl className="location-filter">
            <InputLabel id="location-select-label">Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={locationFilter}
              onChange={(e) => handleLocationChange(e.target.value as string)}
              label="Location"
              displayEmpty
            >
              <MenuItem value="">All Locations</MenuItem>
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Simple spacer element */}
        <Box className="space-divider"></Box>
        
        {/* Events Grid and Details Container */}
        <Grid container spacing={4} className="events-grid-container">
          {/* Left Column: Events Grid */}
          <Grid item xs={12} md={4} className="events-list-container">
            <Grid container spacing={2} className="events-grid">
              {filteredEvents.map((event) => (
                <Grid item xs={12} key={event.ID}>
                  <Card 
                    className="event-card" 
                    onClick={() => handleEventCardClick(event.ID)}
                    sx={{
                      border: selectedEventId === event.ID ? `2px solid #70c9c2` : 'none',
                      boxShadow: selectedEventId === event.ID ? '0 0 8px rgba(112, 201, 194, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1) !important',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={event.Images[0]}
                      alt={event.Name}
                      className="event-image"
                    />
                    <CardContent className="card-content">
                      <Typography
                        variant="h6"
                        component="div"
                        className="event-name"
                      >
                        {event.Name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="event-location"
                      >
                        <LocationOnIcon className="location-icon" />
                        {event.Location}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="event-date"
                      >
                        <EventIcon className="date-icon" />
                        {new Date(event.Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="event-description"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {event.Description}
                      </Typography>
                      <Box className="seats-info">
                        <Typography variant="body2" className="seats-available">
                          {event.AvailableSeats} seats left
                        </Typography>
                        <Chip 
                          label={`$${event.Price}`} 
                          size="small"
                          className="seats-badge"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              {filteredEvents.length === 0 && (
                <Box className="no-results" sx={{ width: '100%' }}>
                  <Typography variant="h6">
                    No events found matching your criteria
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          
          {/* Right Column: Event Details and Booking */}
          <Grid item xs={12} md={8} className="events-details-wrapper">
            {selectedEvent ? (
              <Grid container spacing={3}>
                {/* Event Details Section */}
                <Grid item xs={12} md={8}>
                  {/* Event header info with improved formatting */}
                  <Box className="event-details-header">
                    <Typography variant="h5" className="event-details-title">
                      {selectedEvent.Name}
                    </Typography>
                    <Box className="event-details-meta">
                      <Typography variant="body1" className="event-details-location">
                        <LocationOnIcon sx={{ mr: 1 }} />
                        {selectedEvent.Location}
                      </Typography>
                      <Typography variant="body1" className="event-details-date">
                        <EventIcon sx={{ mr: 1 }} />
                        {formatDate(selectedEvent.Date)} • {selectedEvent.Time}
                      </Typography>
                    </Box>
                  </Box>
                
                  {/* Image gallery */}
                  <Box className="image-gallery">
                    <Box className="main-image-container">
                      <img
                        src={selectedEvent.Images[selectedImageIndex]}
                        alt={`${selectedEvent.Name} - Large view`}
                        className="main-image"
                      />
                    </Box>
                    <Box className="thumbnail-container">
                      {selectedEvent.Images.map((image, index) => (
                        <Box
                          key={index}
                          className={`thumbnail ${selectedImageIndex === index ? 'selected' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`${selectedEvent.Name} - Thumbnail ${index + 1}`}
                            className="thumbnail-image"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  {/* Event description */}
                  <Box className="event-section">
                    <Typography variant="h6" className="section-title">
                      Description
                    </Typography>
                    <Typography variant="body1" className="description-text">
                      {selectedEvent.Description}
                    </Typography>
                  </Box>
                  
                  {/* Organizer info */}
                  <Box className="event-section">
                    <Typography variant="h6" className="section-title">
                      Organized by {selectedEvent.Organizer.Name}
                    </Typography>
                    <Box className="organizer-details">
                      <Box className="organizer-contact">
                        <Box className="contact-item">
                          <PhoneIcon className="contact-icon" />
                          <Typography variant="body2" sx={{ ml: 1 }}>{selectedEvent.Organizer.Phone}</Typography>
                        </Box>
                        <Box className="contact-item">
                          <MailIcon className="contact-icon" />
                          <Typography variant="body2" sx={{ ml: 1 }}>{selectedEvent.Organizer.Email}</Typography>
                        </Box>
                        <Box className="contact-item">
                          <LanguageIcon className="contact-icon" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            <a href={selectedEvent.OfficialLink} target="_blank" rel="noopener noreferrer">
                              Official Event Website
                            </a>
                          </Typography>
                        </Box>
                        {/* Added Navigate Me button */}
                        <Box className="contact-item" sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={<NavigationIcon />}
                            onClick={handleNavigateMe}
                            sx={{
                              backgroundColor: "#70c9c2",
                              "&:hover": { backgroundColor: "#5bb8b1" },
                              color: "white",
                              width: "40%",
                              textTransform: "uppercase",
                              fontWeight: 500
                            }}
                          >
                            NAVIGATE ME
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Booking Panel */}
                <Grid item xs={12} md={4}>
                  <Box className="booking-panel">
                    <Typography variant="h6" className="booking-panel-title" align="center" gutterBottom>
                      Book This Event
                    </Typography>
                    
                    <Box className="price-container">
                      <Typography variant="h5" className="price" color="#70c9c2" fontWeight="bold">
                        ${selectedEvent.Price}
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 1 }} color="text.secondary">
                        / ticket
                      </Typography>
                    </Box>
                    
                    <Box className="seats-container">
                      <Typography variant="body2" align="center" gutterBottom>
                        Availability
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(selectedEvent.AvailableSeats / selectedEvent.TotalSeats) * 100} 
                        className="seats-progress"
                        sx={{
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#70c9c2'
                          }
                        }}
                      />
                      <Typography variant="body2" className="seats-text">
                        {selectedEvent.AvailableSeats} out of {selectedEvent.TotalSeats} seats available
                      </Typography>
                    </Box>
                    
                    <Box className="guests-container">
                      <Typography variant="body2" gutterBottom align="left">
                        Number of Tickets
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        value={ticketCount}
                        onChange={(e) => setTicketCount(parseInt(e.target.value))}
                        SelectProps={{
                          native: true,
                        }}
                        size="small"
                      >
                        {/* Create options based on available seats, max 10 */}
                        {[...Array(Math.min(10, selectedEvent.AvailableSeats))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </TextField>
                    </Box>
                    
                    {ticketCount > 0 && (
                      <Box className="price-breakdown">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            ${selectedEvent.Price} x {ticketCount} ticket(s)
                          </Typography>
                          <Typography variant="body2">
                            ${selectedEvent.Price * ticketCount}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Booking fee</Typography>
                          <Typography variant="body2">${10 * ticketCount}</Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body1" fontWeight="bold">
                            Total
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            ${selectedEvent.Price * ticketCount + 10 * ticketCount}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    <Button
                      variant="contained"
                      fullWidth
                      className="book-now-button"
                      onClick={handleBookNow}
                      disabled={isBookingDisabled}
                      sx={{
                        backgroundColor: "#70c9c2",
                        "&:hover": { backgroundColor: "#5bb8b1" },
                        "&:disabled": { backgroundColor: "#cccccc" },
                        py: 1.5,
                        textTransform: "uppercase",
                        fontWeight: 500
                      }}
                    >
                      BOOK NOW
                    </Button>
                    
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box className="no-results">
                <Typography variant="h6">
                  Select an event to see details
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </main>
    </div>
  );
};

export default EventList;