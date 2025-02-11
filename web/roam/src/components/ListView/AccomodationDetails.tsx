import React from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import "./AccomodationDetails.css"; // Import the CSS file

// Define the type for accommodation data
type Accommodation = {
  id: number;
  name: string;
  location: string;
  image: string;
  description: string;
};

// Dummy data for accommodations (same as in AccommodationList)
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

const AccommodationDetails: React.FC = () => {
  const { id } = useParams<{ id?: string }>();

  // Find the accommodation by ID
  const accommodation = accommodations.find(
    (item) => item.id === parseInt(id || "", 10)
  );

  if (!accommodation) {
    return (
      <Typography variant="h6" className="not-found">
        Accommodation not found.
      </Typography>
    );
  }

  return (
    <Container className="details-container">
      <Typography variant="h4" gutterBottom className="details-title">
        {accommodation.name}
      </Typography>
      <img
        src={accommodation.image}
        alt={accommodation.name}
        className="details-image"
      />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Location:
        <span className="details-location"> {accommodation.location}</span>
      </Typography>
      <Typography variant="body1" className="details-description">
        {accommodation.description}
      </Typography>
    </Container>
  );
};

export default AccommodationDetails;
