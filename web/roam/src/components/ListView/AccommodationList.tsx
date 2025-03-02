import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Header from "../Header/Header";
import "../Header/Header.css";
import "./AccommodationList.css";

type Accommodation = {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string;
};

const accommodations: Accommodation[] = [
  {
    id: 1,
    name: "Ocean View Apartment",
    location: "Miami, FL",
    image: "../../../public/Pasted image.png",
    description: "A beautiful ocean view apartment located in Miami, FL.",
  },
  {
    id: 2,
    name: "Mountain Cabin",
    location: "Aspen, CO",
    image: "../../../public/Pasted image.png",
    description:
      "A cozy mountain cabin surrounded by nature in Aspen, Colorado.",
  },
  {
    id: 3,
    name: "City Center Studio",
    location: "New York, NY",
    image: "../../../public/Pasted image.png",
    description:
      "A modern studio apartment located in the heart of New York City.",
  },
];

// Get unique locations for filter dropdown
const locations = [...new Set(accommodations.map((acc) => acc.location))];

const AccommodationList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredAccommodations, setFilteredAccommodations] =
    useState(accommodations);

  // Enhanced styles to fix the line issue, similar to AccommodationDetails.tsx
  const headerContainerStyle = {
    border: "none !important",
    borderBottom: "none !important",
    boxShadow: "none !important",
    outline: "none !important",
    background: "transparent !important",
  };

  const detailsContainerStyle = {
    border: "none !important",
    borderTop: "none !important",
    marginTop: "-60px", // Adjusted to position content better
    boxShadow: "none !important",
    outline: "none !important",
    position: "relative" as "relative",
    zIndex: 1,
  };

  useEffect(() => {
    // setup for doing a REST API call
    // Construct query string with parameters
    const queryParams = new URLSearchParams({
      location: locationFilter
    });

    // get data from backend based on REST API call
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/accommodations?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Check if response status is not ok
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        // Log the raw response text before parsing
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        // Try to parse the response as JSON
        try {
          const result: Accommodation[] = JSON.parse(responseText);
          console.log("lets' see response")
          console.log(result)

          // Filter accommodations based on search term only
          // Location filtering will be handled on the backend
          const filtered = accommodations.filter((accommodation) => {
            const matchesSearch =
              accommodation.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) 
                // ||
              // accommodation.description
              //   .toLowerCase()
              //   .includes(searchTerm.toLowerCase());

            return matchesSearch;
          });

          setFilteredAccommodations(filtered);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Failed to parse response");
        }

      } catch (error) {
        alert(error);
      }
    };

    fetchData();
  }, [searchTerm]);

  // In a real app, this would be replaced with an API call that sends
  // the locationFilter to the backend
  const handleLocationChange = (newLocation: string) => {
    setLocationFilter(newLocation);
    // In real implementation, would trigger API call here with the location parameter
  };

  const handleItemClick = (id: number) => {
    navigate(`/details/${id}`);
  };

  return (
    <div className="app">
      <Header />

      {/* Add the teal header as a background only */}
      <Box
        className="teal-header"
        style={{
          border: "none",
          outline: "none",
          boxShadow: "none",
          position: "absolute",
          zIndex: 0,
          left: 0,
          right: 0,
          margin: "0 auto",
          maxWidth:
            "1200px" /* Match main-content to keep consistent spacing */,
        }}
      ></Box>

      <main className="main-content">
        <h1 className="page-title">Find Your Perfect Stay</h1>
        <Box className="filter-container">
          <TextField
            className="search-input"
            placeholder="Search accommodations..."
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

        <Grid container spacing={3} className="accommodations-grid">
          {filteredAccommodations.map((accommodation) => (
            <Grid item xs={12} sm={6} md={4} key={accommodation.id}>
              <Card
                className="accommodation-card"
                onClick={() => handleItemClick(accommodation.id)}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={accommodation.image}
                  alt={accommodation.name}
                  className="accommodation-image"
                />
                <CardContent className="card-content">
                  <Typography
                    variant="h6"
                    component="div"
                    className="accommodation-name"
                  >
                    {accommodation.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="accommodation-location"
                  >
                    <LocationOnIcon className="location-icon" />
                    {accommodation.location}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="accommodation-description"
                  >
                    {accommodation.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {filteredAccommodations.length === 0 && (
            <Box className="no-results">
              <Typography variant="h6">
                No accommodations found matching your criteria
              </Typography>
            </Box>
          )}
        </Grid>
      </main>
    </div>
  );
};

export default AccommodationList;
