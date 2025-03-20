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
  OpenInNew as OpenInNewIcon
} from "@mui/icons-material";
import Header from "../Header/Header";
import "./EventList.css";

// Event type definition
type Event = {
  id: number;
  name: string;
  organizer: {
    name: string;
    email: string;
    phone: string;
  };
  location: string;
  date: string;
  time: string;
  images: string[];
  description: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  officialLink: string;
};

// Dummy data for events
const eventsData: Event[] = [
  {
    id: 1,
    name: "Annual Tech Conference",
    organizer: {
      name: "TechCorp Inc.",
      email: "events@techcorp.com",
      phone: "+1 (555) 123-4567"
    },
    location: "San Francisco, CA",
    date: "2025-04-15",
    time: "09:00 AM - 05:00 PM",
    images: [
      "../../../public/events/tech1.jpg",
      "../../../public/events/tech2.jpg",
      "../../../public/events/tech3.jpg"
    ],
    description: "Join us for the biggest tech conference of the year! Featuring keynote speakers from leading tech companies, hands-on workshops, networking opportunities, and the latest in tech innovation. Perfect for professionals, enthusiasts, and anyone interested in the future of technology.",
    price: 299,
    availableSeats: 128,
    totalSeats: 500,
    officialLink: "https://techtalkconference.com"
  },
  {
    id: 2,
    name: "Summer Music Festival",
    organizer: {
      name: "Melody Events",
      email: "contact@melodyevents.com",
      phone: "+1 (555) 987-6543"
    },
    location: "Austin, TX",
    date: "2025-06-20",
    time: "12:00 PM - 11:00 PM",
    images: [
      "../../../public/events/mf2.jpg",
      "../../../public/events/mf1.jpg",
      "../../../public/events/mf3.jpg"
    ],
    description: "Experience three days of amazing live music across five stages featuring top artists from around the world. Food vendors, art installations, and camping options available. Don't miss the biggest music event of the summer!",
    price: 149,
    availableSeats: 2500,
    totalSeats: 10000,
    officialLink: "https://summermusicfest.com"
  },
  {
    id: 3,
    name: "Business Leadership Summit",
    organizer: {
      name: "Enterprise Growth Partners",
      email: "info@egp.com",
      phone: "+1 (555) 234-5678"
    },
    location: "New York, NY",
    date: "2025-05-10",
    time: "08:30 AM - 04:30 PM",
    images: [
      "../../../public/events/bls2.jpg",
      "../../../public/events/bls1.jpg",
      "../../../public/events/bls3.jpg"
    ],
    description: "A premier gathering of business leaders and executives to discuss emerging trends, challenges, and opportunities in today's global marketplace. Features keynote speeches, panel discussions, and exclusive networking events.",
    price: 499,
    availableSeats: 75,
    totalSeats: 200,
    officialLink: "https://businessleadershipsummit.com"
  },
  {
    id: 4,
    name: "Culinary Festival",
    organizer: {
      name: "Gourmet Events",
      email: "taste@gourmetevents.com",
      phone: "+1 (555) 876-5432"
    },
    location: "Chicago, IL",
    date: "2025-07-08",
    time: "11:00 AM - 08:00 PM",
    images: [
      "../../../public/events/cf3.jpg",
      "../../../public/events/cf1.jpg",
      "../../../public/events/cf2.jpg"
    ],
    description: "Celebrate the art of cooking with world-renowned chefs, cooking demonstrations, tastings, and food competitions. Explore cuisines from around the world and discover new flavors and techniques.",
    price: 85,
    availableSeats: 350,
    totalSeats: 1000,
    officialLink: "https://culinaryfestival.com"
  }
];

// Get unique locations for filter dropdown
const locations = [...new Set(eventsData.map(event => event.location))];

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
    const filtered = eventsData.filter(event => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
    
    setFilteredEvents(filtered);
    
    // If current selection is no longer in filtered list, clear selection
    if (selectedEventId && !filtered.some(event => event.id === selectedEventId)) {
      setSelectedEventId(null);
    }
    
    // If this is initial load and we have events, select the first one
    if (!selectedEventId && filtered.length > 0) {
      setSelectedEventId(filtered[0].id);
    }
  }, [searchTerm, selectedEventId]);

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
    ? filteredEvents.find(event => event.id === selectedEventId) 
    : null;
  
  // Handle booking button click
  const handleBookNow = () => {
    if (!selectedEvent) return;
    
    // In a real app, this would send the booking data to a backend
    alert(`Booked ${ticketCount} ticket(s) for ${selectedEvent.name}!`);
    
    // You could also navigate to a confirmation page:
    // navigate("/confirmation");
  };
  
  // Calculate if the book now button should be disabled
  const isBookingDisabled = !selectedEvent || ticketCount <= 0 || ticketCount > (selectedEvent?.availableSeats || 0);
  
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
                <Grid item xs={12} key={event.id}>
                  <Card 
                    className="event-card" 
                    onClick={() => handleEventCardClick(event.id)}
                    sx={{
                      border: selectedEventId === event.id ? `2px solid #70c9c2` : 'none',
                      boxShadow: selectedEventId === event.id ? '0 0 8px rgba(112, 201, 194, 0.5)' : '0 2px 8px rgba(0, 0, 0, 0.1) !important',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={event.images[0]}
                      alt={event.name}
                      className="event-image"
                    />
                    <CardContent className="card-content">
                      <Typography
                        variant="h6"
                        component="div"
                        className="event-name"
                      >
                        {event.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="event-location"
                      >
                        <LocationOnIcon className="location-icon" />
                        {event.location}
                      </Typography>
                      <Typography
                        variant="body2"
                        className="event-date"
                      >
                        <EventIcon className="date-icon" />
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                        {event.description}
                      </Typography>
                      <Box className="seats-info">
                        <Typography variant="body2" className="seats-available">
                          {event.availableSeats} seats left
                        </Typography>
                        <Chip 
                          label={`$${event.price}`} 
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
                      {selectedEvent.name}
                    </Typography>
                    <Box className="event-details-meta">
                      <Typography variant="body1" className="event-details-location">
                        <LocationOnIcon sx={{ mr: 1 }} />
                        {selectedEvent.location}
                      </Typography>
                      <Typography variant="body1" className="event-details-date">
                        <EventIcon sx={{ mr: 1 }} />
                        {formatDate(selectedEvent.date)} • {selectedEvent.time}
                      </Typography>
                    </Box>
                  </Box>
                
                  {/* Image gallery */}
                  <Box className="image-gallery">
                    <Box className="main-image-container">
                      <img
                        src={selectedEvent.images[selectedImageIndex]}
                        alt={`${selectedEvent.name} - Large view`}
                        className="main-image"
                      />
                    </Box>
                    <Box className="thumbnail-container">
                      {selectedEvent.images.map((image, index) => (
                        <Box
                          key={index}
                          className={`thumbnail ${selectedImageIndex === index ? 'selected' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={image}
                            alt={`${selectedEvent.name} - Thumbnail ${index + 1}`}
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
                      {selectedEvent.description}
                    </Typography>
                  </Box>
                  
                  {/* Organizer info */}
                  <Box className="event-section">
                    <Typography variant="h6" className="section-title">
                      Organized by {selectedEvent.organizer.name}
                    </Typography>
                    <Box className="organizer-details">
                      <Box className="organizer-contact">
                        <Box className="contact-item">
                          <PhoneIcon className="contact-icon" />
                          <Typography variant="body2" sx={{ ml: 1 }}>{selectedEvent.organizer.phone}</Typography>
                        </Box>
                        <Box className="contact-item">
                          <MailIcon className="contact-icon" />
                          <Typography variant="body2" sx={{ ml: 1 }}>{selectedEvent.organizer.email}</Typography>
                        </Box>
                        <Box className="contact-item">
                          <LanguageIcon className="contact-icon" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            <a href={selectedEvent.officialLink} target="_blank" rel="noopener noreferrer">
                              Official Event Website
                            </a>
                          </Typography>
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
                        ${selectedEvent.price}
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
                        value={(selectedEvent.availableSeats / selectedEvent.totalSeats) * 100} 
                        className="seats-progress"
                        sx={{
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#70c9c2'
                          }
                        }}
                      />
                      <Typography variant="body2" className="seats-text">
                        {selectedEvent.availableSeats} out of {selectedEvent.totalSeats} seats available
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
                        {[...Array(Math.min(10, selectedEvent.availableSeats))].map((_, i) => (
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
                            ${selectedEvent.price} x {ticketCount} ticket(s)
                          </Typography>
                          <Typography variant="body2">
                            ${selectedEvent.price * ticketCount}
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
                            ${selectedEvent.price * ticketCount + 10 * ticketCount}
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