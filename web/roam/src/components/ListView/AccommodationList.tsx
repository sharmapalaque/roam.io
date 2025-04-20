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
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Header from "../Header/Header";
import "../Header/Header.css";
import "./AccommodationList.css";

type AccommodationUpdated = {
  ID: number;
  Name: string;
  Location: string;
  ImageUrls: string[];
  Description: string;
  Facilities: string[];
  UserReviews: string[];
};

// THIS OLD DUMMY DATA, KEEPING IT FOR FUTURE DEBUGGING PURPOSE
type Accommodation = {
  ID: number;
  Name: string;
  Location: string;
  ImageUrls: string;
  Description: string;
};

// AGAIN OLD DUMMY DATA FOR FUTURE TESTING/DEBUGGING
const accommodations: Accommodation[] = [
  {
    ID: 1,
    Name: "Ocean View Apartment",
    Location: "Miami, FL",
    ImageUrls: "../../../public/Pasted image.png",
    Description: "A beautiful ocean view apartment located in Miami, FL.",
  },
  {
    ID: 2,
    Name: "Mountain Cabin",
    Location: "Aspen, CO",
    ImageUrls: "../../../public/Pasted image.png",
    Description:
      "A cozy mountain cabin surrounded by nature in Aspen, Colorado.",
  },
  {
    ID: 3,
    Name: "City Center Studio",
    Location: "New York, NY",
    ImageUrls: "../../../public/Pasted image.png",
    Description:
      "A modern studio apartment located in the heart of New York City.",
  },
];

// Get unique locations for filter dropdown
const locations = [...new Set(accommodations.map((acc) => acc.Location))];

const AccommodationList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [filteredAccommodations, setFilteredAccommodations] = useState<
    AccommodationUpdated[]
  >([]);
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
          `http://localhost:8080/accommodations?${queryParams.toString()}`,
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
          const result: AccommodationUpdated[] = JSON.parse(responseText);
          console.log("lets' see response");
          console.log(result);

          // Filter accommodations based on search term only
          // Location filtering will be handled on the backend
          const filtered = result.filter((accommodation) => {
            const matchesSearch =
              accommodation.Name.toLowerCase().includes(
                searchTerm.toLowerCase()
              ) ||
              accommodation.Description.toLowerCase().includes(
                searchTerm.toLowerCase()
              );

            return matchesSearch;
          });
          
          // update the variable state holding list of accomodation
          setFilteredAccommodations(filtered);
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
            <Grid item xs={12} sm={6} md={4} key={accommodation.ID}>
              <Card
                className="accommodation-card"
                onClick={() => handleItemClick(accommodation.ID)}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={accommodation.ImageUrls[0]}
                  alt={accommodation.Name}
                  className="accommodation-image"
                />
                <CardContent className="card-content">
                  <Typography
                    variant="h6"
                    component="div"
                    className="accommodation-name"
                  >
                    {accommodation.Name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="accommodation-location"
                  >
                    <LocationOnIcon className="location-icon" />
                    {accommodation.Location}
                  </Typography>
                  <Typography
                    variant="body2"
                    className="accommodation-description"
                  >
                    {accommodation.Description}
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
