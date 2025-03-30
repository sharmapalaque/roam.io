import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Grid,
  Paper,
  Box,
  Button,
  TextField,
  Rating,
  Divider,
  Chip
} from "@mui/material";
import {
  Wifi, 
  LocalParking, 
  AcUnit, 
  Kitchen, 
  Pool, 
  Tv, 
  Home, 
  Star, 
  Phone, 
  Mail
} from "@mui/icons-material";
import Header from "../Header/Header";
import "./AccommodationDetails.css";

// Define the type for accommodation data with expanded properties
type Accommodation = {
  ID: number;
  Name: string;
  Location: string;
  ImageUrls: string[];
  Description: string;
  PricePerNight: number;
  Rating: number;
  UserReviews: Review[];
  Facilities: string[];
  Owner: {
    Name: string;
    Email: string;
    Phone: string;
    ResponseRate: string;
  };
};

// Define the type for reviews
type Review = {
  ID: number;
  UserName: string;
  Rating: number;
  Date: string;
  Comment: string;
};

// Enhanced dummy data for accommodations
const accommodations: Accommodation[] = [
  {
    ID: 1,
    Name: "Ocean View Apartment",
    Location: "Miami, FL",
    ImageUrls: [
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
    ],
    Description: 
      "A beautiful ocean view apartment located in Miami, FL. This luxurious apartment offers stunning views of the Atlantic Ocean from its private balcony. The interior features modern furnishings, a fully equipped kitchen, and high-end appliances. Perfect for couples or small families looking for a beach getaway.",
    PricePerNight: 249,
    Rating: 4.8,
    UserReviews: [
      {
        ID: 101,
        UserName: "Sarah J.",
        Rating: 5,
        Date: "August 15, 2023",
        Comment: "Absolutely spectacular views! The apartment was immaculately clean and had everything we needed. Will definitely return.",
      },
      {
        ID: 102,
        UserName: "Michael T.",
        Rating: 4.5,
        Date: "July 22, 2023",
        Comment: "Great location, just steps from the beach. The kitchen was well-stocked and the bed was very comfortable.",
      },
    ],
    Facilities: ["Wifi", "Parking", "Air Conditioning", "Full Kitchen", "Pool", "TV", "Ocean View"],
    Owner: {
      Name: "Jessica Miller",
      Email: "jessica@example.com",
      Phone: "+1 (305) 555-1234",
      ResponseRate: "97% within 24 hours",
    },
  },
  {
    ID: 2,
    Name: "Mountain Cabin",
    Location: "Aspen, CO",
    ImageUrls: [
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
    ],
    Description:
      "A cozy mountain cabin surrounded by nature in Aspen, Colorado. This authentic log cabin offers a rustic yet comfortable retreat with breathtaking mountain views. Features include a stone fireplace, spacious deck, and modern amenities while maintaining its charming character. Perfect for outdoor enthusiasts in all seasons.",
    PricePerNight: 319,
    Rating: 4.9,
    UserReviews: [
      {
        ID: 201,
        UserName: "Robert K.",
        Rating: 5,
        Date: "September 5, 2023",
        Comment: "The perfect mountain getaway! We loved the fireplace and the peaceful surroundings. Saw deer right from the deck!",
      },
      {
        ID: 202,
        UserName: "Emma L.",
        Rating: 4.7,
        Date: "August 3, 2023",
        Comment: "Very comfortable cabin with all the amenities we needed. Great location for hiking in summer.",
      },
    ],
    Facilities: ["Wifi", "Parking", "Fireplace", "Full Kitchen", "Hot Tub", "Mountain View", "Hiking Trails"],
    Owner: {
      Name: "Daniel Thompson",
      Email: "daniel@example.com",
      Phone: "+1 (970) 555-6789",
      ResponseRate: "95% within 24 hours",
    },
  },
  {
    ID: 3,
    Name: "City Center Studio",
    Location: "New York, NY",
    ImageUrls: [
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
      "../../../public/Pasted image.png",
    ],
    Description:
      "A modern studio apartment located in the heart of New York City. This stylish studio offers the perfect base for exploring all that NYC has to offer. Recently renovated with high-end finishes, the space includes a queen-sized bed, a fully equipped kitchenette, and a modern bathroom. Walking distance to major attractions, restaurants, and public transportation.",
    PricePerNight: 189,
    Rating: 4.6,
    UserReviews: [
      {
        ID: 301,
        UserName: "James B.",
        Rating: 4.8,
        Date: "October 12, 2023",
        Comment: "Fantastic location! We could walk to so many attractions. The apartment was clean and modern.",
      },
      {
        ID: 302,
        UserName: "Olivia P.",
        Rating: 4.5,
        Date: "September 28, 2023",
        Comment: "Perfect size for a couple, and so convenient to the subway. Loved our stay here!",
      },
    ],
    Facilities: ["Wifi", "Air Conditioning", "Kitchenette", "TV", "Washer/Dryer", "Subway Access"],
    Owner: {
      Name: "Rachel Green",
      Email: "rachel@example.com",
      Phone: "+1 (212) 555-4321",
      ResponseRate: "98% within 24 hours",
    },
  },
];

const AccommodationDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  // Create refs for date inputs
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [dateError, setDateError] = useState<string>("");
  const [accommodation, setAccommodation] = useState<Accommodation>(accommodations[0])

  // Enhanced styles to fix the line issue
  const headerContainerStyle = {
    border: 'none !important',
    borderBottom: 'none !important',
    boxShadow: 'none !important',
    outline: 'none !important',
    background: 'transparent !important'
  };

  const detailsContainerStyle = {
    border: 'none !important',
    borderTop: 'none !important',
    marginTop: '-60px', // Adjusted to position content better
    boxShadow: 'none !important',
    outline: 'none !important',
    position: 'relative' as 'relative',
    zIndex: 1
  };

  // Style for the teal header to match the list page
  const tealHeaderStyle = {
    border: 'none', 
    outline: 'none', 
    boxShadow: 'none',
    background: 'linear-gradient(to bottom, #70c9c2 0%, #70c9c2 40%, rgba(112, 201, 194, 0.95) 60%, rgba(112, 201, 194, 0.8) 70%, rgba(112, 201, 194, 0.5) 80%, rgba(112, 201, 194, 0.2) 90%, rgba(112, 201, 194, 0) 100%)',
    height: '150px',
    maxWidth: '93.65%',
  };

  // New style for header text positioning (left-aligned)
  const headerTextStyle = {
    paddingTop: '20px',
    marginTop: '10px',
    textAlign: 'left' as 'left',
    marginLeft: '15px',
    marginBottom: '5px' // Reduced margin between title and location
  };

  // API call
  useEffect(() => {
    // get data from backend based on REST API call
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/accommodations/${id}`,
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
          let result = JSON.parse(responseText);
          // console.log("lets' see response");
          // console.log(result);

          //setting the missing fields
          result.PricePerNight = accommodation.PricePerNight;
          result.Rating = accommodation.Rating;
          result.UserReviews = accommodation.UserReviews;
          result.Owner = accommodation.Owner;

          setAccommodation(result)

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
  }, []);
  
  // Handle check-in input click - focus on real input
  const handleCheckInClick = () => {
    if (checkInRef.current) {
      checkInRef.current.focus();
      // This opens the date picker in supported browsers
      try {
        checkInRef.current.showPicker();
      } catch (error) {
        // Fallback for browsers that don't support showPicker
        console.log("showPicker not supported in this browser");
      }
    }
  };

  // Handle check-out input click - focus on real input
  const handleCheckOutClick = () => {
    if (checkOutRef.current && checkInDate) {
      checkOutRef.current.focus();
      // This opens the date picker in supported browsers
      try {
        checkOutRef.current.showPicker();
      } catch (error) {
        // Fallback for browsers that don't support showPicker
        console.log("showPicker not supported in this browser");
      }
    }
  };

  // Handle change for check-in date
  const handleCheckInDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckInDate = e.target.value;
    setCheckInDate(newCheckInDate);
    
    // Clear checkout date if check-in date is after check-out date
    if (checkOutDate && new Date(newCheckInDate) >= new Date(checkOutDate)) {
      setCheckOutDate("");
      setDateError("Check-In Date must be before Check-Out Date");
    } else {
      setDateError("");
    }
  };

  // Handle change for check-out date
  const handleCheckOutDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckOutDate = e.target.value;
    setCheckOutDate(newCheckOutDate);
    
    // Validate if check-out date is after check-in date
    if (checkInDate && new Date(newCheckOutDate) <= new Date(checkInDate)) {
      setDateError("Check-In Date must be before Check-Out Date");
    } else {
      setDateError("");
    }
  };

  console.log("checking if accomo")
  if (!accommodation) {
    console.log("helloooooo")
    return (
      <Box sx={{ mt: "120px", textAlign: "center", padding: "2rem" }}>
        <Typography variant="h5" className="not-found">
          Accommodation not found.
        </Typography>
        <Button
          variant="contained"
          sx={{
            marginTop: 2,
            backgroundColor: "#70c9c2",
            "&:hover": { backgroundColor: "#5bb8b1" },
          }}
          onClick={() => navigate("/accommodation")}
        >
          Return to Accommodation List
        </Button>
      </Box>
    );
  }

  // Calculate total nights and total price
  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate) return 0;

    const diffTime = Math.abs(new Date(checkOutDate).getTime() - new Date(checkInDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays * accommodation.PricePerNight;
  };

  const totalNights = checkInDate && checkOutDate
    ? Math.ceil(Math.abs(new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = calculateTotalPrice();

  // Handle booking
  const handleBookNow = () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (dateError) {
      alert(dateError);
      return;
    }

    // Would normally send booking data to backend here
    // For now, just navigate to bookings page
    navigate("/profile/bookings");
  };

  // Map facility icons
  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case "wifi":
        return <Wifi />;
      case "parking":
        return <LocalParking />;
      case "air conditioning":
        return <AcUnit />;
      case "full kitchen":
      case "kitchenette":
        return <Kitchen />;
      case "pool":
      case "hot tub":
        return <Pool />;
      case "tv":
        return <Tv />;
      default:
        return <Home />;
    }
  };

  // Get min date for check-in (today's date)
  const today = new Date().toISOString().split('T')[0];
  
  // Get min date for check-out (day after check-in or today)
  const getMinCheckoutDate = () => {
    if (checkInDate) {
      const nextDay = new Date(checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay.toISOString().split('T')[0];
    }
    return today;
  };

  return (
    <>
      <Header />
      <Box className="details-page">
        {/* Teal header background with the matching gradient style */}
        <Box className="teal-header" style={tealHeaderStyle}>
          <Container maxWidth="lg" style={headerContainerStyle}>
            <Typography variant="h4" className="property-title" style={headerTextStyle}>
              {accommodation.Name}
            </Typography>
            <Typography variant="subtitle1" className="property-location" style={headerTextStyle}>
              {accommodation.Location}
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="lg" className="details-container" style={detailsContainerStyle}>
          <Grid container spacing={4}>
            {/* Left column: Property details */}
            <Grid item xs={12} md={8}>
              {/* Stars with white background box for better visibility */}
              <Box className="rating-container" sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                mt: 0, 
                mb: 2,
                backgroundColor: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
              }}>
                <Rating
                  value={accommodation.Rating}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography variant="body2" className="rating-value" sx={{ ml: 1 }}>
                  {accommodation.Rating} ({accommodation.UserReviews.length} UserReviews)
                </Typography>
              </Box>

              {/* Image gallery */}
              <Box className="image-gallery">
                <Box className="main-image-container">
                  <img
                    src={accommodation.ImageUrls[selectedImageIndex]}
                    alt={`${accommodation.Name} - Large view`}
                    className="main-image"
                  />
                </Box>
                <Box className="thumbnail-container">
                  {accommodation.ImageUrls.map((image, index) => (
                    <Box
                      key={index}
                      className={`thumbnail ${selectedImageIndex === index ? 'selected' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`${accommodation.Name} - Thumbnail ${index + 1}`}
                        className="thumbnail-image"
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Property description */}
              <Box className="property-section">
                <Typography variant="h6" className="section-title">
                  Description
                </Typography>
                <Typography variant="body1" className="description-text" align="left">
                  {accommodation.Description}
                </Typography>
              </Box>

              {/* Facilities */}
              <Box className="property-section">
                <Typography variant="h6" className="section-title">
                  Facilities
                </Typography>
                <Box className="facilities-container">
                  {accommodation.Facilities.map((facility, index) => (
                    <Chip
                      key={index}
                      icon={getFacilityIcon(facility)}
                      label={facility}
                      className="facility-chip"
                    />
                  ))}
                </Box>
              </Box>

              {/* Host info */}
              <Box className="property-section">
                <Typography variant="h6" className="section-title">
                  Hosted by {accommodation.Owner.Name}
                </Typography>
                <Box className="host-details">
                  <Box className="host-contact">
                    <Box className="contact-item">
                      <Phone className="contact-icon" />
                      <Typography variant="body2" sx={{ ml: 1 }}>{accommodation.Owner.Phone}</Typography>
                    </Box>
                    <Box className="contact-item">
                      <Mail className="contact-icon" />
                      <Typography variant="body2" sx={{ ml: 1 }}>{accommodation.Owner.Email}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" className="response-rate" sx={{ mt: 1 }}>
                    {/* Response rate removed as requested */}
                  </Typography>
                </Box>
              </Box>

              {/* Reviews */}
              <Box className="property-section">
                <Typography variant="h6" className="section-title">
                  Reviews
                </Typography>
                <Box className="reviews-container">
                  <Box className="overall-rating">
                    <Star className="star-icon" />
                    <Typography variant="h4" className="rating-number">
                      {accommodation.Rating}
                    </Typography>
                    <Typography variant="body2" className="rating-count">
                      ({accommodation.UserReviews.length} UserReviews)
                    </Typography>
                  </Box>
                  <Divider className="review-divider" />
                  {accommodation.UserReviews.map((review) => (
                    <Box key={review.ID} className="review-item">
                      <Box className="review-header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" className="reviewer-name">
                          {review.UserName}
                        </Typography>
                        <Typography variant="body2" className="review-date" color="text.secondary">
                          {review.Date}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Rating
                          value={review.Rating}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" className="review-comment">
                        {review.Comment}
                      </Typography>
                      <Divider className="review-divider" sx={{ mt: 2 }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right column: Booking panel - now starting at the same level as stars */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} className="booking-panel" sx={{ marginTop: 0 }}>
                <Typography variant="h6" className="booking-panel-title" align="center" gutterBottom>
                  Book This Property
                </Typography>
                <Box className="price-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h5" className="price" color="#70c9c2" fontWeight="bold">
                    ${accommodation.PricePerNight}
                  </Typography>
                  <Typography variant="body2" className="price-period" sx={{ ml: 1 }} color="text.secondary">
                    / night
                  </Typography>
                </Box>

                <Box className="date-picker-container">
                  <Typography variant="body2" gutterBottom align="left">Check-In Date</Typography>
                  <Box className="date-field-container" onClick={handleCheckInClick}>
                    <input
                      ref={checkInRef}
                      type="date"
                      value={checkInDate}
                      onChange={handleCheckInDateChange}
                      min={today}
                      className="custom-date-input"
                    />
                  </Box>
                </Box>
                
                <Box className="date-picker-container">
                  <Typography variant="body2" gutterBottom align="left">Check-Out Date</Typography>
                  <Box 
                    className={`date-field-container ${!checkInDate ? 'disabled' : ''}`} 
                    onClick={handleCheckOutClick}
                  >
                    <input
                      ref={checkOutRef}
                      type="date"
                      value={checkOutDate}
                      onChange={handleCheckOutDateChange}
                      min={getMinCheckoutDate()}
                      disabled={!checkInDate}
                      className="custom-date-input"
                    />
                  </Box>
                </Box>
                
                {dateError && (
                  <Typography 
                    variant="body2" 
                    color="error" 
                    className="date-error"
                  >
                    {dateError}
                  </Typography>
                )}

                <Box className="guests-container">
                  <Typography variant="body2" gutterBottom align="left">Guests</Typography>
                  <TextField
                    select
                    fullWidth
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    SelectProps={{
                      native: true,
                    }}
                    size="small"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </TextField>
                </Box>

                {checkInDate && checkOutDate && !dateError && (
                  <Box className="price-breakdown">
                    <Box className="breakdown-row" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        ${accommodation.PricePerNight} x {totalNights} nights
                      </Typography>
                      <Typography variant="body2">
                        ${accommodation.PricePerNight * totalNights}
                      </Typography>
                    </Box>
                    <Box className="breakdown-row" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Cleaning fee</Typography>
                      <Typography variant="body2">$50</Typography>
                    </Box>
                    <Box className="breakdown-row" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Service fee</Typography>
                      <Typography variant="body2">$30</Typography>
                    </Box>
                    <Divider className="breakdown-divider" sx={{ my: 1 }} />
                    <Box className="breakdown-row total" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body1" fontWeight="bold">
                        Total
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        ${totalPrice + 50 + 30}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  className="book-now-button"
                  onClick={handleBookNow}
                  disabled={!checkInDate || !checkOutDate || !!dateError}
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
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default AccommodationDetails;